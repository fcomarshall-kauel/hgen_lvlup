"use client";

import InteractiveAvatarGP from "@/components/InteractiveAvatar_GP";

export default function BancoRipleyIA() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden flex flex-col">
      {/* Header Banco Ripley */}
      <header className="bg-white text-gray-900 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <img
                alt="Logo Banco Ripley"
                className="h-12 w-auto object-contain"
                src="/Logo_Ripley_banco.png"
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Banco Ripley
                </h1>
                <p className="text-gray-600 text-sm">
                  Asistente Virtual Inteligente
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400" />
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 flex flex-col h-full">
        {/* Componente principal del avatar */}
        <div className="bg-white rounded-xl shadow-xl border border-purple-200 overflow-hidden w-full max-w-4xl h-full flex flex-col mx-auto">
          <InteractiveAvatarGP
            avatarId="Silas_CustomerSupport_public"
            avatarImage="/fabian_pic.png"
            avatarName="Fabián"
            backgroundColor="purple"
            buttonText="🚀 Iniciar Conversación con Fabián"
            institutionName="Banco Ripley"
            knowledgeId="5f63a1812a864e4b9c3a42c650c336e1"
            language="es"
            placeholderText="¿Qué quieres saber sobre Banco Ripley?..."
            primaryColor="purple"
            secondaryColor="violet"
            voiceId="05e192129b6b466493886273f8c23f78"
            welcomeMessage="¡Hola! Soy Fabián, tu asistente virtual de Banco Ripley. Es un gusto conocerte. Estoy aquí para ayudarte con tus preguntas financieras."
          />
        </div>
      </main>
    </div>
  );
}
