import React from 'react';

interface ConversationStatusProps {
  isVoiceChatActive: boolean;
  isUserTalking: boolean;
  isAvatarTalking: boolean;
  isProcessing: boolean; // Nuevo: estado de procesamiento
  lastTranscript: string;
  currentAvatarMessage?: string; // Nuevo: mensaje actual del avatar
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
  currentAvatarMessage = "",
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
    if (chatMode !== 'voice_mode') return null;

    // Show live talking indicator when user is speaking
    if (isUserTalking) {
      return (
        <div className="absolute bottom-16 left-2 right-2 p-3 bg-black bg-opacity-70 text-white rounded-lg z-10">
          <p className="text-sm">
            <span className="text-red-300 animate-pulse">🎤 </span>
            <span className="text-gray-300 animate-pulse">Hablando...</span>
          </p>
        </div>
      );
    }

    // Show final transcript when processing
    if (lastTranscript && isProcessing) {
      return (
        <div className="absolute bottom-16 left-2 right-2 p-3 bg-black bg-opacity-70 text-white rounded-lg z-10">
          <p className="text-sm">
            <span className="text-blue-300">Tú: </span>
            {lastTranscript}
          </p>
        </div>
      );
    }

    return null;
  };

  // Main conversation status panel (for footer mode) - Modern horizontal layout
  const ConversationPanel = () => {
    if (chatMode !== 'voice_mode') return null;

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 w-full">
        {/* Status Bar - Horizontal */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div 
              className={`w-10 h-10 rounded-full text-white font-bold text-sm transition-all duration-200 shadow-md flex items-center justify-center ${
                isUserTalking
                  ? "bg-red-500 animate-pulse"
                  : isProcessing
                  ? "bg-yellow-500 animate-spin"
                  : isAvatarTalking
                  ? "bg-blue-500 animate-pulse"
                  : isVoiceChatActive
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            >
              {isUserTalking ? "🎤" : 
               isProcessing ? "🤔" :
               isAvatarTalking ? "🗣️" :
               isVoiceChatActive ? "✅" : "⏳"}
            </div>
            
            {/* Status Text */}
            <div>
              <span className={`text-sm font-medium ${
                isUserTalking 
                  ? "text-red-600" 
                  : isProcessing
                  ? "text-yellow-600"
                  : isAvatarTalking
                  ? "text-blue-600"
                  : isVoiceChatActive
                  ? "text-green-600"
                  : "text-gray-600"
              }`}>
                {isUserTalking 
                  ? "Escuchando tu pregunta..." 
                  : isProcessing
                  ? "Pensando en tu respuesta..."
                  : isAvatarTalking
                  ? "Tara está respondiendo..."
                  : isVoiceChatActive
                  ? "Conversación activa - Habla libremente"
                  : "Activando conversación de voz..."}
              </span>
            </div>
          </div>
          
          {/* Connection indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isVoiceChatActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-xs text-gray-500">
              {isVoiceChatActive ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
        
        {/* Avatar Current Message - When talking */}
        {isAvatarTalking && currentAvatarMessage && (
          <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100">
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-xs mt-0.5">🗣️</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-700 font-medium mb-1">
                  Tara está diciendo:
                </p>
                <p className="text-sm text-green-800 leading-relaxed">
                  "{currentAvatarMessage}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Last Transcript - Compact horizontal */}
        {lastTranscript && !isUserTalking && !isAvatarTalking && (
          <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-xs mt-0.5">💬</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-700 font-medium mb-1">
                  {isProcessing ? "Pregunta actual:" : "Última pregunta:"}
                </p>
                <p className="text-sm text-blue-800 leading-relaxed truncate">
                  "{lastTranscript}"
                </p>
              </div>
            </div>
          </div>
        )}
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