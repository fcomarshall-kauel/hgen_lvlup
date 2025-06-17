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
  const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(null);

  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptExiting, setTranscriptExiting] = useState(false);
  const [userTalkingMessageCount, setUserTalkingMessageCount] = useState(0);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);


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

  async function startContinuousVoiceChat() {
    try {
      console.log("🎤 Iniciando conversación de voz continua...");
      
      if (!avatar.current) {
        throw new Error("Avatar not available");
      }

      await avatar.current.startVoiceChat();
      setIsVoiceChatActive(true);
      console.log("✅ Conversación de voz activa");
      return true;
    } catch (error) {
      console.error("❌ Error iniciando conversación de voz:", error);
      setIsVoiceChatActive(false);
      return false;
    }
  }

  async function stopContinuousVoiceChat() {
    try {
      console.log("🛑 Deteniendo conversación de voz...");
      
      if (avatar.current) {
        avatar.current.closeVoiceChat();
      }
      
      setIsVoiceChatActive(false);
      setIsUserTalking(false); // Reset talking state
      setShowTranscript(false); // Hide transcript
      setLastTranscript(""); // Clear transcript
      console.log("✅ Conversación de voz detenida");
    } catch (error) {
      console.error("❌ Error deteniendo conversación de voz:", error);
    }
  }

  async function startSession() {
    setIsLoadingSession(true);
    const newToken = await fetchAccessToken();

    avatar.current = new StreamingAvatar({
      token: newToken,
    });
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log("Avatar started talking", e);
    });
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log("Avatar stopped talking", e);
    });
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("Stream disconnected");
      endSession();
    });
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log(">>>>> Stream ready:", event.detail);
      setStream(event.detail);
    });
    avatar.current?.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
      console.log('>>>>> USER_TALKING_MESSAGE event:', event);
      
      // Filter out the specific welcome message
      if (event.detail && event.detail.message) {
        const message = event.detail.message;
        if (message.includes("¡Hola! Soy Tara, tu asistente virtual de la Universidad de Tarapacá - UTA")) {
          console.log("🤖 Mensaje de bienvenida específico ignorado:", message);
          return;
        }
        
        console.log("🎤 Usuario realmente hablando - MOSTRAR:", message);
        setIsUserTalking(true);
        setLastTranscript(message);
        setTranscriptExiting(false);
        setShowTranscript(true);
        
        // Auto hide after 8 seconds to give more time to read
        setTimeout(() => {
          setTranscriptExiting(true);
          setTimeout(() => {
            setShowTranscript(false);
            setTranscriptExiting(false);
            setIsUserTalking(false); // Reset talking state when hiding
          }, 500);
        }, 8000);
      }
    });
    avatar.current?.on(StreamingEvents.USER_END_MESSAGE, (event) => {
      console.log('>>>>> USER_END_MESSAGE event:', event);
      
      if (event.detail && event.detail.message && event.detail.message.trim().length > 0) {
        const userMessage = event.detail.message;
        
        // Filter out the specific welcome message
        if (userMessage.includes("¡Hola! Soy Tara, tu asistente virtual de la Universidad de Tarapacá - UTA")) {
          console.log("🤖 Mensaje de bienvenida específico ignorado en USER_END_MESSAGE:", userMessage);
          return;
        }
        
        console.log("✅ Procesando pregunta completa del usuario:", userMessage);
        
        // Update final transcript and keep it visible longer
        setLastTranscript(userMessage);
        setShowTranscript(true);
        setTranscriptExiting(false);
        setIsUserTalking(false);
        
        // Send user question to avatar
        if (avatar.current) {
          avatar.current.speak({ 
            text: userMessage, 
            taskType: TaskType.TALK, 
            taskMode: TaskMode.SYNC 
          }).catch((e) => {
            console.error("Error enviando pregunta del usuario:", e);
          });
        }
      }
    });

    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: avatarId,
        knowledgeId: knowledgeId, 
        voice: {
          voiceId: voiceId,
          rate: 1,
          emotion: VoiceEmotion.FRIENDLY,
        },
        language: language,
      });

      setData(res);
      console.log("✅ Avatar session creado:", res);
      
      // Custom greeting for UTA
      await avatar.current.speak({
        text: "¡Hola! Soy Tara, tu asistente virtual de la Universidad de Tarapacá - UTA. Es un gusto conocerte. Estoy aquí para apoyarte en tu formación académica y resolver cualquier consulta que tengas sobre nuestros programas, servicios universitarios y vida estudiantil. ¿En qué puedo ayudarte hoy?",
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC
      });
      
    } catch (error) {
      console.error("Error starting avatar session:", error);
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
    
    await avatar.current.speak({ 
      text: text, 
      taskType: TaskType.TALK, 
      taskMode: TaskMode.SYNC 
    }).catch((e) => {
      setDebug(e.message);
    });
    setIsLoadingRepeat(false);
  }

  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
    await avatar.current
      .interrupt()
      .catch((e) => {
        setDebug(e.message);
      });
  }

  async function endSession() {
    await avatar.current?.stopAvatar();
    await stopContinuousVoiceChat();
    setStream(undefined);
  }

  const handleChangeChatMode = useMemoizedFn(async (v) => {
    if (v === chatMode) {
      return;
    }
    console.log(`Cambiando modo de ${chatMode} a ${v}`);
    
    setChatMode(v);
    
    if (v === "text_mode") {
      console.log("Cambiando a modo texto...");
      await stopContinuousVoiceChat();
      console.log("✅ Modo texto activado");
    } else {
      console.log("🔊 Activando modo voz continuo...");
      if (avatar.current && stream) {
        const success = await startContinuousVoiceChat();
        if (success) {
          console.log("✅ Modo voz continuo activado automáticamente");
        }
      } else {
        console.log("⚠️ Avatar o stream no disponible para activar voice chat automáticamente");
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

  // Auto-start voice chat when in voice mode and avatar is ready
  useEffect(() => {
    if (chatMode === "voice_mode" && stream && avatar.current && !isVoiceChatActive) {
      console.log("🎤 Auto-iniciando voice chat al detectar modo voz...");
      startContinuousVoiceChat();
    }
  }, [chatMode, stream, isVoiceChatActive]);

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

              {/* Audio level indicator when voice chat is active */}
              {isVoiceChatActive && (
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-black bg-opacity-50 rounded-full px-3 py-2">
                  <div className={`w-3 h-3 rounded-full ${isUserTalking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className="text-white text-sm">
                    {isUserTalking ? '🎤 Escuchando...' : '🔊 Conversación activa'}
                  </span>
                </div>
              )}


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
                >
                  🎤 Voz Continua
                </button>
              </div>
            </div>
          </div>

          {/* Content based on mode */}
          {chatMode === "voice_mode" ? (
            stream ? (
              <div className="bg-white p-3 rounded-lg shadow border border-gray-200 w-full">
                <div className="text-center">
                  <div 
                    className={`w-16 h-16 mx-auto rounded-full text-white font-bold text-lg transition-all duration-200 shadow-lg flex items-center justify-center ${
                      isUserTalking
                        ? "bg-red-500 shadow-red-300 shadow-xl animate-pulse"
                        : isVoiceChatActive
                        ? "bg-green-500 shadow-green-300"
                        : "bg-yellow-500 shadow-yellow-300"
                    }`}
                  >
                    {isUserTalking ? "🔴" : isVoiceChatActive ? "🎤" : "⏳"}
                  </div>
                  <div className="mt-2">
                    <span className={`text-sm font-medium ${
                      isUserTalking 
                        ? "text-red-600" 
                        : isVoiceChatActive
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}>
                      {isUserTalking 
                        ? "🤔 Estoy pensando..." 
                        : isVoiceChatActive
                        ? "🎤 Conversación activa - Habla libremente"
                        : "⏳ Activando conversación de voz..."}
                    </span>
                  </div>
                  
                  {/* User transcript integrated below status */}
                  {showTranscript && lastTranscript ? (
                    <div className={`mt-3 p-3 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 transform transition-all duration-500 ease-out ${
                      transcriptExiting 
                        ? "opacity-0 scale-95" 
                        : "opacity-100 scale-100"
                    }`}>
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-blue-600 text-xs mr-2">💬</span>
                        <p className="text-xs text-blue-700 font-semibold">Tu pregunta:</p>
                      </div>
                      <p className="text-sm text-blue-800 italic font-medium leading-relaxed">
                        "{lastTranscript}"
                      </p>
                    </div>
                  ) : null}
                  

                </div>
              </div>
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