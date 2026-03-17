"use client";

import InteractiveAvatarGP from "@/components/InteractiveAvatar_GP";

// ============================================
// PARÁMETROS DE CONFIGURACIÓN - EDITAR AQUÍ
// ============================================
const CONFIG = {
  // Títulos del Header
  titulo: "Simulador de Feedback",
  subtitulo: "Practica y mejora tu comunicación",

  // Configuración del Avatar
  knowledgeId: "1d6856cbe5de4034b642a3e8fe8b3371",
  avatarId: "Silas_CustomerSupport_public",
  voiceId: "4ee882e5f5aa4f97be9eeb5596f39a7a",
  language: "es",
  avatarName: "Coach Virtual",
  institutionName: "Simulador de Feedback",
  avatarImage: "/fabian_pic.png",
  welcomeMessage:
    "¡Hola! Soy tu coach virtual de comunicación. Estoy aquí para ayudarte a practicar y mejorar tus habilidades para dar feedback. Hoy haremos una simulación de feedback, ¿todo listo para comenzar la simulación?",

  // Textos de la interfaz
  placeholderText: "Describe el escenario que quieres practicar...",
  buttonText: "🎯 Comenzar Práctica de Feedback",

  // Colores
  primaryColor: "purple",
  secondaryColor: "indigo",
  backgroundColor: "purple",
};
// ============================================

export default function CommunicationSimulator() {
  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 overflow-hidden flex flex-col">
      {/* Header Simulador de Habilidades */}
      <header className="bg-white text-gray-900 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-3 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {CONFIG.titulo}
                </h1>
                <p className="text-gray-600 text-sm">{CONFIG.subtitulo}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400" />
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 flex flex-col h-full">
        {/* Componente principal del avatar */}
        <div className="bg-white rounded-xl shadow-xl border border-purple-200 overflow-hidden w-full max-w-4xl h-full flex flex-col mx-auto">
          <InteractiveAvatarGP
            avatarId={CONFIG.avatarId}
            avatarImage={CONFIG.avatarImage}
            avatarName={CONFIG.avatarName}
            backgroundColor={CONFIG.backgroundColor}
            buttonText={CONFIG.buttonText}
            institutionName={CONFIG.institutionName}
            knowledgeId={CONFIG.knowledgeId}
            language={CONFIG.language}
            placeholderText={CONFIG.placeholderText}
            primaryColor={CONFIG.primaryColor}
            secondaryColor={CONFIG.secondaryColor}
            voiceId={CONFIG.voiceId}
            welcomeMessage={CONFIG.welcomeMessage}
          />
        </div>
      </main>

      {/* Footer informativo */}
      <footer className="bg-white border-t border-gray-200 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-purple-600">💬</span>
              <span>Escucha activa</span>
            </div>
            <div className="w-1 h-4 bg-gray-300 rounded" />
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-purple-600">🎤</span>
              <span>Expresión clara</span>
            </div>
            <div className="w-1 h-4 bg-gray-300 rounded" />
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-purple-600">🤝</span>
              <span>Empatía</span>
            </div>
            <div className="w-1 h-4 bg-gray-300 rounded" />
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-purple-600">✨</span>
              <span>Retroalimentación constructiva</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
