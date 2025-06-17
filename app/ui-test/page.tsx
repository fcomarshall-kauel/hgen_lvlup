"use client";

import { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Spinner,
  Slider,
  Select,
  SelectItem,
} from "@nextui-org/react";
import Image from "next/image";
import ConversationStatus from "@/components/ConversationStatus";
import ConversationHistory, { ConversationMessage } from "@/components/ConversationHistory";
import InteractiveAvatarTextInput from "@/components/InteractiveAvatarTextInput";

export default function UITestPage() {
  // Simulation states
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'text_mode' | 'voice_mode'>('voice_mode');
  
  // Conversation states
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(true);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [currentAvatarMessage, setCurrentAvatarMessage] = useState("");
  const [text, setText] = useState("");
  
  // Test controls
  const [autoSimulation, setAutoSimulation] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(2);
  
  // Conversation history
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  
  // Mock video element
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Sample transcripts for testing
  const sampleTranscripts = [
    "¿Cuáles son los horarios de admisión?",
    "¿Qué carreras ofrece la universidad?",
    "¿Cómo puedo contactar con un asesor académico?",
    "¿Cuál es el proceso de matrícula?",
    "¿Hay becas disponibles para estudiantes?",
  ];

  // Auto simulation effect
  useEffect(() => {
    if (!autoSimulation || !isSessionActive) return;

    const interval = setInterval(() => {
      simulateRandomInteraction();
    }, simulationSpeed * 1000);

    return () => clearInterval(interval);
  }, [autoSimulation, isSessionActive, simulationSpeed]);

  const addToHistory = (type: 'user' | 'avatar', content: string) => {
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    console.log('🔥 Adding to history:', { type, content, id: newMessage.id });
    setConversationHistory(prev => {
      const updated = [...prev, newMessage];
      console.log('📝 Updated history:', updated);
      return updated;
    });
  };

  const simulateRandomInteraction = () => {
    if (isUserTalking || isAvatarTalking || isProcessing) return;

    const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
    
    // Simulate user talking (without showing transcript yet)
    setIsUserTalking(true);
    
    // After 2 seconds, user stops talking and we capture the transcript
    setTimeout(() => {
      setIsUserTalking(false);
      setLastTranscript(randomTranscript); // NOW we update the transcript
      
      // Add user message to history
      addToHistory('user', randomTranscript);
      
      // Start processing state
      setIsProcessing(true);
      
      // After 1.5-3 seconds of processing, avatar starts responding
      const processingTime = 1500 + Math.random() * 1500;
      setTimeout(() => {
        setIsProcessing(false);
        setIsAvatarTalking(true);
        
        // Generate avatar response
        const avatarResponses = [
          "Entiendo tu pregunta. Déjame ayudarte con esa información sobre la Universidad de Tarapacá.",
          "Esa es una excelente consulta. Te proporciono la respuesta completa sobre nuestros programas académicos.",
          "Perfecto, puedo orientarte sobre ese tema específico. La UTA ofrece diversas opciones.",
          "Es una pregunta muy común entre los estudiantes. Te explico todos los detalles relevantes.",
          "Me alegra que preguntes sobre eso. Aquí tienes la información actualizada que necesitas."
        ];
        const randomResponse = avatarResponses[Math.floor(Math.random() * avatarResponses.length)];
        
        // Set current avatar message for real-time display
        setCurrentAvatarMessage(randomResponse);
        
        // Add avatar response to history
        addToHistory('avatar', randomResponse);
        
        // Avatar talks for 3-5 seconds
        const talkDuration = 3000 + Math.random() * 2000;
        setTimeout(() => {
          setIsAvatarTalking(false);
          setCurrentAvatarMessage(""); // Clear current message when done talking
        }, talkDuration);
      }, processingTime);
    }, 2000);
  };

  const startSession = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSessionActive(true);
    setIsLoading(false);
    
    // Add welcome message to history
    addToHistory('avatar', '¡Hola! Bienvenido al simulador. Soy Tara, tu asistente virtual de la UTA.');
    
    // Simulate welcome message
    setTimeout(() => {
      setIsAvatarTalking(true);
      setCurrentAvatarMessage('¡Hola! Bienvenido al simulador. Soy Tara, tu asistente virtual de la UTA.');
      setTimeout(() => {
        setIsAvatarTalking(false);
        setCurrentAvatarMessage('');
      }, 3000);
    }, 500);
  };

  const endSession = () => {
    setIsSessionActive(false);
    setIsVoiceChatActive(false);
    setIsUserTalking(false);
    setIsAvatarTalking(false);
    setIsProcessing(false);
    setLastTranscript("");
    setCurrentAvatarMessage("");
    setAutoSimulation(false);
    setConversationHistory([]);
  };

  const toggleVoiceChat = () => {
    if (chatMode === 'voice_mode') {
      setIsVoiceChatActive(!isVoiceChatActive);
    }
  };

  const handleModeChange = (mode: 'text_mode' | 'voice_mode') => {
    setChatMode(mode);
    if (mode === 'text_mode') {
      setIsVoiceChatActive(false);
    } else {
      setIsVoiceChatActive(true);
    }
  };

  const handleSpeak = () => {
    if (!text.trim()) return;
    
    const userMessage = text;
    
    // Add user message to history
    addToHistory('user', userMessage);
    setLastTranscript(userMessage);
    
    // Start processing
    setIsProcessing(true);
    setText("");
    
    // Simulate processing time, then avatar response
    setTimeout(() => {
      setIsProcessing(false);
      setIsAvatarTalking(true);
      
      // Generate avatar response
      const avatarResponses = [
        "Entiendo tu consulta sobre la UTA. Aquí tienes la información detallada que solicitas.",
        "Esa es una pregunta muy interesante sobre nuestros servicios. Te ayudo con la respuesta completa.",
        "Perfecto, puedo orientarte sobre ese tema específico de la universidad.",
        "Gracias por tu pregunta. Te proporciono todos los detalles relevantes sobre la UTA.",
        "Es un gusto ayudarte. Aquí está la información académica que necesitas."
      ];
      const randomResponse = avatarResponses[Math.floor(Math.random() * avatarResponses.length)];
      
      // Set current avatar message for real-time display
      setCurrentAvatarMessage(randomResponse);
      
      // Add avatar response to history
      addToHistory('avatar', randomResponse);
      
      // Avatar talks for 2-5 seconds
      setTimeout(() => {
        setIsAvatarTalking(false);
        setCurrentAvatarMessage(""); // Clear current message when done talking
      }, 2000 + Math.random() * 3000);
    }, 1000 + Math.random() * 2000);
  };

  const simulateUserTalking = () => {
    const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
    setIsUserTalking(true);
    
    setTimeout(() => {
      setIsUserTalking(false);
      setLastTranscript(randomTranscript); // Update transcript when user stops talking
      
      // Add user message to history
      addToHistory('user', randomTranscript);
      
      // Start processing after user stops talking
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setIsAvatarTalking(true);
        
        // Generate avatar response
        const avatarResponses = [
          "Entiendo tu pregunta. Déjame ayudarte con esa información sobre la Universidad de Tarapacá.",
          "Esa es una excelente consulta. Te proporciono la respuesta completa sobre nuestros programas académicos.",
          "Perfecto, puedo orientarte sobre ese tema específico. La UTA ofrece diversas opciones.",
          "Es una pregunta muy común entre los estudiantes. Te explico todos los detalles relevantes.",
          "Me alegra que preguntes sobre eso. Aquí tienes la información actualizada que necesitas."
        ];
        const randomResponse = avatarResponses[Math.floor(Math.random() * avatarResponses.length)];
        
        // Set current avatar message for real-time display
        setCurrentAvatarMessage(randomResponse);
        
        // Add avatar response to history
        addToHistory('avatar', randomResponse);
        
        // Avatar talks for 3-5 seconds
        const talkDuration = 3000 + Math.random() * 2000;
        setTimeout(() => {
          setIsAvatarTalking(false);
          setCurrentAvatarMessage(""); // Clear current message when done talking
        }, talkDuration);
      }, 1500 + Math.random() * 1000);
    }, 3000);
  };

  const simulateAvatarTalking = () => {
    if (isUserTalking || isAvatarTalking || isProcessing) return;
    
    setIsAvatarTalking(true);
    
    // Generate avatar response
    const avatarResponses = [
      "¡Hola! ¿En qué puedo ayudarte hoy con información sobre la Universidad de Tarapacá?",
      "Estoy aquí para responder todas tus consultas académicas. ¿Qué te interesa saber?",
      "Como asistente virtual de la UTA, puedo orientarte sobre carreras, admisiones y más.",
      "¿Tienes alguna pregunta específica sobre nuestros programas o servicios universitarios?",
      "Es un gusto poder ayudarte. ¿Sobre qué tema de la universidad necesitas información?"
    ];
    const randomResponse = avatarResponses[Math.floor(Math.random() * avatarResponses.length)];
    
    // Set current avatar message for real-time display
    setCurrentAvatarMessage(randomResponse);
    
    // Add avatar message to history
    addToHistory('avatar', randomResponse);
    
    setTimeout(() => {
      setIsAvatarTalking(false);
      setCurrentAvatarMessage(""); // Clear current message when done talking
    }, 3000 + Math.random() * 2000);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 via-purple-700 to-pink-700 text-white shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold tracking-tight">
                🧪 UI Test Lab - Avatar Simulator
              </h1>
              <p className="text-purple-100 text-sm">Simulador de Estados HeyGen</p>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>
      </header>

      <div className="flex-1 flex">
        {/* Main Avatar Area */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-6 flex flex-col justify-center items-center">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden w-full h-full flex flex-col">
            <Card className="border-2 border-purple-200 shadow-lg h-full flex flex-col">
              <CardBody className="min-h-[300px] h-[40vh] flex flex-col justify-center items-center bg-gradient-to-br from-purple-50 to-pink-50 relative flex-shrink-0">
                {isSessionActive ? (
                                      <div className="h-full w-full justify-center items-center flex rounded-lg overflow-hidden border-4 border-purple-300 shadow-inner relative">
                    {/* Mock Video */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🤖</div>
                        <p className="text-lg font-semibold">Tara - Avatar Simulado</p>
                        <p className="text-sm opacity-80">
                          {isAvatarTalking ? "Hablando..." : 
                           isUserTalking ? "Escuchando..." : 
                           isProcessing ? "Procesando..." :
                           "Esperando..."}
                        </p>
                        {/* Show current avatar message */}
                        {isAvatarTalking && currentAvatarMessage && (
                          <div className="mt-2 max-w-xs">
                            <p className="text-xs text-gray-300 bg-black bg-opacity-50 p-2 rounded">
                              💬 "{currentAvatarMessage}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conversation Status Overlays */}
                    <ConversationStatus
                      isVoiceChatActive={isVoiceChatActive}
                      isUserTalking={isUserTalking}
                      isAvatarTalking={isAvatarTalking}
                      isProcessing={isProcessing}
                      lastTranscript={lastTranscript}
                      currentAvatarMessage={currentAvatarMessage}
                      chatMode={chatMode}
                      mode="overlay"
                    />

                    {/* Control buttons */}
                    <div className="flex flex-col gap-1 absolute bottom-2 right-2">
                      <Button
                        className="bg-gradient-to-tr from-purple-600 to-pink-600 text-white rounded-lg"
                        size="sm"
                        variant="shadow"
                        onClick={() => setIsAvatarTalking(false)}
                        disabled={!isAvatarTalking}
                      >
                        Interrumpir
                      </Button>
                      <Button
                        className="bg-gradient-to-tr from-red-500 to-red-600 text-white rounded-lg"
                        size="sm"
                        variant="shadow"
                        onClick={endSession}
                      >
                        Terminar
                      </Button>
                    </div>
                  </div>
                ) : !isLoading ? (
                  <div className="h-full justify-center items-center flex flex-col gap-3 w-[400px] self-center">
                    <div className="text-center">
                      <h2 className="text-lg font-bold text-purple-800 mb-1">🧪 UI Test Lab</h2>
                      <p className="text-purple-600 text-xs">Simulador de Estados</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-6xl mb-2">🤖</div>
                      <h3 className="text-base font-bold text-purple-800 mb-1">Avatar Simulator</h3>
                      <p className="text-purple-600 text-xs leading-relaxed max-w-xs mx-auto">
                        Prueba todos los estados de conversación sin usar la API real.
                      </p>
                    </div>
                    
                    <Button
                      className="bg-gradient-to-tr from-purple-600 to-pink-600 w-full text-white font-semibold"
                      size="md"
                      variant="shadow"
                      onClick={startSession}
                    >
                      🚀 Iniciar Simulación
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Spinner color="secondary" size="md" />
                    <p className="text-purple-600 font-medium text-sm">Iniciando simulación...</p>
                  </div>
                )}
              </CardBody>
              
              <Divider className="bg-purple-200" />
              
              <CardFooter className="flex flex-col gap-3 relative bg-gradient-to-br from-purple-50 to-white p-4 flex-1 overflow-hidden">
                {/* Status Panel - Single container */}
                <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    {/* Mode selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-700">Modo:</span>
                      <div className="flex">
                        <button
                          onClick={() => handleModeChange('voice_mode')}
                          className={`py-1.5 px-3 text-xs font-medium rounded-l-lg border transition-colors ${
                            chatMode === "voice_mode"
                              ? "bg-purple-600 text-white border-purple-600"
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          }`}
                          disabled={!isSessionActive}
                        >
                          🎤 Conversación
                        </button>
                        <button
                          onClick={() => handleModeChange('text_mode')}
                          className={`py-1.5 px-3 text-xs font-medium rounded-r-lg border-l-0 border transition-colors ${
                            chatMode === "text_mode"
                              ? "bg-purple-600 text-white border-purple-600"
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          }`}
                        >
                          💬 Texto
                        </button>
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        isUserTalking ? 'bg-red-500 animate-pulse' :
                        isAvatarTalking ? 'bg-blue-500 animate-pulse' :
                        isProcessing ? 'bg-yellow-500 animate-pulse' :
                        isSessionActive ? 'bg-green-500' :
                        'bg-gray-300'
                      }`}></div>
                      <span className="text-xs text-gray-600 font-medium">
                        {isUserTalking ? 'Usuario hablando' :
                         isAvatarTalking ? 'Avatar respondiendo' :
                         isProcessing ? 'Procesando...' :
                         isSessionActive ? 'Conversación activa' :
                         'En espera'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mode-specific content - Text mode only */}
                {chatMode === "text_mode" && (
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                    <InteractiveAvatarTextInput
                      disabled={!isSessionActive}
                      input={text}
                      label="Texto de prueba"
                      loading={isAvatarTalking}
                      placeholder="Escribe algo para probar..."
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
                    isSessionActive && (
                      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center flex-1 flex flex-col justify-center">
                        <div className="text-2xl mb-2">💭</div>
                        <p className="text-sm text-gray-600 mb-1">No hay conversación aún</p>
                        <p className="text-xs text-gray-500">
                          {chatMode === 'voice_mode' 
                            ? 'Usa los controles de voz para comenzar una conversación'
                            : 'Escribe un mensaje para comenzar'
                          }
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>

        {/* Control Panel */}
        <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-purple-800 mb-2">🎛️ Panel de Control</h3>
              <div className="w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>

            {/* Status Display */}
            <Card className="border border-purple-200">
              <CardBody className="p-3">
                <h4 className="font-semibold text-sm mb-2 text-purple-700">📊 Estado Actual</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Sesión:</span>
                    <span className={isSessionActive ? "text-green-600" : "text-red-600"}>
                      {isSessionActive ? "✅ Activa" : "❌ Inactiva"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chat de Voz:</span>
                    <span className={isVoiceChatActive ? "text-green-600" : "text-gray-500"}>
                      {isVoiceChatActive ? "✅ Activo" : "⚪ Inactivo"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usuario:</span>
                    <span className={isUserTalking ? "text-red-600" : "text-gray-500"}>
                      {isUserTalking ? "🎤 Hablando" : "⚪ Silencio"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Procesando:</span>
                    <span className={isProcessing ? "text-yellow-600" : "text-gray-500"}>
                      {isProcessing ? "🤔 Procesando" : "⚪ Inactivo"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avatar:</span>
                    <span className={isAvatarTalking ? "text-blue-600" : "text-gray-500"}>
                      {isAvatarTalking ? "🗣️ Hablando" : "⚪ Silencio"}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Manual Controls */}
            <Card className="border border-purple-200">
              <CardBody className="p-3">
                <h4 className="font-semibold text-sm mb-2 text-purple-700">🎮 Controles Manuales</h4>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    className="w-full"
                    onClick={simulateUserTalking}
                    disabled={!isSessionActive || isUserTalking || isAvatarTalking || isProcessing}
                  >
                    🎤 Simular Usuario Hablando
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="w-full"
                    onClick={simulateAvatarTalking}
                    disabled={!isSessionActive || isUserTalking || isAvatarTalking || isProcessing}
                  >
                    🗣️ Simular Avatar Hablando
                  </Button>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    className="w-full"
                    onClick={() => {
                      setIsUserTalking(false);
                      setIsAvatarTalking(false);
                      setIsProcessing(false);
                    }}
                    disabled={!isUserTalking && !isAvatarTalking && !isProcessing}
                  >
                    ⏹️ Detener Todo
                  </Button>
                  <Button
                    size="sm"
                    color="secondary"
                    variant="flat"
                    className="w-full"
                    onClick={() => setConversationHistory([])}
                    disabled={conversationHistory.length === 0}
                  >
                    🗑️ Limpiar Historial
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Auto Simulation */}
            <Card className="border border-purple-200">
              <CardBody className="p-3">
                <h4 className="font-semibold text-sm mb-2 text-purple-700">🤖 Simulación Automática</h4>
                <div className="space-y-3">
                  <Button
                    size="sm"
                    color={autoSimulation ? "danger" : "success"}
                    variant={autoSimulation ? "solid" : "flat"}
                    className="w-full"
                    onClick={() => setAutoSimulation(!autoSimulation)}
                    disabled={!isSessionActive}
                  >
                    {autoSimulation ? "⏹️ Detener Auto" : "▶️ Iniciar Auto"}
                  </Button>
                  
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Velocidad: {simulationSpeed}s
                    </label>
                    <Slider
                      size="sm"
                      step={0.5}
                      maxValue={10}
                      minValue={1}
                      value={simulationSpeed}
                      onChange={(value) => setSimulationSpeed(value as number)}
                      className="max-w-md"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Sample Transcripts */}
            <Card className="border border-purple-200">
              <CardBody className="p-3">
                <h4 className="font-semibold text-sm mb-2 text-purple-700">💬 Transcripciones de Prueba</h4>
                <div className="space-y-1">
                  {sampleTranscripts.map((transcript, index) => (
                    <button
                      key={index}
                      className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-purple-50 rounded border text-gray-700 hover:text-purple-700 transition-colors"
                      onClick={() => setLastTranscript(transcript)}
                    >
                      "{transcript}"
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
} 