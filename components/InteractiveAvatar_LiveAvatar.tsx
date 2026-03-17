"use client";

import {
  AgentEventsEnum,
  LiveAvatarSession,
  SessionEvent,
  SessionState,
} from "@heygen/liveavatar-web-sdk";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type ConversationMessage = {
  id: string;
  type: "user" | "avatar";
  content: string;
};

interface InteractiveAvatarLiveAvatarProps {
  avatarId: string;
  voiceId: string;
  providerVoiceId?: string;
  language?: string;
  contextId?: string;
  avatarName: string;
  institutionName: string;
  avatarImage?: string;
  welcomeMessage: string;
  placeholderText?: string;
  buttonText?: string;
}

type SessionTokenResponse = {
  session_id: string;
  session_token: string;
};

type EnsureThirdPartyVoiceResponse = {
  voice_id: string;
  error?: string;
  details?: { message?: string };
};

type FallbackReplyResponse = {
  reply?: string;
  error?: string;
};

export default function InteractiveAvatarLiveAvatar({
  avatarId,
  voiceId,
  providerVoiceId,
  language = "es",
  contextId,
  avatarName,
  institutionName,
  avatarImage,
  welcomeMessage,
  placeholderText,
  buttonText,
}: InteractiveAvatarLiveAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const resolvedVoiceIdRef = useRef<string>(voiceId);
  const isStartingRef = useRef(false);
  const hasWelcomedRef = useRef(false);
  const latestUserTranscriptRef = useRef("");
  const awaitingVoiceReplyRef = useRef(false);
  const voiceReplyFallbackTimerRef = useRef<number | null>(null);
  const lastFallbackMessageRef = useRef<{ text: string; at: number } | null>(
    null,
  );

  const [sessionState, setSessionState] = useState<SessionState>(
    SessionState.INACTIVE,
  );
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ConversationMessage[]>([]);

  const addMessage = useCallback((type: "user" | "avatar", content: string) => {
    const cleaned = content.trim();

    if (!cleaned) {
      return;
    }

    setHistory((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        type,
        content: cleaned,
      },
    ]);
  }, []);

  useEffect(() => {
    resolvedVoiceIdRef.current = voiceId;
  }, [voiceId]);

  const ensureLiveAvatarVoiceId = useCallback(async (): Promise<string> => {
    if (!providerVoiceId) {
      return resolvedVoiceIdRef.current;
    }

    // Reuse previously resolved LiveAvatar voice id in this client session.
    if (resolvedVoiceIdRef.current && resolvedVoiceIdRef.current !== providerVoiceId) {
      return resolvedVoiceIdRef.current;
    }

    const response = await fetch("/api/liveavatar/voices/ensure-third-party", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        providerVoiceId,
        importedVoiceName: `${institutionName} ElevenLabs Voice`,
        secretName: `${institutionName}-elevenlabs`,
      }),
    });

    const data = (await response.json()) as EnsureThirdPartyVoiceResponse;
    if (!response.ok || !data.voice_id) {
      const detailsMessage = data?.details?.message;
      throw new Error(
        detailsMessage || data.error || "Unable to ensure third-party voice.",
      );
    }

    resolvedVoiceIdRef.current = data.voice_id;
    return data.voice_id;
  }, [institutionName, providerVoiceId]);

  const getFallbackAssistantReply = useCallback(
    async (message: string): Promise<string> => {
      const response = await fetch("/api/liveavatar/reply", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message,
          institutionName,
          language,
        }),
      });

      const data = (await response.json()) as FallbackReplyResponse;
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Unable to generate assistant fallback reply.");
      }

      return data.reply;
    },
    [institutionName, language],
  );

  const getSessionToken = useCallback(async (): Promise<string> => {
    const effectiveVoiceId = await ensureLiveAvatarVoiceId();

    const response = await fetch("/api/liveavatar/session-token", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        avatarId,
        voiceId: effectiveVoiceId,
        language,
        contextId,
      }),
    });

    const data = (await response.json()) as SessionTokenResponse & {
      error?: string;
      details?: { message?: string };
    };

    if (!response.ok || !data.session_token) {
      const detailsMessage = data?.details?.message;
      throw new Error(
        detailsMessage ||
          data.error ||
          "Unable to create LiveAvatar session token.",
      );
    }

    return data.session_token;
  }, [avatarId, language, contextId, ensureLiveAvatarVoiceId]);

  const stopSession = useCallback(async () => {
    try {
      const activeSession = sessionRef.current;

      if (activeSession) {
        await activeSession.stop();
      }
    } catch (stopError) {
      console.error("Error stopping LiveAvatar session:", stopError);
    } finally {
      sessionRef.current = null;
      hasWelcomedRef.current = false;
      latestUserTranscriptRef.current = "";
      awaitingVoiceReplyRef.current = false;
      lastFallbackMessageRef.current = null;
      if (voiceReplyFallbackTimerRef.current) {
        window.clearTimeout(voiceReplyFallbackTimerRef.current);
        voiceReplyFallbackTimerRef.current = null;
      }
      setIsSessionStarted(false);
      setStreamReady(false);
      setIsAvatarTalking(false);
      setIsUserTalking(false);
      setLastTranscript("");
      setSessionState(SessionState.INACTIVE);
    }
  }, []);

  const startSession = useCallback(async () => {
    if (isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;
    setError("");
    setIsLoadingSession(true);
    setHistory([]);

    try {
      await stopSession();
      const sessionToken = await getSessionToken();

      const session = new LiveAvatarSession(sessionToken, {
        voiceChat: true,
      });
      let resolveStreamReady: (() => void) | null = null;
      const streamReadyPromise = new Promise<void>((resolve) => {
        resolveStreamReady = resolve;
      });

      session.on(SessionEvent.SESSION_STATE_CHANGED, (state) => {
        setSessionState(state);
      });

      session.on(SessionEvent.SESSION_STREAM_READY, async () => {
        if (videoRef.current) {
          session.attach(videoRef.current);
          try {
            await videoRef.current.play();
          } catch (playError) {
            console.warn("Video autoplay was blocked:", playError);
          }
          setStreamReady(true);
        }
        if (resolveStreamReady) {
          resolveStreamReady();
        }
      });

      session.on(SessionEvent.SESSION_DISCONNECTED, () => {
        setStreamReady(false);
        setIsAvatarTalking(false);
        setIsUserTalking(false);
      });

      session.on(AgentEventsEnum.USER_SPEAK_STARTED, () => {
        setIsUserTalking(true);
      });

      session.on(AgentEventsEnum.USER_SPEAK_ENDED, () => {
        setIsUserTalking(false);

        const activeSession = sessionRef.current;
        const latestTranscript = latestUserTranscriptRef.current.trim();

        if (!activeSession || !latestTranscript) {
          return;
        }

        const now = Date.now();
        const lastSent = lastFallbackMessageRef.current;
        if (
          lastSent &&
          lastSent.text === latestTranscript &&
          now - lastSent.at < 4000
        ) {
          return;
        }

        awaitingVoiceReplyRef.current = true;
        if (voiceReplyFallbackTimerRef.current) {
          window.clearTimeout(voiceReplyFallbackTimerRef.current);
        }

        // Fallback: if conversational mode does not trigger a reply event,
        // generate a backend LLM reply and speak it explicitly.
        voiceReplyFallbackTimerRef.current = window.setTimeout(() => {
          if (!awaitingVoiceReplyRef.current) {
            return;
          }
          activeSession.stopListening();
          void getFallbackAssistantReply(latestTranscript)
            .then((reply) => {
              activeSession.repeat(reply);
              addMessage("avatar", reply);
            })
            .catch((fallbackError) => {
              console.error("Fallback reply error:", fallbackError);
              setError(
                fallbackError instanceof Error
                  ? fallbackError.message
                  : "No fue posible generar respuesta del asistente.",
              );
            });
          lastFallbackMessageRef.current = {
            text: latestTranscript,
            at: Date.now(),
          };
          awaitingVoiceReplyRef.current = false;
        }, 1500);
      });

      session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
        awaitingVoiceReplyRef.current = false;
        if (voiceReplyFallbackTimerRef.current) {
          window.clearTimeout(voiceReplyFallbackTimerRef.current);
          voiceReplyFallbackTimerRef.current = null;
        }
        setIsAvatarTalking(true);
      });

      session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
        setIsAvatarTalking(false);
        session.startListening();
      });

      session.on(AgentEventsEnum.USER_TRANSCRIPTION, (event) => {
        const transcript = event.text?.trim() || "";
        if (!transcript) {
          return;
        }

        latestUserTranscriptRef.current = transcript;
        setLastTranscript(transcript);
        addMessage("user", transcript);
      });

      session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, (event) => {
        addMessage("avatar", event.text);
      });

      await session.start();
      sessionRef.current = session;
      setIsSessionStarted(true);
      session.startListening();

      // Fallback: in some SDK/browser combos SESSION_STREAM_READY may be delayed.
      // Attach once after start so media can still render/play.
      if (!streamReady && videoRef.current) {
        session.attach(videoRef.current);
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn("Video autoplay was blocked after start:", playError);
        }
      }

      // Wait briefly for stream-ready to avoid issuing commands before media is attached.
      await Promise.race([
        streamReadyPromise,
        new Promise<void>((resolve) => setTimeout(resolve, 4000)),
      ]);

      // Final fallback for UI state if media attachment succeeded but event was missed.
      if (!streamReady && videoRef.current?.srcObject) {
        setStreamReady(true);
      }

      if (welcomeMessage.trim() && !hasWelcomedRef.current) {
        hasWelcomedRef.current = true;
        session.repeat(welcomeMessage);
        addMessage("avatar", welcomeMessage);
      }
    } catch (startError) {
      console.error("Error starting LiveAvatar session:", startError);
      setError(
        startError instanceof Error
          ? startError.message
          : "Unknown startup error",
      );
      await stopSession();
    } finally {
      isStartingRef.current = false;
      setIsLoadingSession(false);
    }
  }, [addMessage, getSessionToken, getFallbackAssistantReply, stopSession, welcomeMessage]);

  const handleSendText = useCallback(() => {
    const activeSession = sessionRef.current;
    const cleaned = text.trim();

    if (!activeSession || !cleaned) {
      return;
    }

    addMessage("user", cleaned);
    activeSession.stopListening();
    void getFallbackAssistantReply(cleaned)
      .then((reply) => {
        activeSession.repeat(reply);
        addMessage("avatar", reply);
      })
      .catch((fallbackError) => {
        console.error("Fallback reply error:", fallbackError);
        setError(
          fallbackError instanceof Error
            ? fallbackError.message
            : "No fue posible generar respuesta del asistente.",
        );
      })
      .finally(() => {
        setText("");
      });
  }, [addMessage, getFallbackAssistantReply, text]);

  const handleInterrupt = useCallback(() => {
    sessionRef.current?.interrupt();
  }, []);

  useEffect(() => {
    return () => {
      void stopSession();
    };
  }, [stopSession]);

  useEffect(() => {
    if (!isSessionStarted || streamReady) {
      return;
    }

    const retryInterval = window.setInterval(async () => {
      const activeSession = sessionRef.current;
      const element = videoRef.current;

      if (!activeSession || !element) {
        return;
      }

      activeSession.attach(element);
      if (element.srcObject) {
        try {
          await element.play();
        } catch (playError) {
          console.warn("Video autoplay was blocked on retry:", playError);
        }
        setStreamReady(true);
      }
    }, 500);

    const stopRetryTimeout = window.setTimeout(() => {
      window.clearInterval(retryInterval);
    }, 10000);

    return () => {
      window.clearInterval(retryInterval);
      window.clearTimeout(stopRetryTimeout);
    };
  }, [isSessionStarted, streamReady]);

  const isConnected = sessionState === SessionState.CONNECTED;

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="min-h-[260px] h-[38vh] max-h-[420px] bg-gradient-to-br from-red-50 via-white to-red-50 border-b border-red-100 p-4">
        {isSessionStarted ? (
          <div className="h-full w-full rounded-lg overflow-hidden border-2 border-red-200 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            {!streamReady ? (
              <div className="absolute inset-0 bg-black/40 text-white text-sm flex items-center justify-center">
                Conectando video del avatar...
              </div>
            ) : null}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                className="bg-red-600 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
                disabled={!isConnected || !isAvatarTalking}
                type="button"
                onClick={handleInterrupt}
              >
                Interrumpir
              </button>
              <button
                className="bg-gray-800 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
                disabled={!isConnected && !isLoadingSession}
                type="button"
                onClick={() => void stopSession()}
              >
                Terminar
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            {avatarImage ? (
              <Image
                alt={`${avatarName} avatar`}
                className="rounded-full mb-3 border border-red-200"
                height={88}
                src={avatarImage}
                width={88}
              />
            ) : null}
            <h3 className="text-lg font-semibold text-red-800">
              Habla con {avatarName}
            </h3>
            <p className="text-sm text-red-700">{institutionName}</p>
            <button
              className="mt-4 bg-red-600 text-white px-5 py-2 rounded-md font-medium disabled:opacity-60"
              disabled={isLoadingSession}
              type="button"
              onClick={() => void startSession()}
            >
              {isLoadingSession
                ? "Conectando..."
                : buttonText || `Iniciar conversacion con ${avatarName}`}
            </button>
          </div>
        )}
      </div>

      <div className="p-3 border-b border-red-100 bg-red-50/40 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isUserTalking
                ? "bg-red-500 animate-pulse"
                : isAvatarTalking
                  ? "bg-orange-500 animate-pulse"
                  : isConnected
                    ? "bg-green-500"
                    : "bg-gray-300"
            }`}
          />
          <span className="text-gray-700">
            {isUserTalking
              ? "Usuario hablando"
              : isAvatarTalking
                ? `${avatarName} respondiendo`
                : isConnected
                  ? "Sesion activa"
                  : "Sesion inactiva"}
          </span>
        </div>
        <span className="text-xs text-gray-500">{sessionState}</span>
      </div>

      <div className="p-3 border-b border-red-100 bg-white">
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100"
            disabled={!isConnected}
            placeholder={placeholderText || `Pregunta a ${avatarName}...`}
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSendText();
              }
            }}
          />
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
            disabled={!isConnected || !text.trim()}
            type="button"
            onClick={handleSendText}
          >
            Enviar
          </button>
        </div>
        {lastTranscript ? (
          <p className="text-xs text-gray-600 mt-2">
            Ultima voz: {lastTranscript}
          </p>
        ) : null}
        {error ? <p className="text-xs text-red-600 mt-2">{error}</p> : null}
      </div>

      <div className="flex-1 min-h-0 p-3 overflow-y-auto bg-gray-50">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Sin mensajes todavia.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {[...history].reverse().map((message) => (
              <div
                key={message.id}
                className={`rounded-md px-3 py-2 text-sm ${
                  message.type === "user"
                    ? "bg-red-100 text-red-900 self-end"
                    : "bg-white border border-gray-200 text-gray-800 self-start"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
