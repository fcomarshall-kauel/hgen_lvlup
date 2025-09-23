"use client";

import InteractiveAvatarGP from "@/components/InteractiveAvatar_GP";
import Image from "next/image";

export default function SantanderIA() {
  return (
    <div className="h-screen bg-gradient-to-br from-red-50 via-white to-red-50 overflow-hidden flex flex-col">
      {/* Header Santander */}
      <header className="bg-white text-gray-900 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <img
                src="/Logo_Santander.png"
                alt="Logo Satander"
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Santander
                </h1>
                <p className="text-gray-600 text-sm">Asistente Virtual Inteligente</p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-red-400 via-red-300 to-red-400"></div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 flex flex-col h-full">
        {/* Componente principal del avatar */}
        <div className="bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden w-full max-w-4xl h-full flex flex-col mx-auto">
          <InteractiveAvatarGP
            knowledgeId="66c6c4428ccc41e6bd9d7c344742ed54"
            avatarId="Silas_CustomerSupport_public"
            voiceId="05e192129b6b466493886273f8c23f78"
            language="es"
            avatarName="Fabián"
            institutionName="Santander"
            avatarImage="/fabian_pic.png"
            welcomeMessage="¡Hola! Soy Fabián, tu asistente virtual del Banco Santander. Es un gusto conocerte. Estoy aquí para ayudarte con tus preguntas financieras."
            primaryColor="red"
            secondaryColor="rose"
            backgroundColor="red"
            placeholderText="¿Qué quieres saber sobre Santander?..."
            buttonText="🚀 Iniciar Conversación con Fabián"
          />
        </div>
      </main>
    </div>
  );
}
