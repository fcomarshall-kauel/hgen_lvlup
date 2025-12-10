"use client";

import { useState } from "react";
import InteractiveAvatarGP from "@/components/InteractiveAvatar_GP";
import { Select, SelectItem } from "@nextui-org/react";
import Image from "next/image";

// ============================================
// PARÁMETROS DE CONFIGURACIÓN - EDITAR AQUÍ
// ============================================
const CONFIG = {
  // Títulos del Header
  titulo: "Simulador de Postventa",
  subtitulo: "Practica y mejora tus técnicas de Atención al Cliente",
  
  // Configuración del Avatar
  knowledgeId: "d128aab86d6949c881f7e582e7805eee",
  avatarId: "Silas_CustomerSupport_public",
  voiceId: "05e192129b6b466493886273f8c23f78",
  language: "es",
  avatarName: "Coach Postventa",
  institutionName: "Simulador para Postventa",
  avatarImage: "/fabian_pic.png",
  welcomeMessage: "Hola, soy tu Coach-Tutor Dinámico de Postventa. He recibido la configuración de la simulación y estoy listo para comenzar.",
  
  // Textos de la interfaz
  placeholderText: "Describe el escenario que quieres practicar...",
  buttonText: "🎯 Comenzar Práctica de Postventa",
  
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
  const [producto, setProducto] = useState<string>("cepillo");
  const [estadoCliente, setEstadoCliente] = useState<string>("frustrado");
  const [etapa, setEtapa] = useState<string>("apertura");
  const [reclamo, setReclamo] = useState<string>("cerdas_descoloradas");

  const productos = [
    { key: "cepillo", label: "Cepillo de dientes" },
    { key: "pasta", label: "Pasta dental" },
    { key: "enjuague", label: "Enjuague bucal" },
    { key: "hilo", label: "Hilo dental" },
    { key: "blanqueador", label: "Kit blanqueador" },
    { key: "electrico", label: "Cepillo eléctrico" }
  ];

  const estadosCliente = [
    { key: "frustrado", label: "Frustrado" },
    { key: "molesto", label: "Molesto" },
    { key: "tranquilo", label: "Tranquilo" },
    { key: "impaciente", label: "Impaciente" },
    { key: "decepcionado", label: "Decepcionado" },
    { key: "enojado", label: "Enojado" }
  ];

  const etapas = [
    { key: "apertura", label: "Apertura" },
    { key: "indagacion", label: "Indagación" },
    { key: "solucion", label: "Propuesta de Solución" },
    { key: "cierre", label: "Cierre" }
  ];

  const reclamos = [
    { key: "cerdas_descoloradas", label: "Cepillo con cerdas descoloradas" },
    { key: "producto_vencido", label: "Producto vencido" },
    { key: "empaque_danado", label: "Empaque dañado" },
    { key: "producto_diferente", label: "Producto diferente al pedido" },
    { key: "no_funciona", label: "Producto no funciona correctamente" },
    { key: "calidad_inferior", label: "Calidad inferior a la esperada" },
    { key: "falta_piezas", label: "Faltan piezas o accesorios" },
    { key: "cobro_incorrecto", label: "Cobro incorrecto" }
  ];

  const buildPrompt = () => {
    const productoMap: { [key: string]: string } = {
      cepillo: "Cepillo de dientes",
      pasta: "Pasta dental",
      enjuague: "Enjuague bucal",
      hilo: "Hilo dental",
      blanqueador: "Kit blanqueador",
      electrico: "Cepillo eléctrico"
    };

    const estadoMap: { [key: string]: string } = {
      frustrado: "Frustrado",
      molesto: "Molesto",
      tranquilo: "Tranquilo",
      impaciente: "Impaciente",
      decepcionado: "Decepcionado",
      enojado: "Enojado"
    };

    const etapaMap: { [key: string]: string } = {
      apertura: "Apertura",
      indagacion: "Indagación",
      solucion: "Propuesta de Solución",
      cierre: "Cierre"
    };

    const reclamoMap: { [key: string]: string } = {
      cerdas_descoloradas: "Cepillo con cerdas descoloradas",
      producto_vencido: "Producto vencido",
      empaque_danado: "Empaque dañado",
      producto_diferente: "Producto diferente al pedido",
      no_funciona: "Producto no funciona correctamente",
      calidad_inferior: "Calidad inferior a la esperada",
      falta_piezas: "Faltan piezas o accesorios",
      cobro_incorrecto: "Cobro incorrecto"
    };

    return `Configuración de la simulación de Postventa:
- Producto: ${productoMap[producto]}
- Estado del Cliente: ${estadoMap[estadoCliente]}
- Etapa de la Conversación: ${etapaMap[etapa]}
- Tipo de Reclamo: ${reclamoMap[reclamo]}

Por favor, comienza la simulación actuando como un cliente con estas características que viene a hacer un reclamo.`;
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

  console.log("🔍 Estado actual - isConfigured:", isConfigured, "initialPrompt:", initialPrompt ? "presente" : "vacío");

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
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" 
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
        <div className="h-1 bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400"></div>
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
                  <p className="text-purple-600 text-sm mb-2">{CONFIG.institutionName}</p>
                  
                  {CONFIG.avatarImage && (
                    <div className="w-16 h-16 mx-auto mb-2 relative">
                      <img
                        src={CONFIG.avatarImage}
                        alt={`${CONFIG.avatarName} - Asistente Virtual`}
                        className="rounded-full object-cover border-3 border-purple-300 shadow-lg w-full h-full"
                      />
                    </div>
                  )}
                  
                  <h3 className="text-lg font-bold text-purple-800 mb-1">
                    Conoce a {CONFIG.avatarName}
                  </h3>
                  <p className="text-purple-600 text-xs leading-relaxed max-w-md mx-auto mb-3">
                    Tu asistente virtual especializado. Configura los parámetros de la simulación de Postventa.
                  </p>
                </div>

                {/* Formulario de configuración */}
                <div className="space-y-3 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-200">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      1. Producto
                    </label>
                    <Select
                      selectedKeys={[producto]}
                      onChange={(e) => setProducto(e.target.value)}
                      placeholder="Selecciona el producto"
                      classNames={{
                        trigger: "border-2 border-purple-200 hover:border-purple-400 bg-white",
                      }}
                      size="sm"
                    >
                      {productos.map((prod) => (
                        <SelectItem key={prod.key} value={prod.key}>
                          {prod.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      2. Estado del Cliente
                    </label>
                    <Select
                      selectedKeys={[estadoCliente]}
                      onChange={(e) => setEstadoCliente(e.target.value)}
                      placeholder="Selecciona el estado del cliente"
                      classNames={{
                        trigger: "border-2 border-purple-200 hover:border-purple-400 bg-white",
                      }}
                      size="sm"
                    >
                      {estadosCliente.map((estado) => (
                        <SelectItem key={estado.key} value={estado.key}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      3. Etapa de la Conversación
                    </label>
                    <Select
                      selectedKeys={[etapa]}
                      onChange={(e) => setEtapa(e.target.value)}
                      placeholder="Selecciona la etapa"
                      classNames={{
                        trigger: "border-2 border-purple-200 hover:border-purple-400 bg-white",
                      }}
                      size="sm"
                    >
                      {etapas.map((et) => (
                        <SelectItem key={et.key} value={et.key}>
                          {et.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      4. Tipo de Reclamo
                    </label>
                    <Select
                      selectedKeys={[reclamo]}
                      onChange={(e) => setReclamo(e.target.value)}
                      placeholder="Selecciona el tipo de reclamo"
                      classNames={{
                        trigger: "border-2 border-purple-200 hover:border-purple-400 bg-white",
                      }}
                      size="sm"
                    >
                      {reclamos.map((rec) => (
                        <SelectItem key={rec.key} value={rec.key}>
                          {rec.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartSimulation}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all text-base hover:scale-105"
                  >
                    🚀 Comenzar Práctica de Postventa
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Una vez configurado, mostrar el InteractiveAvatarGP normal
            <InteractiveAvatarGP
              knowledgeId={CONFIG.knowledgeId}
              avatarId={CONFIG.avatarId}
              voiceId={CONFIG.voiceId}
              language={CONFIG.language}
              avatarName={CONFIG.avatarName}
              institutionName={CONFIG.institutionName}
              avatarImage={CONFIG.avatarImage}
              welcomeMessage={CONFIG.welcomeMessage}
              primaryColor={CONFIG.primaryColor}
              secondaryColor={CONFIG.secondaryColor}
              backgroundColor={CONFIG.backgroundColor}
              placeholderText={CONFIG.placeholderText}
              buttonText={CONFIG.buttonText}
              initialPrompt={initialPrompt}
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
            <div className="w-1 h-3 bg-gray-300 rounded"></div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-purple-600">🎤</span>
              <span className="text-[10px]">Expresión clara</span>
            </div>
            <div className="w-1 h-3 bg-gray-300 rounded"></div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-purple-600">🤝</span>
              <span className="text-[10px]">Empatía</span>
            </div>
            <div className="w-1 h-3 bg-gray-300 rounded"></div>
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
