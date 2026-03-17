"use client";

import Image from "next/image";

import InteractiveAvatarGP from "@/components/InteractiveAvatar_GP";

export default function HogarDeCristoIA() {
  return (
    <div className="h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-hidden flex flex-col">
      {/* Header Hogar de Cristo */}
      <header className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 text-white shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <Image
                alt="Logo Hogar de Cristo"
                className="object-contain"
                height={80}
                src="/hdc_log.png"
                width={180}
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Hogar de Cristo
                </h1>
                <p className="text-teal-100 text-sm">
                  Asistente Virtual Inteligente
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400" />
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 flex flex-col h-full">
        {/* Componente principal del avatar */}
        <div className="bg-white rounded-xl shadow-xl border border-teal-200 overflow-hidden w-full max-w-4xl h-full flex flex-col mx-auto">
          <InteractiveAvatarGP
            avatarId="Silas_CustomerSupport_public"
            avatarImage="/fabian_pic.png"
            avatarName="Asistente"
            backgroundColor="teal"
            buttonText="🚀 Iniciar Conversación con Hogar de Cristo"
            institutionName="Hogar de Cristo"
            knowledgeId="972c3f791654445490c3638eb2c14999"
            language="es"
            placeholderText="¿Qué quieres saber sobre Hogar de Cristo?..."
            primaryColor="teal"
            secondaryColor="cyan"
            voiceId="05e192129b6b466493886273f8c23f78"
            welcomeMessage="¡Hola! 👋 Soy el asistente virtual de Hogar de Cristo. ¿Te gustaría conocer cómo planificar con anticipación un homenaje que refleje tus valores y cuide a tu familia?"
          />
        </div>
      </main>
    </div>
  );
}
