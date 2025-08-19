"use client";

import InteractiveAvatarBancochile from "@/components/InteractiveAvatar_bancochile";
import Image from "next/image";

export default function BancoChileAI() {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden flex flex-col">
      {/* Header Banco de Chile */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <Image
                src="/bch_logo.png"
                alt="Logo Banco de Chile"
                width={256}
                height={192}
                className="object-contain"
                onError={() => {
                  console.log("Image failed to load");
                }}
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Asistente 
                </h1>
                <p className="text-blue-100 text-sm"> Virtual Inteligente</p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400"></div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 flex flex-col h-full">
        {/* Componente principal del avatar */}
        <div className="bg-white rounded-xl shadow-xl border border-blue-200 overflow-hidden w-full max-w-4xl h-full flex flex-col mx-auto">
          <InteractiveAvatarBancochile />
        </div>
      </main>
    </div>
  );
} 