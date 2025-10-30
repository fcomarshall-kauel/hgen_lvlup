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
import ConversationHistory, { ConversationMessage } from "./ConversationHistory";

import {AVATARS, SIMULATIONS, STT_LANGUAGE_LIST, VOICES} from "@/app/lib/constants";

interface InteractiveAvatarGPProps {
  // Avatar configuration
  knowledgeId: string;
  avatarId: string;
  voiceId: string;
  language?: string;
  
  // UI configuration
  avatarName: string;
  institutionName: string;
  avatarImage?: string;
  welcomeMessage: string;
  
  // Styling
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  
  // Text customization
  placeholderText?: string;
  buttonText?: string;
}

export default function InteractiveAvatarGP({
  knowledgeId,
  avatarId,
  voiceId,
  language = 'es',
  avatarName,
  institutionName,
  avatarImage,
  welcomeMessage,
  primaryColor = 'blue',
  secondaryColor = 'indigo',
  backgroundColor = 'blue',
  placeholderText,
  buttonText
}: InteractiveAvatarGPProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  
  // Unique ID generator to avoid duplicate keys
  const messageIdCounter = useRef(0);
  
  // Use ref for current avatar message to avoid closure issues
  const currentAvatarMessage = useRef<string>("");
  const lastMessageTime = useRef<number>(0);
  const currentUserMessage = useRef<string>("");
  const lastUserStartTime = useRef<number>(0);

  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState<'text_mode' | 'voice_mode'>('voice_mode');
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  const addToHistory = (type: 'user' | 'avatar', content: string) => {
    messageIdCounter.current += 1;
    const uniqueId = `${Date.now()}-${messageIdCounter.current}`;
    
    const newMessage: ConversationMessage = {
      id: uniqueId,
      type,
      content,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, newMessage]);
  };

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
    return "";
  }

  async function startVoiceChat() {
    try {
      if (!avatar.current) {
        throw new Error("Avatar not available");
      }

      // Check for microphone permissions
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (permError) {
        console.error("❌ Microphone permission denied:", permError);
        return false;
      }

      await avatar.current.startVoiceChat();
      setIsVoiceChatActive(true);
      console.log("✅ Voice chat activated");
      return true;
    } catch (error) {
      console.error("❌ Error starting voice chat:", error);
      setIsVoiceChatActive(false);
      return false;
    }
  }

  async function stopVoiceChat() {
    try {
      if (avatar.current) {
        await avatar.current.closeVoiceChat();
      }
      
      setIsVoiceChatActive(false);
      setIsUserTalking(false);
      setLastTranscript("");
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
      setIsAvatarTalking(true);
    });
    
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      setIsAvatarTalking(false);
      
      // Add complete avatar message to history when it finishes talking
      if (currentAvatarMessage.current.trim()) {
        console.log("🤖 Avatar response:", currentAvatarMessage.current.trim());
        addToHistory('avatar', currentAvatarMessage.current.trim());
        currentAvatarMessage.current = "";
      }
    });

    // Accumulate avatar message chunks (don't add to history yet)
    avatar.current.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
      if (event.detail && event.detail.message) {
        const now = Date.now();
        
        // If more than 3 seconds have passed since last chunk, start new message
        if (now - lastMessageTime.current > 3000 && currentAvatarMessage.current.trim()) {
          addToHistory('avatar', currentAvatarMessage.current.trim());
          currentAvatarMessage.current = "";
        }
        
        currentAvatarMessage.current += event.detail.message;
        lastMessageTime.current = now;
      }
    });
    
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("Stream disconnected");
      endSession();
    });
    
    avatar.current.on(StreamingEvents.STREAM_READY, (event) => {
      console.log("Stream ready:", event.detail);
      setStream(event.detail);
    });

    // User talking events
    avatar.current.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
      const message = event.detail?.message || event.detail?.text || event.detail?.transcript;
      
      if (message) {
        console.log('👤 USER_TALKING_MESSAGE:', message);
        setIsUserTalking(true);
        setLastTranscript(message);
        currentUserMessage.current = message; // Store for later use
      } else {
        console.log('⚠️ USER_TALKING_MESSAGE - no content');
      }
    });

    avatar.current.on(StreamingEvents.USER_END_MESSAGE, (event) => {
      console.log('📝 USER_END_MESSAGE triggered');
      setIsUserTalking(false);
      
      // Use the message stored from USER_TALKING_MESSAGE
      if (currentUserMessage.current.trim()) {
        console.log('👤 USER_MESSAGE_FINAL:', currentUserMessage.current);
        addToHistory('user', currentUserMessage.current);
        console.log('✅ Added to history');
        currentUserMessage.current = ""; // Clear after use
      } else {
        console.log('⚠️ No user message to add to history');
      }
    });

    avatar.current.on(StreamingEvents.USER_START, (event) => {
      const now = Date.now();
      // Only log if it's been more than 500ms since last start (avoid spam)
      if (now - lastUserStartTime.current > 500) {
        console.log('🎤 USER_START');
      }
      lastUserStartTime.current = now;
      setIsUserTalking(true);
      setLastTranscript(""); // Clear previous transcript when starting new speech
    });

    avatar.current.on(StreamingEvents.USER_STOP, (event) => {
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
      
      // Start voice chat automatically if in voice mode
      if (chatMode === 'voice_mode') {
        console.log("🎤 Auto-starting voice chat for voice mode...");
        const voiceChatStarted = await startVoiceChat();
        if (!voiceChatStarted) {
          console.log("⚠️ Voice chat failed to start, but continuing with session");
        }
      }
      
      // Welcome message using REPEAT to avoid knowledge base interference
      await avatar.current.speak({
        text: welcomeMessage,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      });
      
      // Add welcome message to history manually (since REPEAT doesn't trigger talking events)
      addToHistory('avatar', welcomeMessage);
      
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
    
    const userMessage = text;
    
    try {
      // Add user message to history first
      addToHistory('user', userMessage);
      
      await avatar.current.speak({ 
        text: userMessage, 
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
      setConversationHistory([]); // Clear conversation history
      setLastTranscript(""); // Clear last transcript
      currentAvatarMessage.current = ""; // Clear current avatar message
      currentUserMessage.current = ""; // Clear current user message
      messageIdCounter.current = 0; // Reset counter
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

  // Dynamic CSS classes based on color props
  const getGradientClass = (type: 'primary' | 'secondary') => {
    const colors = type === 'primary' ? primaryColor : secondaryColor;
    
    // Handle specific color cases for better Tailwind compatibility
    if (colors === 'red') {
      return 'bg-gradient-to-tr from-red-600 to-red-600';
    } else if (colors === 'blue') {
      return 'bg-gradient-to-tr from-blue-600 to-indigo-600';
    } else if (colors === 'purple') {
      return 'bg-gradient-to-tr from-purple-600 to-purple-600';
    } else if (colors === 'green') {
      return 'bg-gradient-to-tr from-green-600 to-emerald-600';
    } else if (colors === 'sky') {
      return 'bg-gradient-to-tr from-sky-600 to-blue-600';
    } else if (colors === 'teal') {
      return 'bg-gradient-to-tr from-teal-600 to-cyan-600';
    } else if (colors === 'cyan') {
      return 'bg-gradient-to-tr from-cyan-600 to-teal-600';
    }
    
    return `bg-gradient-to-tr from-${colors}-600 to-${colors === 'blue' ? 'indigo' : colors}-600`;
  };

  const getBackgroundGradient = () => {
    return `bg-gradient-to-br from-${backgroundColor}-50 via-white to-${backgroundColor}-50`;
  };

  const getBorderColor = () => {
    return `border-${primaryColor}-200`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Card className={`border-2 ${getBorderColor()} shadow-lg h-full flex flex-col`}>
        <CardBody className={`min-h-[250px] h-[35vh] max-h-[400px] flex flex-col justify-center items-center ${getBackgroundGradient()} relative flex-shrink-0`}>
          {stream ? (
            <div className={`h-full w-full justify-center items-center flex rounded-lg overflow-hidden border-4 border-${primaryColor}-300 shadow-inner`}>
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
                  className={`${getGradientClass('primary')} text-white rounded-lg shadow-md hover:shadow-lg transition-all`}
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
                <h2 className={`text-lg font-bold text-${primaryColor}-800 mb-1`}>🎓 Habla con {avatarName}</h2>
                <p className={`text-${primaryColor}-600 text-xs`}>{institutionName}</p>
                <div className={`w-full h-0.5 bg-gradient-to-r from-${primaryColor}-500 to-${secondaryColor}-500 rounded-full mt-1`}></div>
              </div>
              
              <div className="text-center">
                {avatarImage && (
                  <div className="w-16 h-16 mx-auto mb-2 relative">
                    <Image
                      src={avatarImage}
                      alt={`${avatarName} - Asistente Virtual`}
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-3 shadow-lg"
                      style={{
                        width: "120%",
                        height: "120%",
                      }}
                    />
                  </div>
                )}
                <h3 className={`text-base font-bold text-${primaryColor}-800 mb-1`}>Conoce a {avatarName}</h3>
                <p className={`text-${primaryColor}-600 text-xs leading-relaxed max-w-xs mx-auto`}>
                  Tu asistente virtual especializado para ayudarte con todas tus consultas.
                </p>
              </div>
              
              <Button
                className={`${getGradientClass('primary')} w-full text-white font-semibold text-base py-4 shadow-lg hover:shadow-xl transition-all`}
                size="md"
                variant="shadow"
                onClick={startSession}
              >
                {buttonText || `🚀 Iniciar Conversación con ${avatarName}`}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Spinner color="primary" size="md" />
              <p className={`text-${primaryColor}-600 font-medium text-sm`}>Conectando con {avatarName}...</p>
            </div>
          )}
        </CardBody>
        <Divider className={`bg-${primaryColor}-200`} />
        <CardFooter className={`flex flex-col gap-2 relative ${getBackgroundGradient()} p-3 flex-1 overflow-hidden`}>
          {/* Status Panel - Compact */}
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between gap-3">
              {/* Mode selector - Compact */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">Modo:</span>
                <div className="flex">
                  <button
                    onClick={() => handleChangeChatMode("voice_mode")}
                    className={`py-1 px-2 text-xs font-medium rounded-l-md border transition-colors ${
                      chatMode === "voice_mode"
                        ? `bg-${primaryColor}-600 text-white border-${primaryColor}-600`
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                    disabled={!stream}
                  >
                    🎤
                  </button>
                  <button
                    onClick={() => handleChangeChatMode("text_mode")}
                    className={`py-1 px-2 text-xs font-medium rounded-r-md border-l-0 border transition-colors ${
                      chatMode === "text_mode"
                        ? `bg-${primaryColor}-600 text-white border-${primaryColor}-600`
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    💬
                  </button>
                </div>
              </div>

              {/* Status indicator - Compact */}
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isUserTalking ? 'bg-red-500 animate-pulse' :
                  isAvatarTalking ? `bg-${primaryColor}-500 animate-pulse` :
                  isProcessing ? 'bg-yellow-500 animate-pulse' :
                  stream ? 'bg-green-500' :
                  'bg-gray-300'
                }`}></div>
                <span className="text-xs text-gray-600 font-medium">
                  {isUserTalking ? 'Hablando' :
                   isAvatarTalking ? `${avatarName} responde` :
                   isProcessing ? 'Procesando' :
                   stream ? 'Activa' :
                   'Conectando'}
                </span>
              </div>
            </div>
          </div>

          {/* Mode-specific content - Text mode only */}
          {chatMode === "text_mode" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <InteractiveAvatarTextInput
                disabled={!stream}
                input={text}
                label={`Pregunta a ${avatarName}`}
                loading={isLoadingRepeat}
                placeholder={placeholderText || `¿Qué quieres saber sobre ${institutionName}?...`}
                setInput={setText}
                onSubmit={handleSpeak}
              />
            </div>
          )}
          
          {/* Conversation History - Full width with dynamic height */}
          <div className="flex-1 flex flex-col min-h-0">
            {conversationHistory.length > 0 ? (
              <ConversationHistory 
                messages={[...conversationHistory].reverse()}
                className="w-full flex-1"
                dynamicHeight={true}
              />
            ) : (
              stream && (
                <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center flex-1 flex flex-col justify-center">
                  <div className="text-xl mb-2">💭</div>
                  <p className="text-sm text-gray-600 mb-1">No hay conversación aún</p>
                  <p className="text-xs text-gray-500">
                    {chatMode === 'voice_mode' 
                      ? `Habla con ${avatarName} usando tu micrófono`
                      : 'Escribe una pregunta para comenzar'
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

