"use client";

import InteractiveAvatarUta from "@/components/InteractiveAvatar_uta";
import Image from "next/image";

export default function UtaAI() {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden flex flex-col">
      {/* Header universitario */}
      <header className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 text-white shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1">
                <Image
                  src="/logo_web_uta.png"
                  alt="Logo Universidad de Tarapacá"
                  width={40}
                  height={40}
                  className="object-contain ml-0.5 mt-0.5"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Universidad de Tarapacá
                </h1>
                <p className="text-blue-100 text-sm">Asistente Virtual UTA</p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 flex flex-col h-full">
        {/* Componente principal del avatar */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden w-full max-w-4xl h-full flex flex-col mx-auto">
          <InteractiveAvatarUta />
        </div>
      </main>
    </div>
  );
} 