import React from 'react';

interface ConversationStatusProps {
  isVoiceChatActive: boolean;
  isUserTalking: boolean;
  isAvatarTalking: boolean;
  isProcessing: boolean; // Nuevo: estado de procesamiento
  lastTranscript: string;
  chatMode: 'text_mode' | 'voice_mode';
  className?: string;
  mode?: 'overlay' | 'panel' | 'both'; // Nuevo: modo de renderizado
}

export default function ConversationStatus({
  isVoiceChatActive,
  isUserTalking,
  isAvatarTalking,
  isProcessing,
  lastTranscript,
  chatMode,
  className = "",
  mode = 'both'
}: ConversationStatusProps) {
  // Voice chat status overlay (for video mode)
  const VoiceStatusOverlay = () => {
    if (!isVoiceChatActive || chatMode !== 'voice_mode') return null;

    return (
      <div className="absolute top-2 left-2 flex items-center gap-2 bg-black bg-opacity-50 rounded-full px-3 py-2 z-10">
        <div className={`w-3 h-3 rounded-full ${
          isUserTalking ? 'bg-red-500 animate-pulse' : 
          isProcessing ? 'bg-yellow-500 animate-spin' :
          isAvatarTalking ? 'bg-blue-500 animate-pulse' :
          'bg-green-500'
        }`}></div>
        <span className="text-white text-sm">
          {isUserTalking ? '🎤 Escuchando...' : 
           isProcessing ? '🤔 Procesando...' :
           isAvatarTalking ? '🗣️ Tara hablando...' :
           '✅ Conversación activa'}
        </span>
      </div>
    );
  };

  // User transcript overlay (for video mode)
  const TranscriptOverlay = () => {
    if (!lastTranscript || !isProcessing || chatMode !== 'voice_mode') return null;

    return (
      <div className="absolute bottom-16 left-2 right-2 p-3 bg-black bg-opacity-70 text-white rounded-lg z-10">
        <p className="text-sm">
          <span className="text-blue-300">Tú: </span>
          {lastTranscript}
        </p>
      </div>
    );
  };

  // Main conversation status panel (for footer mode)
  const ConversationPanel = () => {
    if (chatMode !== 'voice_mode') return null;

    return (
      <div className="bg-white p-3 rounded-lg shadow border border-gray-200 w-full">
        <div className="text-center">
          <div 
            className={`w-16 h-16 mx-auto rounded-full text-white font-bold text-lg transition-all duration-200 shadow-lg flex items-center justify-center ${
              isUserTalking
                ? "bg-red-500 shadow-red-300 shadow-xl animate-pulse"
                : isProcessing
                ? "bg-yellow-500 shadow-yellow-300 shadow-xl animate-spin"
                : isAvatarTalking
                ? "bg-blue-500 shadow-blue-300 animate-pulse"
                : isVoiceChatActive
                ? "bg-green-500 shadow-green-300"
                : "bg-yellow-500 shadow-yellow-300"
            }`}
          >
            {isUserTalking ? "🔴" : 
             isProcessing ? "🤔" :
             isAvatarTalking ? "🗣️" :
             isVoiceChatActive ? "🎤" : "⏳"}
          </div>
          <div className="mt-2">
            <span className={`text-sm font-medium ${
              isUserTalking 
                ? "text-red-600" 
                : isProcessing
                ? "text-yellow-600"
                : isAvatarTalking
                ? "text-blue-600"
                : isVoiceChatActive
                ? "text-green-600"
                : "text-yellow-600"
            }`}>
              {isUserTalking 
                ? "🎤 Escuchando tu pregunta..." 
                : isProcessing
                ? "🤔 Pensando en tu respuesta..."
                : isAvatarTalking
                ? "🗣️ Tara está respondiendo..."
                : isVoiceChatActive
                ? "✅ Conversación activa - Habla libremente"
                : "⏳ Activando conversación de voz..."}
            </span>
          </div>
          
          {lastTranscript && !isUserTalking && (
            <div className="mt-3 p-3 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-center mb-2">
                <span className="text-blue-600 text-xs mr-2">💬</span>
                <p className="text-xs text-blue-700 font-semibold">
                  {isProcessing ? "Pregunta actual:" : "Última pregunta:"}
                </p>
              </div>
              <p className="text-sm text-blue-800 italic font-medium leading-relaxed">
                "{lastTranscript}"
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {(mode === 'overlay' || mode === 'both') && (
        <>
          <VoiceStatusOverlay />
          <TranscriptOverlay />
        </>
      )}
      {(mode === 'panel' || mode === 'both') && (
        <ConversationPanel />
      )}
    </div>
  );
} 