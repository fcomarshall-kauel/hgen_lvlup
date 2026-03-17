"use client";

import Image from "next/image";
import InteractiveAvatarLiveAvatarQuickstart from "@/components/InteractiveAvatar_LiveAvatarQuickstart";
import { BANCOCHILE_PERSONA } from "@/app/lib/personas";

export default function BancoChileAI() {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden flex flex-col">
      {/* Header Banco de Chile */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <Image
                alt="Logo Banco de Chile"
                className="h-12 w-auto object-contain"
                src="https://assets.bancochile.cl/uploads/000/033/323/d9ed6331-33ac-42d7-946d-f526194fc5a3/original/bch-inverse.svg"
                width={190}
                height={48}
                priority
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
          <InteractiveAvatarLiveAvatarQuickstart
            avatarId={BANCOCHILE_PERSONA.avatarId}
            voiceId={BANCOCHILE_PERSONA.voiceId}
            language={BANCOCHILE_PERSONA.language}
            contextId={BANCOCHILE_PERSONA.contextId}
            welcomeMessage={BANCOCHILE_PERSONA.welcomeMessage}
            institutionName="Banco de Chile"
            primaryColorHex="#1d4ed8"
            primaryColorHexActive="#1e40af"
          />
        </div>
      </main>
    </div>
  );
}
