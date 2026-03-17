"use client";

import Image from "next/image";
import InteractiveAvatarLiveAvatarQuickstart from "@/components/InteractiveAvatar_LiveAvatarQuickstart";
import { NOVANDINA_PERSONA } from "@/app/lib/personas";

export default function NovandinaIA() {
  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "linear-gradient(135deg, #f0ecfa 0%, #ffffff 50%, #ece8f8 100%)" }}>
      <header className="bg-white shadow-md flex-shrink-0 h-20">
        <div className="h-full px-6 flex items-center justify-center overflow-hidden">
          <Image
            alt="Logo Novandina"
            src="/Logo_Novandina.png"
            width={520}
            height={120}
            className="h-full w-auto object-contain scale-[2.2] origin-center"
            priority
            sizes="520px"
          />
        </div>
        <div className="h-1" style={{ background: "linear-gradient(90deg, #4126b4, #6b52d4, #4126b4)" }} />
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-5 flex flex-col h-full">
        <div
          className="rounded-xl shadow-xl overflow-hidden w-full max-w-4xl h-full flex flex-col mx-auto"
          style={{ border: "1.5px solid #d4cce8" }}
        >
          <InteractiveAvatarLiveAvatarQuickstart
            avatarId={NOVANDINA_PERSONA.avatarId}
            contextId={NOVANDINA_PERSONA.contextId}
            language={NOVANDINA_PERSONA.language}
            voiceId={NOVANDINA_PERSONA.voiceId}
            welcomeMessage={NOVANDINA_PERSONA.welcomeMessage}
            institutionName="Novandina"
          />
        </div>
      </main>
    </div>
  );
}
