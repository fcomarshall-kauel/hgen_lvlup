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
import { useMemoizedFn, usePrevious } from "ahooks";
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
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  const [showVoiceHint, setShowVoiceHint] = useState(false);
  const [pressStartTime, setPressStartTime] = useState(0);
  const [isListeningStarted, setIsListeningStarted] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptExiting, setTranscriptExiting] = useState(false);
  const [userTalkingMessageCount, setUserTalkingMessageCount] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }

    return "";
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
      console.log('>>>>> User talking message (en tiempo real):', event);
      
      // Incrementar contador usando función callback para evitar problemas de sincronización
      setUserTalkingMessageCount(prevCount => {
        const newCount = prevCount + 1;
        console.log(`📊 Mensaje #${newCount} (anterior: ${prevCount})`);
        
        if (event.detail && event.detail.message) {
          if (newCount === 1) {
            console.log("🤖 Primer mensaje (bienvenida del avatar) - IGNORADO:", event.detail.message);
          } else {
            console.log("🎤 Usuario hablando - MOSTRAR TRANSCRIPT:", event.detail.message);
            setIsUserTalking(true);
            setLastTranscript(event.detail.message);
            setTranscriptExiting(false);
            setShowTranscript(true);
            
            // Animación de salida después de 6 segundos
            setTimeout(() => {
              setTranscriptExiting(true);
              // Ocultar completamente después de la animación
              setTimeout(() => {
                setShowTranscript(false);
                setTranscriptExiting(false);
              }, 500);
            }, 6000);
          }
        }
        
        return newCount;
      });
    });
    avatar.current?.on(StreamingEvents.USER_END_MESSAGE, (event) => {
      console.log('>>>>> User end message (mensaje completo):', event);
      
      // Solo procesar si no es el primer mensaje (bienvenida)
      if (userTalkingMessageCount > 1 && event.detail && event.detail.message) {
        const userMessage = event.detail.message;
        console.log("✅ Enviando pregunta del usuario al avatar:", userMessage);
        setIsUserTalking(false);
        
        // Enviar la pregunta al avatar
        if (avatar.current) {
          avatar.current.speak({ 
            text: userMessage, 
            taskType: TaskType.TALK, 
            taskMode: TaskMode.SYNC 
          }).catch((e) => {
            console.error("Error enviando pregunta del usuario:", e);
          });
        }
      } else {
        console.log("🤖 Mensaje del avatar (bienvenida) - NO ENVIAR");
      }
    });
    
    console.log("✅ Event listeners registrados para USER_TALKING_MESSAGE y USER_END_MESSAGE");

    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: avatarId,
        knowledgeId: knowledgeId, 
        voice: {
          voiceId: voiceId,
          rate: 1, // 0.5 ~ 1.5
          emotion: VoiceEmotion.FRIENDLY,
        },
        language: language,
      });

      setData(res);
      console.log("✅ Avatar session creado:", res);
      console.log("Avatar capabilities:", {
        hasVoiceChat: typeof avatar.current?.startVoiceChat === 'function',
        hasStartListening: typeof avatar.current?.startListening === 'function',
        hasStopListening: typeof avatar.current?.stopListening === 'function'
      });
      
      // Custom greeting for UTA
      await avatar.current.speak({
        text: "¡Hola! Soy Tara, tu asistente virtual de la Universidad de Tarapacá - UTA. Es un gusto conocerte. Estoy aquí para apoyarte en tu formación académica y resolver cualquier consulta que tengas sobre nuestros programas, servicios universitarios y vida estudiantil. ¿En qué puedo ayudarte hoy?",
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC
      });
      
      // Si el usuario tenía modo voz seleccionado antes de conectar, activarlo
      if (chatMode === "voice_mode") {
        console.log("Activando voice chat porque el usuario tenía modo voz seleccionado");
        try {
          await avatar.current.startVoiceChat();
          console.log("✅ Voice chat activado exitosamente después de la conexión");
        } catch (error) {
          console.log("❌ Error activando voice chat después de la conexión:", error);
        }
      }
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
    
    // Use TALK mode for conversation instead of REPEAT
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
    setStream(undefined);
  }

  const handleChangeChatMode = useMemoizedFn(async (v) => {
    if (v === chatMode) {
      return;
    }
    console.log(`Cambiando modo de ${chatMode} a ${v}`);
    
    // Cambio instantáneo de la UI
    setChatMode(v);
    
    // Ejecutar operaciones de voice chat en segundo plano
    if (v === "text_mode") {
      console.log("Cerrando voice chat...");
      try {
        avatar.current?.closeVoiceChat();
        console.log("✅ Voice chat cerrado");
      } catch (error) {
        console.log("❌ Error cerrando voice chat:", error);
      }
    } else {
      console.log("Iniciando voice chat...");
      try {
        // No usar await aquí para no bloquear la UI
        console.log("🔊 Ejecutando avatar.startVoiceChat()...");
        avatar.current?.startVoiceChat().then(() => {
          console.log("✅ Voice chat iniciado exitosamente");
          console.log("Voice chat state después de iniciar:", {
            hasStartListening: typeof avatar.current?.startListening === 'function',
            hasStopListening: typeof avatar.current?.stopListening === 'function',
            stream: !!stream
          });
        }).catch((error) => {
          console.log("❌ Error iniciando voice chat:", error);
          console.log("Voice chat error details:", (error as Error).message);
        });
      } catch (error) {
        console.log("❌ Error iniciando voice chat:", error);
      }
    }
  });

  const previousText = usePrevious(text);
  useEffect(() => {
    if (!previousText && text) {
      avatar.current?.startListening();
    } else if (previousText && !text) {
      avatar?.current?.stopListening();
    }
  }, [text, previousText]);

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

  const handlePushToTalkStart = async () => {
    if (avatar.current && chatMode === "voice_mode") {
      console.log("Push-to-talk iniciado");
      console.log("Avatar existe:", !!avatar.current);
      console.log("Chat mode:", chatMode);
      console.log("Stream existe:", !!stream);
      
      setPressStartTime(Date.now());
      setIsPushToTalkActive(true);
      
      // Verificar si voice chat está activo antes de startListening
      console.log("¿Voice chat está activo?", avatar.current);
      
      // Iniciar un timer para activar la escucha después de 1 segundo
      listeningTimeoutRef.current = setTimeout(async () => {
        // Verificar si el botón sigue presionado después de 1 segundo
        console.log("Verificando estado después de 1 segundo:", {
          avatar: !!avatar.current,
          chatMode: chatMode,
          pressStartTime,
          currentTime: Date.now(),
          timePassed: Date.now() - pressStartTime,
          stream: !!stream
        });
        
        if (avatar.current && chatMode === "voice_mode") {
          console.log("Iniciando escucha después de 1 segundo...");
          try {
            console.log("🎤 Ejecutando avatar.startListening()...");
            await avatar.current.startListening();
            console.log("✅ StartListening ejecutado exitosamente");
            setIsListeningStarted(true);
          } catch (error) {
            console.log("❌ Error en startListening:", error);
            console.log("Error details:", (error as Error).message, (error as Error).stack);
          }
        } else {
          console.log("❌ No se puede iniciar escucha:", {
            avatar: !!avatar.current,
            chatMode: chatMode
          });
        }
      }, 1000);
    } else {
      console.log("Push-to-talk NO iniciado:", { 
        avatar: !!avatar.current, 
        chatMode,
        stream: !!stream 
      });
    }
  };

  const handlePushToTalkEnd = async () => {
    if (avatar.current && chatMode === "voice_mode") {
      const pressDuration = Date.now() - pressStartTime;
      console.log(`Push-to-talk terminado. Duración: ${pressDuration}ms`);
      
      // Limpiar el timeout si existe
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
        listeningTimeoutRef.current = null;
      }
      
      // Si el click fue muy corto (menos de 1 segundo), mostrar hint y no hacer nada más
      if (pressDuration < 1000) {
        console.log("Click muy corto, mostrando hint");
        setShowVoiceHint(true);
        setTimeout(() => setShowVoiceHint(false), 3000);
        setIsPushToTalkActive(false);
        setIsListeningStarted(false);
        return;
      }
      
      // Solo detener la escucha si realmente se había iniciado
      if (isListeningStarted) {
        console.log("Deteniendo escucha...");
        try {
          await avatar.current.stopListening();
          console.log("✅ Escucha detenida exitosamente");
        } catch (error) {
          console.log("❌ Error al detener escucha:", error);
        }
        setIsListeningStarted(false);
      }
      
      setIsPushToTalkActive(false);
    }
  };

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
          {/* Control de modo compacto */}
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
                  🎤 Voz
                </button>
              </div>
            </div>
          </div>

          {/* Contenido según modo - ultra compacto */}
          {chatMode === "voice_mode" ? (
            stream ? (
              <div className="bg-white p-2 rounded-lg shadow border border-gray-200 w-full">
                <div className="flex justify-center relative">
                  <button
                    onMouseDown={handlePushToTalkStart}
                    onMouseUp={handlePushToTalkEnd}
                    onTouchStart={handlePushToTalkStart}
                    onTouchEnd={handlePushToTalkEnd}
                    className={`w-12 h-12 rounded-full text-white font-bold text-sm transition-all duration-200 shadow-lg active:scale-95 ${
                      isListeningStarted
                        ? "bg-red-500 shadow-red-300 shadow-xl animate-pulse"
                        : isPushToTalkActive
                        ? "bg-yellow-500 shadow-yellow-300 shadow-xl"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-300"
                    }`}
                  >
                    🎤
                  </button>
                  {showVoiceHint && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 animate-bounce">
                      ¡Mantén presionado!
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-red-500"></div>
                    </div>
                  )}
                </div>
                <div className="text-center mt-1">
                  <span className={`text-xs font-medium ${
                    isListeningStarted 
                      ? "text-red-600" 
                      : isPushToTalkActive 
                      ? "text-yellow-600" 
                      : "text-gray-500"
                  }`}>
                    {isListeningStarted 
                      ? "🔴 Grabando..." 
                      : isPushToTalkActive 
                      ? "⏳ Manteniendo..." 
                      : "Lista para escuchar"}
                  </span>
                </div>
                
                {/* Área reservada para transcript - espacio fijo para mantener video estable */}
                <div className="h-32 mt-2 flex items-end">
                  <div className={`w-full overflow-hidden transition-all duration-500 ease-out ${
                    showTranscript ? "max-h-32" : "max-h-0"
                  }`}>
                    {showTranscript && lastTranscript && (
                      <div className={`p-3 border border-blue-200 rounded-lg text-center transform transition-all duration-500 ease-out ${
                        transcriptExiting 
                          ? "opacity-0 -translate-y-2 scale-95 bg-gray-50" 
                          : "opacity-100 translate-y-0 scale-100 bg-gradient-to-r from-blue-50 to-indigo-50 animate-in slide-in-from-top-2 fade-in"
                      }`}>
                        <div className="flex items-center justify-center mb-2">
                          <span className="text-blue-600 text-sm mr-2 animate-bounce">🎤</span>
                          <p className="text-xs text-blue-700 font-semibold">Tu pregunta:</p>
                        </div>
                        <div className="relative">
                          <p className={`text-sm text-blue-800 italic font-medium leading-relaxed transition-all duration-700 delay-200 ${
                            transcriptExiting ? "opacity-0" : "opacity-100 animate-in slide-in-from-left-1 fade-in"
                          }`}>
                            "{lastTranscript}"
                          </p>
                          <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-transparent transition-all duration-300 ${
                            transcriptExiting ? "w-0" : "w-full animate-pulse"
                          }`}></div>
                        </div>
                      </div>
                    )}
                  </div>
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
              {text && (
                <Chip className="absolute right-12 top-2 bg-blue-100 text-blue-700" size="sm">Escuchando</Chip>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
      <p className="font-mono text-right text-blue-600 text-xs">
        <span className="font-bold">📊 Estado:</span> {
          debug || 
          (stream 
            ? `✅ Conectado - Modo ${chatMode === "voice_mode" ? "🎤 Voz" : "💬 Texto"}`
            : `⚪ Sin conexión - Modo ${chatMode === "voice_mode" ? "🎤 Voz" : "💬 Texto"} seleccionado`
          )
        }
      </p>
    </div>
  );
} 