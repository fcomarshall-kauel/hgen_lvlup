"use client";

import Image from "next/image";
import InteractiveAvatarLiveAvatarQuickstart from "@/components/InteractiveAvatar_LiveAvatarQuickstart";
import { BANCORIPLEY_PERSONA } from "@/app/lib/personas";

export default function BancoRipleyIA() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden flex flex-col">
      {/* Header Banco Ripley */}
      <header className="bg-white text-gray-900 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <Image
                alt="Logo Banco Ripley"
                className="h-12 w-auto object-contain"
                src="/Logo_Ripley_banco.png"
                width={190}
                height={48}
                priority
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
          <InteractiveAvatarLiveAvatarQuickstart
            avatarId={BANCORIPLEY_PERSONA.avatarId}
            voiceId={BANCORIPLEY_PERSONA.voiceId}
            language={BANCORIPLEY_PERSONA.language}
            contextId={BANCORIPLEY_PERSONA.contextId}
            welcomeMessage={BANCORIPLEY_PERSONA.welcomeMessage}
            institutionName="Banco Ripley"
            primaryColorHex="#7c3aed"
            primaryColorHexActive="#6d28d9"
          />
        </div>
      </main>
    </div>
  );
}
