"use client";

import InteractiveAvatarGP from "@/components/InteractiveAvatar_GP";

export default function BancoChileAI() {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden flex flex-col">
      {/* Header Banco de Chile */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <img
                alt="Logo Banco de Chile"
                className="h-12 w-auto object-contain"
                src="https://assets.bancochile.cl/uploads/000/033/323/d9ed6331-33ac-42d7-946d-f526194fc5a3/original/bch-inverse.svg"
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Banco de Chile
                </h1>
                <p className="text-blue-100 text-sm">
                  Asistente Virtual Inteligente
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400" />
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 flex flex-col h-full">
        {/* Componente principal del avatar */}
        <div className="bg-white rounded-xl shadow-xl border border-blue-200 overflow-hidden w-full max-w-4xl h-full flex flex-col mx-auto">
          <InteractiveAvatarGP
            avatarId="Silas_CustomerSupport_public"
            avatarImage="/fabian_pic.png"
            avatarName="Fabián"
            backgroundColor="blue"
            buttonText="🚀 Iniciar Conversación con Fabián"
            institutionName="Banco de Chile"
            knowledgeId="73cb5e8bd85447d8954253639b406057"
            language="es"
            placeholderText="¿Qué quieres saber sobre Banco de Chile?..."
            primaryColor="blue"
            secondaryColor="indigo"
            voiceId="05e192129b6b466493886273f8c23f78"
            welcomeMessage="¡Hola! Soy Fabián, tu asistente virtual de Banco de Chile. Es un gusto conocerte. Estoy aquí para ayudarte"
          />
        </div>
      </main>
    </div>
  );
}
