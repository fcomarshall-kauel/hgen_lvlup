"use client";

import {
  AgentEventsEnum,
  LiveAvatarSession,
  SessionEvent,
  SessionState,
} from "@heygen/liveavatar-web-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

type SessionTokenResponse = {
  session_token?: string;
  error?: string;
  details?: { message?: string };
};

type FallbackReplyResponse = {
  reply?: string;
  error?: string;
};

interface LiveAvatarQuickstartProps {
  avatarId: string;
  voiceId: string;
  language?: string;
  contextId?: string;
  welcomeMessage?: string;
}

export default function InteractiveAvatarLiveAvatarQuickstart({
  avatarId,
  voiceId,
  language = "es",
  contextId,
  welcomeMessage,
}: LiveAvatarQuickstartProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const latestTranscriptRef = useRef("");
  const waitingAvatarReplyRef = useRef(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const speakEndedTimerRef = useRef<number | null>(null);

  const [sessionState, setSessionState] = useState(SessionState.INACTIVE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [lastUserTranscript, setLastUserTranscript] = useState("");

  const getSessionToken = useCallback(async (): Promise<string> => {
    const response = await fetch("/api/liveavatar/session-token", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        avatarId,
        voiceId,
        language,
        contextId,
      }),
    });

    const data = (await response.json()) as SessionTokenResponse;
    if (!response.ok || !data.session_token) {
      throw new Error(
        data?.details?.message ||
          data.error ||
          "Failed to create LiveAvatar session token.",
      );
    }

    return data.session_token;
  }, [avatarId, voiceId, language, contextId]);

  const stopSession = useCallback(async () => {
    try {
      await sessionRef.current?.stop();
    } catch (stopError) {
      console.error("Error stopping LiveAvatar session:", stopError);
    } finally {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      if (speakEndedTimerRef.current) {
        window.clearTimeout(speakEndedTimerRef.current);
        speakEndedTimerRef.current = null;
      }
      waitingAvatarReplyRef.current = false;
      sessionRef.current = null;
      setSessionState(SessionState.INACTIVE);
      latestTranscriptRef.current = "";
    }
  }, []);

  const getFallbackReply = useCallback(
    async (message: string): Promise<string> => {
      const response = await fetch("/api/liveavatar/reply", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message,
          institutionName: "Novandina",
          language,
        }),
      });

      const data = (await response.json()) as FallbackReplyResponse;
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Fallback reply failed.");
      }
      return data.reply;
    },
    [language],
  );

  const startSession = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await stopSession();
      const sessionToken = await getSessionToken();
      const session = new LiveAvatarSession(sessionToken, { voiceChat: true });

      session.on(SessionEvent.SESSION_STATE_CHANGED, (state) => {
        setSessionState(state);
      });

      session.on(SessionEvent.SESSION_STREAM_READY, async () => {
        if (!videoRef.current) {
          return;
        }

        session.attach(videoRef.current);
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn("Autoplay blocked:", playError);
        }
      });

      session.on(AgentEventsEnum.USER_TRANSCRIPTION, (event) => {
        const transcript = (event.text || "").trim();
        if (!transcript) {
          return;
        }

        setLastUserTranscript(transcript);
        latestTranscriptRef.current = transcript;

        // User is still speaking -- cancel any pending send from a previous pause.
        if (speakEndedTimerRef.current) {
          window.clearTimeout(speakEndedTimerRef.current);
          speakEndedTimerRef.current = null;
        }
      });

      session.on(AgentEventsEnum.USER_SPEAK_ENDED, () => {
        // Debounce: wait 1s after the last USER_SPEAK_ENDED before sending.
        // If the user keeps talking (new USER_TRANSCRIPTION arrives), the
        // timer is cancelled above, preventing premature sends on pauses.
        if (speakEndedTimerRef.current) {
          window.clearTimeout(speakEndedTimerRef.current);
        }

        speakEndedTimerRef.current = window.setTimeout(() => {
          speakEndedTimerRef.current = null;

          const transcript = latestTranscriptRef.current.trim();
          if (!transcript) {
            return;
          }

          // Clear immediately so stale text can never re-fire.
          latestTranscriptRef.current = "";

          session.message(transcript);
          waitingAvatarReplyRef.current = true;

          if (fallbackTimerRef.current) {
            window.clearTimeout(fallbackTimerRef.current);
          }
          fallbackTimerRef.current = window.setTimeout(() => {
            if (!waitingAvatarReplyRef.current) {
              return;
            }

            void getFallbackReply(transcript)
              .then((reply) => {
                session.repeat(reply);
              })
              .catch((fallbackError) => {
                console.error("Fallback reply error:", fallbackError);
                setError(
                  fallbackError instanceof Error
                    ? fallbackError.message
                    : "Fallback reply error.",
                );
              });
          }, 2500);
        }, 1000);
      });

      session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
        waitingAvatarReplyRef.current = false;
        if (fallbackTimerRef.current) {
          window.clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
      });

      await session.start();
      sessionRef.current = session;
      session.startListening();

      if (welcomeMessage?.trim()) {
        session.repeat(welcomeMessage.trim());
      }
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Unknown error");
      await stopSession();
    } finally {
      setIsLoading(false);
    }
  }, [getSessionToken, isLoading, stopSession, welcomeMessage]);

  const sendText = useCallback(() => {
    const activeSession = sessionRef.current;
    const cleaned = text.trim();

    if (!activeSession || !cleaned) {
      return;
    }

    activeSession.message(cleaned);
    waitingAvatarReplyRef.current = true;
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
    }
    fallbackTimerRef.current = window.setTimeout(() => {
      if (!waitingAvatarReplyRef.current) {
        return;
      }
      void getFallbackReply(cleaned)
        .then((reply) => {
          activeSession.repeat(reply);
        })
        .catch((fallbackError) => {
          console.error("Fallback reply error:", fallbackError);
          setError(
            fallbackError instanceof Error
              ? fallbackError.message
              : "Fallback reply error.",
          );
        });
    }, 1800);
    setText("");
  }, [getFallbackReply, text]);

  useEffect(() => {
    return () => {
      void stopSession();
    };
  }, [stopSession]);

  const isConnected = sessionState === SessionState.CONNECTED;

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="h-[52%] p-3" style={{ borderBottom: "1px solid #d4cce8" }}>
        <div className="h-full w-full rounded-lg overflow-hidden" style={{ backgroundColor: "#1a1040" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="p-3 bg-white flex items-center gap-2" style={{ borderBottom: "1px solid #d4cce8" }}>
        <button
          type="button"
          onClick={() => void startSession()}
          disabled={isLoading || isConnected}
          className="text-white px-5 py-2 rounded-md text-sm font-medium disabled:opacity-60 transition-colors"
          style={{ backgroundColor: isConnected ? "#6b52d4" : "#4126b4" }}
        >
          {isLoading
            ? "Conectando..."
            : isConnected
              ? "Sesion activa"
              : "Iniciar sesion"}
        </button>
        <button
          type="button"
          onClick={() => void stopSession()}
          className="bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Terminar
        </button>
        <span className="text-xs ml-auto" style={{ color: "#4126b4" }}>{sessionState}</span>
      </div>

      <div className="p-3 bg-white flex gap-2" style={{ borderBottom: "1px solid #d4cce8" }}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendText();
            }
          }}
          placeholder="Escribe tu mensaje..."
          className="flex-1 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ border: "1px solid #d4cce8", focusRingColor: "#4126b4" }}
          disabled={!isConnected}
        />
        <button
          type="button"
          onClick={sendText}
          disabled={!isConnected || !text.trim()}
          className="text-white px-5 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
          style={{ backgroundColor: "#4126b4" }}
        >
          Enviar
        </button>
      </div>

      <div className="flex-1 min-w-0 p-3 text-sm overflow-y-auto" style={{ backgroundColor: "#f8f6fc", color: "#4126b4" }}>
        {lastUserTranscript ? (
          <p className="break-words whitespace-pre-wrap">Transcripcion usuario: {lastUserTranscript}</p>
        ) : (
          <p style={{ color: "#9b8dc7" }}>Esperando audio del usuario...</p>
        )}
        {error ? <p className="mt-2 break-words" style={{ color: "#dc2626" }}>{error}</p> : null}
      </div>
    </div>
  );
}
