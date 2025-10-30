"use client";

import InteractiveAvatarGP from "@/components/InteractiveAvatar_GP";
import Image from "next/image";

export default function HogarDeCristoIA() {
  return (
    <div className="h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-hidden flex flex-col">
      {/* Header Hogar de Cristo */}
      <header className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 text-white shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <Image
                src="/hdc_log.png"
                alt="Logo Hogar de Cristo"
                width={180}
                height={80}
                className="object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Hogar de Cristo
                </h1>
                <p className="text-teal-100 text-sm">Asistente Virtual Inteligente</p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400"></div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 flex flex-col h-full">
        {/* Componente principal del avatar */}
        <div className="bg-white rounded-xl shadow-xl border border-teal-200 overflow-hidden w-full max-w-4xl h-full flex flex-col mx-auto">
          <InteractiveAvatarGP
            knowledgeId="972c3f791654445490c3638eb2c14999"
            avatarId="Silas_CustomerSupport_public"
            voiceId="05e192129b6b466493886273f8c23f78"
            language="es"
            avatarName="Asistente"
            institutionName="Hogar de Cristo"
            avatarImage="/fabian_pic.png"
            welcomeMessage="¡Hola! 👋 Soy el asistente virtual de Hogar de Cristo. ¿Te gustaría conocer cómo planificar con anticipación un homenaje que refleje tus valores y cuide a tu familia?"
            primaryColor="teal"
            secondaryColor="cyan"
            backgroundColor="teal"
            placeholderText="¿Qué quieres saber sobre Hogar de Cristo?..."
            buttonText="🚀 Iniciar Conversación con Hogar de Cristo"
          />
        </div>
      </main>
    </div>
  );
}
