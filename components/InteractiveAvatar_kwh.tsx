//InteractiveAvatar_kwh.tsx
import type { SpeakRequest, StartAvatarResponse } from "@heygen/streaming-avatar";
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
  Input,
  Select,
  SelectItem,
  Spinner,
  Chip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, usePrevious } from "ahooks";

import InteractiveAvatarTextInput from "./InteractiveAvatarTextInput";

import {AVATARS, SIMULATIONS, STT_LANGUAGE_LIST, VOICES, AVATAR_VOICE_COMBINATIONS} from "@/app/lib/constants";

// Define the response type
interface ChatResponse {
  answer: string;
  context: {
    metadata: {
      filename: string;
    }
  }[];
  additional_information: string;
  input: string;
}

// Add this interface with your other interfaces
interface Source {
  filename: string;
  page: number;
}

export default function InteractiveAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [knowledgeId, setKnowledgeId] = useState<string>("");
  const [avatarId, setAvatarId] = useState<string>(AVATAR_VOICE_COMBINATIONS[0].avatar_id);
  const [language, setLanguage] = useState<string>('es');
  const [voiceId, setVoiceId] = useState<string>(AVATAR_VOICE_COMBINATIONS[0].voice_id);
  const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(null);

  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  const [sourceDocs, setSourceDocs] = useState<string[]>([]);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'processing'>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
        language: 'es',
      });

      setData(res);
      setChatMode("text_mode");

      // Direct greeting without AI processing
      await avatar.current.speak({
        text: "Es un placer darle la bienvenida. Estoy aquí para sus consultas médicas, recursos sobre productos farmacéuticos, y las últimas publicaciones en su campo. Además, si tiene alguna pregunta específica sobre el tratamiento de sus pacientes, estaré encantada de asistirle.",
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      });
    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  }
  async function handleSpeak(inputText?: string) {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }

    const textToSend = inputText?.trim() || text.trim();
    if (!textToSend) {
      setDebug("Empty input text");
      return;
    }

    try {
      setRecordingState('processing');
      const startTime = performance.now();
      
      const aiResponse = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `responde en 30 palabras o menos: ${textToSend}`,
          knowledge_id: knowledgeId
        }),
      });

      const aiResponseData = await aiResponse.text();
      const aiTime = performance.now() - startTime;
      
      console.log(`AI Response (${aiTime.toFixed(0)}ms):`, aiResponseData);
      console.log('Full API Response:', aiResponseData);
      
      if (!aiResponseData) {
        throw new Error('No AI response found');
      }

      // Speak the response
      const avatarStartTime = performance.now();
      await avatar.current.speak({
        text: aiResponseData,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      });
      const avatarTime = performance.now() - avatarStartTime;
      console.log(`Avatar speaking time: ${avatarTime.toFixed(0)}ms`);

    } catch (error) {
      console.error("Error:", error);
      setDebug(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setRecordingState('idle');
    }
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
    if (avatar.current) {
      avatar.current.stopAvatar();
      avatar.current = null;
    }
    setStream(undefined);
    setSourceDocs([]);
    setText("");
  }

  const handleChangeChatMode = useMemoizedFn(async (v) => {
    return;
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

  const getSupportedMimeType = () => {
    const types = ['audio/webm', 'audio/mp4', 'audio/ogg'];
    for (let type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Supported MIME type:', type);
        return type;
      }
    }
    throw new Error('No supported audio MIME types found');
  };

  const startRecording = async () => {
    try {
      setRecordingState('recording');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
    } catch (error) {
      setRecordingState('idle');
      setDebug('Recording failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || recordingState !== 'recording') return;

    setRecordingState('processing');
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
      await handleWhisperTranscription(audioBlob);
      setRecordingState('idle');
    };
    
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  };

  const handleWhisperTranscription = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      setRecordingState('processing');
      const startTime = performance.now();
      console.log('Sending audio for transcription, size:', audioBlob.size, 'type:', audioBlob.type);
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const { text: transcription } = await response.json();
      const whisperTime = performance.now() - startTime;
      console.log(`Whisper transcription (${whisperTime.toFixed(0)}ms):`, transcription);
      
      setText(transcription);
      if (transcription) {
        await handleSpeak(transcription);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setDebug('Transcription failed');
    } finally {
      setRecordingState('idle');
    }
  };

  const handleCombinationChange = (value: string) => {
    const combination = AVATAR_VOICE_COMBINATIONS.find(c => c.id === value);
    if (combination) {
      setAvatarId(combination.avatar_id);
      setVoiceId(combination.voice_id);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <Card className="max-w-[1000px]">
        <CardBody className="overflow-hidden p-0">
          {stream ? (
            <div className="relative aspect-video">
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="flex flex-col gap-2 absolute bottom-3 right-3">
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  size="md"
                  variant="shadow"
                  onClick={handleInterrupt}
                >
                  Interrumpir
                </Button>
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  size="md"
                  variant="shadow"
                  onClick={endSession}
                >
                  Terminar Sesión
                </Button>
              </div>
            </div>
          ) : !isLoadingSession ? (
            <div className="h-full justify-center items-center flex flex-col gap-8 w-[500px] self-center">
              <div className="flex flex-col gap-3 w-full">
                <Select
                  label="Selección de Agente y Voz"
                  placeholder="Seleccione un agente"
                  variant="bordered"
                  disallowEmptySelection={false}
                  selectedKeys={new Set([
                    AVATAR_VOICE_COMBINATIONS.find(c => 
                      c.avatar_id === avatarId && c.voice_id === voiceId
                    )?.id || AVATAR_VOICE_COMBINATIONS[0].id
                  ])}
                  onSelectionChange={(keys) => handleCombinationChange(Array.from(keys)[0] as string)}
                >
                  {AVATAR_VOICE_COMBINATIONS.map((combo) => (
                    <SelectItem key={combo.id} value={combo.id}>
                      {combo.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <Button
                className="bg-gradient-to-tr from-indigo-500 to-indigo-300 w-full text-white"
                size="md"
                variant="shadow"
                onClick={startSession}
              >
                Iniciar Conversación
              </Button>
            </div>
          ) : (
            <Spinner color="default" size="lg" />
          )}
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col gap-3 relative">
          {stream ? (
            <div className="w-full flex flex-col gap-2">
              <div className="w-full flex relative">
                <InteractiveAvatarTextInput
                  disabled={!stream}
                  input={text}
                  label="Chat"
                  loading={recordingState === 'processing'}
                  placeholder="Escriba algo para que el avatar responda"
                  setInput={setText}
                  onSubmit={handleSpeak}
                />
                <Button
                  className={`ml-2 ${
                    recordingState === 'recording' 
                      ? 'bg-red-500' 
                      : recordingState === 'processing' 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                  } text-white rounded-lg`}
                  size="md"
                  variant="shadow"
                  isDisabled={recordingState === 'processing'}
                  onPointerDown={startRecording}
                  onPointerUp={stopRecording}
                  onPointerLeave={stopRecording}
                >
                  {recordingState === 'recording' 
                    ? 'Escuchando...' 
                    : recordingState === 'processing' 
                      ? 'Procesando...' 
                      : 'Mantener para hablar'}
                </Button>
              </div>
              
              {sourceDocs.length > 0 && (
                <div className="text-sm text-gray-500">
                  <p className="font-medium">Fuentes:</p>
                  <ul className="list-disc pl-5">
                    {sourceDocs.map((filename, index) => (
                      <li key={index} className="text-xs">
                        {filename}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm">
              Inicie una conversación para comenzar a hablar
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
