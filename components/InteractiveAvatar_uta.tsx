import type { StartAvatarResponse } from "@heygen/streaming-avatar";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents, TaskMode, TaskType, VoiceEmotion,
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Spinner,
  Chip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn } from "ahooks";
import Image from "next/image";

import InteractiveAvatarTextInput from "./InteractiveAvatarTextInput";
import ConversationStatus from "./ConversationStatus";

import {AVATARS, SIMULATIONS, STT_LANGUAGE_LIST, VOICES} from "@/app/lib/constants";

export default function InteractiveAvatarUta() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  
  // Pre-configured values for UTA
  const [knowledgeId, setKnowledgeId] = useState<string>("6c3a2a0696a747d0aaac390f3f6910ec"); // Tara UTA
  const [avatarId, setAvatarId] = useState<string>("Marianne_Chair_Sitting_public"); // Mujer Oficina
  const [language, setLanguage] = useState<string>('es');
  const [voiceId, setVoiceId] = useState<string>("8c40eafefd494b3f9b072d69325d5f15"); // Tara

  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState<'text_mode' | 'voice_mode'>('text_mode');
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      console.log("Access Token:", token);
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
    return "";
  }

  async function startVoiceChat() {
    try {
      console.log("🎤 Starting voice chat...");
      
      if (!avatar.current) {
        throw new Error("Avatar not available");
      }

      await avatar.current.startVoiceChat({
        useSilencePrompt: true
      });
      setIsVoiceChatActive(true);
      console.log("✅ Voice chat started");
      return true;
    } catch (error) {
      console.error("❌ Error starting voice chat:", error);
      setIsVoiceChatActive(false);
      return false;
    }
  }

  async function stopVoiceChat() {
    try {
      console.log("🛑 Stopping voice chat...");
      
      if (avatar.current) {
        await avatar.current.closeVoiceChat();
      }
      
      setIsVoiceChatActive(false);
      setIsUserTalking(false);
      setLastTranscript("");
      console.log("✅ Voice chat stopped");
    } catch (error) {
      console.error("❌ Error stopping voice chat:", error);
    }
  }

  async function startSession() {
    setIsLoadingSession(true);
    const newToken = await fetchAccessToken();

    avatar.current = new StreamingAvatar({
      token: newToken,
    });

    // Set up event listeners
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log("Avatar started talking", e);
      setIsAvatarTalking(true);
    });
    
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log("Avatar stopped talking", e);
      setIsAvatarTalking(false);
    });
    
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("Stream disconnected");
      endSession();
    });
    
    avatar.current.on(StreamingEvents.STREAM_READY, (event) => {
      console.log("Stream ready:", event.detail);
      setStream(event.detail);
    });

    // Simplified user talking events
    avatar.current.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
      console.log('User talking:', event);
      if (event.detail && event.detail.message) {
        setIsUserTalking(true);
        setLastTranscript(event.detail.message);
      }
    });

    avatar.current.on(StreamingEvents.USER_END_MESSAGE, (event) => {
      console.log('User finished talking:', event);
      setIsUserTalking(false);
      if (event.detail && event.detail.message) {
        setLastTranscript(event.detail.message);
        // The avatar will automatically respond based on knowledgeId
        // No need to manually call speak() here
      }
    });

    avatar.current.on(StreamingEvents.USER_START, (event) => {
      console.log('User started interaction:', event);
      setIsUserTalking(true);
    });

    avatar.current.on(StreamingEvents.USER_STOP, (event) => {
      console.log('User stopped interaction:', event);
      setIsUserTalking(false);
    });

    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: avatarId,
        knowledgeId: knowledgeId, 
        voice: {
          voiceId: voiceId,
          rate: 1.0,
          emotion: VoiceEmotion.FRIENDLY,
        },
        language: language,
        disableIdleTimeout: false
      });

      setData(res);
      console.log("✅ Avatar session created:", res);
      
      // Welcome message using REPEAT to avoid knowledge base interference
      await avatar.current.speak({
        text: "¡Hola! Soy Tara, tu asistente virtual de la Universidad de Tarapacá. Es un gusto conocerte. Estoy aquí para apoyarte en tu formación académica y resolver cualquier consulta que tengas sobre nuestros programas, servicios universitarios y vida estudiantil. ¿En qué puedo ayudarte hoy?",
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      });
      
    } catch (error) {
      console.error("Error starting avatar session:", error);
      setDebug(`Session error: ${error}`);
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function handleSpeak() {
    setIsLoadingRepeat(true);
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
    
    try {
      await avatar.current.speak({ 
        text: text, 
        taskType: TaskType.TALK, 
        taskMode: TaskMode.SYNC 
      });
      setText(""); // Clear input after sending
    } catch (e: any) {
      setDebug(e.message);
      console.error("Error speaking:", e);
    } finally {
      setIsLoadingRepeat(false);
    }
  }

  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
    try {
      await avatar.current.interrupt();
    } catch (e: any) {
      setDebug(e.message);
      console.error("Error interrupting:", e);
    }
  }

  async function endSession() {
    try {
      if (isVoiceChatActive) {
        await stopVoiceChat();
      }
      await avatar.current?.stopAvatar();
      setStream(undefined);
      setData(undefined);
      setDebug("");
    } catch (error) {
      console.error("Error ending session:", error);
    }
  }

  const handleChangeChatMode = useMemoizedFn(async (v) => {
    if (v === chatMode) {
      return;
    }
    console.log(`Changing mode from ${chatMode} to ${v}`);
    
    setChatMode(v);
    
    if (v === "text_mode") {
      if (isVoiceChatActive) {
        await stopVoiceChat();
      }
    } else if (v === "voice_mode") {
      if (avatar.current && stream && !isVoiceChatActive) {
        await startVoiceChat();
      }
    }
  });

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-1">
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardBody className="h-[380px] flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-50">
          {stream ? (
            <div className="h-[380px] w-full justify-center items-center flex rounded-lg overflow-hidden border-4 border-blue-300 shadow-inner">
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              >
                <track kind="captions" />
              </video>
              <div className="flex flex-col gap-1 absolute bottom-2 right-2">
                <Button
                  className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  size="sm"
                  variant="shadow"
                  onClick={handleInterrupt}
                  disabled={!isAvatarTalking}
                >
                  Interrumpir
                </Button>
                <Button
                  className="bg-gradient-to-tr from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  size="sm"
                  variant="shadow"
                  onClick={endSession}
                >
                  Terminar
                </Button>
              </div>

              {/* Conversation Status Component */}
              <ConversationStatus
                isVoiceChatActive={isVoiceChatActive}
                isUserTalking={isUserTalking}
                isAvatarTalking={isAvatarTalking}
                isProcessing={isProcessing}
                lastTranscript={lastTranscript}
                chatMode={chatMode}
                mode="overlay"
              />
            </div>
          ) : !isLoadingSession ? (
            <div className="h-full justify-center items-center flex flex-col gap-3 w-[400px] self-center">
              <div className="text-center">
                <h2 className="text-lg font-bold text-blue-800 mb-1">🎓 Asistente Virtual UTA</h2>
                <p className="text-blue-600 text-xs">Universidad de Tarapacá</p>
                <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-1"></div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 relative">
                  <Image
                    src="/tara_pic.png"
                    alt="Tara - Asistente Virtual UTA"
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-3 shadow-lg"
                    style={{
                      width: "120%",
                      height: "120%",
                    }}
                  />
                </div>
                <h3 className="text-base font-bold text-blue-800 mb-1">Conoce a Tara</h3>
                <p className="text-blue-600 text-xs leading-relaxed max-w-xs mx-auto">
                  Tu asistente virtual especializada en información académica de la Universidad de Tarapacá.
                </p>
              </div>
              
              <Button
                className="bg-gradient-to-tr from-blue-600 to-indigo-600 w-full text-white font-semibold text-base py-4 shadow-lg hover:shadow-xl transition-all"
                size="md"
                variant="shadow"
                onClick={startSession}
              >
                🚀 Iniciar Conversación con Tara
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Spinner color="primary" size="md" />
              <p className="text-blue-600 font-medium text-sm">Conectando con Tara...</p>
            </div>
          )}
        </CardBody>
        <Divider className="bg-blue-200" />
        <CardFooter className="flex flex-col gap-1 relative bg-gradient-to-br from-blue-50 to-white py-2">
          {/* Mode control */}
          <div className="bg-white p-2 rounded-lg shadow border border-gray-200 mb-1 w-full">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xs font-medium text-gray-700">Modo:</span>
              <div className="flex">
                <button
                  onClick={() => handleChangeChatMode("text_mode")}
                  className={`py-1 px-3 text-xs font-medium rounded-l-lg border transition-colors ${
                    chatMode === "text_mode"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  💬 Texto
                </button>
                <button
                  onClick={() => handleChangeChatMode("voice_mode")}
                  className={`py-1 px-3 text-xs font-medium rounded-r-lg border-l-0 border transition-colors relative ${
                    chatMode === "voice_mode"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                  disabled={!stream}
                >
                  🎤 Voz Continua
                </button>
              </div>
            </div>
          </div>

          {/* Content based on mode */}
          {chatMode === "voice_mode" ? (
            stream ? (
              <ConversationStatus
                isVoiceChatActive={isVoiceChatActive}
                isUserTalking={isUserTalking}
                isAvatarTalking={isAvatarTalking}
                isProcessing={isProcessing}
                lastTranscript={lastTranscript}
                chatMode={chatMode}
                mode="panel"
              />
            ) : (
              <div className="bg-white p-2 rounded-lg shadow border border-gray-200 w-full">
                <div className="text-center py-2">
                  <div className="text-gray-400 text-2xl mb-1">🎤</div>
                  <p className="text-xs text-gray-500">
                    Inicia la conversación primero para usar el modo voz
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="w-full flex relative">
              <InteractiveAvatarTextInput
                disabled={!stream}
                input={text}
                label="Pregunta a UTA"
                loading={isLoadingRepeat}
                placeholder="¿Qué quieres saber sobre UTA?..."
                setInput={setText}
                onSubmit={handleSpeak}
              />
            </div>
          )}
        </CardFooter>
      </Card>
      <p className="font-mono text-right text-blue-600 text-xs">
        <span className="font-bold">📊 Estado:</span> {
          debug || 
          (stream 
            ? `✅ Conectado - Modo ${chatMode === "voice_mode" ? "🎤 Voz" : "💬 Texto"} ${isVoiceChatActive ? "(Activo)" : ""}`
            : `⚪ Sin conexión - Modo ${chatMode === "voice_mode" ? "🎤 Voz" : "💬 Texto"} seleccionado`
          )
        }
      </p>
    </div>
  );
} 