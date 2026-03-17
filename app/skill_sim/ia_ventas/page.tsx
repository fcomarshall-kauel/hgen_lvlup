"use client";

import { useState } from "react";
import { Select, SelectItem } from "@nextui-org/react";

import InteractiveAvatarGP from "@/components/InteractiveAvatar_GP";

// ============================================
// PARÁMETROS DE CONFIGURACIÓN - EDITAR AQUÍ
// ============================================
const CONFIG = {
  // Títulos del Header
  titulo: "Simulador de Ventas",
  subtitulo: "Practica y mejora tus técnicas de Venta",

  // Configuración del Avatar
  knowledgeId: "b32feca4aa0c4e7383971f1a38d1af9a",
  avatarId: "Silas_CustomerSupport_public",
  voiceId: "05e192129b6b466493886273f8c23f78",
  language: "es",
  avatarName: "Coach Ventas",
  institutionName: "Simulador para Técnicas de Venta",
  avatarImage: "/fabian_pic.png",
  welcomeMessage:
    "Hola, soy tu Coach-Tutor Dinámico de SPIN Selling y Simulación de Ventas B2B. He recibido la configuración de la simulación y estoy listo para comenzar.",

  // Textos de la interfaz
  placeholderText: "Describe el escenario que quieres practicar...",
  buttonText: "🎯 Comenzar Práctica de Ventas",

  // Colores
  primaryColor: "purple",
  secondaryColor: "indigo",
  backgroundColor: "purple",
};
// ============================================

export default function CommunicationSimulator() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string>("");

  // Estados de configuración
  const [rolContacto, setRolContacto] = useState<string>("estrategico");
  const [estadoAnimo, setEstadoAnimo] = useState<string>("ocupado");
  const [escenario, setEscenario] = useState<string>("facturacion");
  const [necesidadImplicita, setNecesidadImplicita] =
    useState<string>("ineficiencia");

  const rolesContacto = [
    { key: "estrategico", label: "Estratégico (CEO/CFO)" },
    { key: "operacional", label: "Operacional (Gerente/Usuario Final)" },
  ];

  const estadosAnimo = [
    { key: "ocupado", label: "Ocupado" },
    { key: "frustrado", label: "Frustrado" },
    { key: "esceptico", label: "Escéptico" },
  ];

  const escenarios = [
    {
      key: "facturacion",
      label: "Software para Facturación en la Nube con IA",
    },
    { key: "ciberseguridad", label: "Auditoría de Ciberseguridad" },
  ];

  const necesidadesImplicitas = [
    { key: "ineficiencia", label: "Problema de Ineficiencia Operacional" },
    { key: "costos", label: "Problema de Costos/Recursos" },
    { key: "insatisfaccion", label: "Problema de Insatisfacción/Fricción" },
  ];

  const buildPrompt = () => {
    const rolMap: { [key: string]: string } = {
      estrategico: "Estratégico (CEO/CFO)",
      operacional: "Operacional (Gerente/Usuario Final)",
    };

    const animoMap: { [key: string]: string } = {
      ocupado: "Ocupado",
      frustrado: "Frustrado",
      esceptico: "Escéptico",
    };

    const escenarioMap: { [key: string]: string } = {
      facturacion:
        "Software para Facturación en la Nube con IA: Solución que automatiza el proceso de facturación y ofrece análisis predictivos de liquidez",
      ciberseguridad:
        "Auditoría de Ciberseguridad: Servicio de consultoría para identificar vulnerabilidades en la infraestructura TI y certificar la seguridad informática de la empresa",
    };

    const necesidadMap: { [key: string]: string } = {
      ineficiencia: "Problema de Ineficiencia Operacional",
      costos: "Problema de Costos/Recursos",
      insatisfaccion: "Problema de Insatisfacción/Fricción",
    };

    return `Configuración de la simulación:
- Rol del Contacto: ${rolMap[rolContacto]}
- Estado de Ánimo Inicial: ${animoMap[estadoAnimo]}
- Escenario: ${escenarioMap[escenario]}
- Necesidad Implícita: ${necesidadMap[necesidadImplicita]}

Por favor, comienza la simulación en tu rol de Comprador Simulado con estas características.`;
  };

  const handleStartSimulation = () => {
    console.log("🚀 Iniciando simulación...");
    const prompt = buildPrompt();

    console.log("📝 Prompt construido:", prompt);
    setInitialPrompt(prompt);
    setIsConfigured(true);
    console.log("✅ Estado actualizado a configurado");
  };

  const handleSessionEnd = () => {
    console.log("🛑 handleSessionEnd llamado - reseteando configuración");
    // Reset to configuration screen when session ends
    setIsConfigured(false);
    setInitialPrompt("");
  };

  console.log(
    "🔍 Estado actual - isConfigured:",
    isConfigured,
    "initialPrompt:",
    initialPrompt ? "presente" : "vacío",
  );

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 overflow-hidden flex flex-col">
      {/* Header Simulador de Habilidades */}
      <header className="bg-white text-gray-900 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-2 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {CONFIG.titulo}
                </h1>
                <p className="text-gray-600 text-xs">{CONFIG.subtitulo}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400" />
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-3 flex flex-col h-full">
        {/* Componente principal del avatar */}
        <div className="bg-white rounded-xl shadow-xl border border-purple-200 overflow-hidden w-full max-w-4xl h-full flex flex-col mx-auto">
          {(() => {
            console.log("🎨 Renderizando - isConfigured:", isConfigured);

            return null;
          })()}
          {!isConfigured ? (
            // Pantalla de configuración inicial
            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                    🎓 Habla con {CONFIG.avatarName}
                  </h2>
                  <p className="text-purple-600 text-sm mb-2">
                    {CONFIG.institutionName}
                  </p>

                  {CONFIG.avatarImage && (
                    <div className="w-16 h-16 mx-auto mb-2 relative">
                      <img
                        alt={`${CONFIG.avatarName} - Asistente Virtual`}
                        className="rounded-full object-cover border-3 border-purple-300 shadow-lg w-full h-full"
                        src={CONFIG.avatarImage}
                      />
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-purple-800 mb-1">
                    Conoce a {CONFIG.avatarName}
                  </h3>
                  <p className="text-purple-600 text-xs leading-relaxed max-w-md mx-auto mb-3">
                    Tu asistente virtual especializado. Configura los parámetros
                    de la simulación SPIN.
                  </p>
                </div>

                {/* Formulario de configuración */}
                <div className="space-y-3 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-200">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      1. Rol del Contacto (Comprador Simulado)
                    </label>
                    <Select
                      classNames={{
                        trigger:
                          "border-2 border-purple-200 hover:border-purple-400 bg-white",
                      }}
                      placeholder="Selecciona el rol"
                      selectedKeys={[rolContacto]}
                      size="sm"
                      onChange={(e) => setRolContacto(e.target.value)}
                    >
                      {rolesContacto.map((rol) => (
                        <SelectItem key={rol.key} value={rol.key}>
                          {rol.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      2. Estado de Ánimo Inicial
                    </label>
                    <Select
                      classNames={{
                        trigger:
                          "border-2 border-purple-200 hover:border-purple-400 bg-white",
                      }}
                      placeholder="Selecciona el estado de ánimo"
                      selectedKeys={[estadoAnimo]}
                      size="sm"
                      onChange={(e) => setEstadoAnimo(e.target.value)}
                    >
                      {estadosAnimo.map((animo) => (
                        <SelectItem key={animo.key} value={animo.key}>
                          {animo.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      3. Escenario de Producto/Servicio
                    </label>
                    <Select
                      classNames={{
                        trigger:
                          "border-2 border-purple-200 hover:border-purple-400 bg-white",
                      }}
                      placeholder="Selecciona el escenario"
                      selectedKeys={[escenario]}
                      size="sm"
                      onChange={(e) => setEscenario(e.target.value)}
                    >
                      {escenarios.map((esc) => (
                        <SelectItem key={esc.key} value={esc.key}>
                          {esc.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      4. Necesidad Implícita (P)
                    </label>
                    <Select
                      classNames={{
                        trigger:
                          "border-2 border-purple-200 hover:border-purple-400 bg-white",
                      }}
                      placeholder="Selecciona la necesidad implícita"
                      selectedKeys={[necesidadImplicita]}
                      size="sm"
                      onChange={(e) => setNecesidadImplicita(e.target.value)}
                    >
                      {necesidadesImplicitas.map((necesidad) => (
                        <SelectItem key={necesidad.key} value={necesidad.key}>
                          {necesidad.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <button
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all text-base hover:scale-105"
                    type="button"
                    onClick={handleStartSimulation}
                  >
                    🚀 Comenzar Práctica de Ventas
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Una vez configurado, mostrar el InteractiveAvatarGP normal
            <InteractiveAvatarGP
              avatarId={CONFIG.avatarId}
              avatarImage={CONFIG.avatarImage}
              avatarName={CONFIG.avatarName}
              backgroundColor={CONFIG.backgroundColor}
              buttonText={CONFIG.buttonText}
              initialPrompt={initialPrompt}
              institutionName={CONFIG.institutionName}
              knowledgeId={CONFIG.knowledgeId}
              language={CONFIG.language}
              placeholderText={CONFIG.placeholderText}
              primaryColor={CONFIG.primaryColor}
              secondaryColor={CONFIG.secondaryColor}
              voiceId={CONFIG.voiceId}
              welcomeMessage={CONFIG.welcomeMessage}
              onSessionEnd={handleSessionEnd}
            />
          )}
        </div>
      </main>

      {/* Footer informativo */}
      <footer className="bg-white border-t border-gray-200 py-2 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-purple-600">💬</span>
              <span className="text-[10px]">Escucha activa</span>
            </div>
            <div className="w-1 h-3 bg-gray-300 rounded" />
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-purple-600">🎤</span>
              <span className="text-[10px]">Expresión clara</span>
            </div>
            <div className="w-1 h-3 bg-gray-300 rounded" />
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-purple-600">🤝</span>
              <span className="text-[10px]">Empatía</span>
            </div>
            <div className="w-1 h-3 bg-gray-300 rounded" />
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-purple-600">✨</span>
              <span className="text-[10px]">Feedback constructivo</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
