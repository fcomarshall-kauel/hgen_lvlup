"use client";

import Image from "next/image";
import InteractiveAvatarLiveAvatarQuickstart from "@/components/InteractiveAvatar_LiveAvatarQuickstart";
import { SANTANDER_PERSONA } from "@/app/lib/personas";

export default function SantanderIA() {
  return (
    <div className="h-screen bg-gradient-to-br from-red-50 via-white to-red-50 overflow-hidden flex flex-col">
      {/* Header Santander */}
      <header className="bg-white text-gray-900 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <Image
                alt="Logo Satander"
                className="h-12 w-auto object-contain"
                src="/Logo_Santander.png"
                width={220}
                height={48}
                priority
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Santander</h1>
                <p className="text-gray-600 text-sm">
                  Asistente Virtual Inteligente
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-red-400 via-red-300 to-red-400" />
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 flex flex-col h-full">
        {/* Componente principal del avatar */}
        <div className="bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden w-full max-w-4xl h-full flex flex-col mx-auto">
          <InteractiveAvatarLiveAvatarQuickstart
            avatarId={SANTANDER_PERSONA.avatarId}
            voiceId={SANTANDER_PERSONA.voiceId}
            language={SANTANDER_PERSONA.language}
            contextId={SANTANDER_PERSONA.contextId}
            welcomeMessage={SANTANDER_PERSONA.welcomeMessage}
            institutionName="Santander"
            primaryColorHex="#e11d48"
            primaryColorHexActive="#be123c"
          />
        </div>
      </main>
    </div>
  );
}
