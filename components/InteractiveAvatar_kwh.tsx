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

import {AVATARS, SIMULATIONS, STT_LANGUAGE_LIST, VOICES} from "@/app/lib/constants";

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
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [knowledgeId, setKnowledgeId] = useState<string>("");
  const [avatarId, setAvatarId] = useState<string>("");
  const [language, setLanguage] = useState<string>('es');
  const [voiceId, setVoiceId] = useState("");
  const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(null);

  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  const [sourceDocs, setSourceDocs] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
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
          emotion: VoiceEmotion.EXCITED,
        },
        language: language,
      });

      setData(res);
      setChatMode("text_mode");
    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  }
  async function handleSpeak() {
    const startTime = performance.now();
    console.log(`[${new Date().toISOString()}] Starting request...`);
    
    setIsLoadingRepeat(true);
    setSourceDocs([]);
    
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }

    try {
      const apiStartTime = performance.now();
      console.log(`[${new Date().toISOString()}] Sending request to AI API...`);
      
      const aiResponse = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text })
      });
      
      const aiResponseData = await aiResponse.json() as ChatResponse;
      
      console.log('Full API Response:', aiResponseData);
      
      const apiEndTime = performance.now();
      console.log(`[${new Date().toISOString()}] AI API response received in ${(apiEndTime - apiStartTime).toFixed(2)}ms`);
      
      if (!aiResponseData.answer) {
        throw new Error('No AI response found');
      }

      const uniqueFiles = aiResponseData.context
        .map(ctx => ctx.metadata.filename)
        .filter((filename, index, self) => 
          filename && self.indexOf(filename) === index
        );

      setSourceDocs(uniqueFiles);

      console.log(`[${new Date().toISOString()}] Starting avatar speech...`);
      const speakStartTime = performance.now();

      // Only use REPEAT mode
      const speakRequest: SpeakRequest = {
        text: aiResponseData.answer,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC
      };

      await avatar.current.speak(speakRequest);
      
      const speakEndTime = performance.now();
      
      console.log(`
        Timing Breakdown:
        - Total time: ${(speakEndTime - startTime).toFixed(2)}ms
        - API request time: ${(apiEndTime - apiStartTime).toFixed(2)}ms
        - Avatar preparation and speech start time: ${(speakEndTime - speakStartTime).toFixed(2)}ms
      `);

    } catch (error: unknown) {
      console.error("Error:", error);
      setDebug(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoadingRepeat(false);
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
    console.log('Starting recording...', new Date().toISOString());
    try {
      console.log('Before getUserMedia');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      console.log('After getUserMedia - success');
      
      const mimeType = getSupportedMimeType();
      console.log('Creating MediaRecorder with MIME type:', mimeType);
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      console.log('MediaRecorder created');
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      setDebug('Failed to start recording: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        console.log('Creating audio blob from chunks');
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Blob created, size:', audioBlob.size, 'type:', mimeType);
        await handleWhisperTranscription(audioBlob);
      };
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      console.log('Recording stopped');
    }
  };

  const handleWhisperTranscription = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      setIsLoadingRepeat(true);
      console.log('Sending audio for transcription, size:', audioBlob.size, 'type:', audioBlob.type);
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const { text: transcription } = await response.json();
      setText(transcription);
      await handleSpeak();
    } catch (error) {
      console.error('Transcription error:', error);
      setDebug('Transcription failed');
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
                  Interrupt task
                </Button>
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  size="md"
                  variant="shadow"
                  onClick={endSession}
                >
                  End session
                </Button>
              </div>
            </div>
          ) : !isLoadingSession ? (
            <div className="h-full justify-center items-center flex flex-col gap-8 w-[500px] self-center">
              <div className="flex flex-col gap-3 w-full">
                <Select
                  label="Select Avatar"
                  placeholder="Select an avatar"
                  selectedKeys={avatarId ? [avatarId] : []}
                  onChange={(e) => setAvatarId(e.target.value)}
                >
                  {AVATARS.map((avatar) => (
                    <SelectItem key={avatar.avatar_id} value={avatar.avatar_id}>
                      {avatar.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Select Voice"
                  placeholder="Select a voice"
                  selectedKeys={voiceId ? [voiceId] : []}
                  onChange={(e) => setVoiceId(e.target.value)}
                >
                  {VOICES.map((voice) => (
                    <SelectItem key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
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
                Start session
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
                  loading={isLoadingRepeat}
                  placeholder="Type something for the avatar to respond"
                  setInput={setText}
                  onSubmit={handleSpeak}
                />
                <Button
                  className={`ml-2 ${isRecording ? 'bg-red-500' : 'bg-blue-500'} text-white rounded-lg`}
                  size="md"
                  variant="shadow"
                  onPointerDown={() => {
                    console.log('Button pressed');
                    startRecording();
                  }}
                  onPointerUp={() => {
                    console.log('Button released');
                    stopRecording();
                  }}
                  onPointerLeave={() => {
                    console.log('Button left');
                    stopRecording();
                  }}
                >
                  Hold to Speak
                </Button>
              </div>
              
              {sourceDocs.length > 0 && (
                <div className="text-sm text-gray-500">
                  <p className="font-medium">Sources:</p>
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
              Start a session to begin chatting
            </div>
          )}
        </CardFooter>
      </Card>
      <p className="font-mono text-right">
        <span className="font-bold">Console:</span>
        <br />
        {debug}
      </p>
    </div>
  );
}
