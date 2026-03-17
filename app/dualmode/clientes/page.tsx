"use client";

const profiles = [
  {
    title: "Cliente Premium frustrado",
    highlight: "Perfil principal",
    crm: ["Segmento: Premium", "Contactos hoy: 3", "Reclamo activo: Si"],
    comportamiento: [
      "Educado, pero cansado",
      "Baja tolerancia a repeticion",
      "Espera trato personalizado",
    ],
    fuerza: [
      "Contencion emocional",
      "Reconocer historial",
      "Cierre con control y tiempos",
    ],
    nota: "Perfil ideal para tu demo principal.",
  },
  {
    title: "Cliente Masivo confundido",
    crm: ["Segmento: Masivo", "Primer contacto", "Frustracion: Media"],
    comportamiento: [
      "No entiende procesos",
      "Hace preguntas basicas",
      "No esta molesto, pero si perdido",
    ],
    fuerza: ["Claridad", "Lenguaje simple", "Confirmar entendimiento"],
    nota: "Excelente para mostrar que el Coach no siempre pide empatia, a veces pide claridad.",
  },
  {
    title: "Cliente Reincidente esceptico",
    crm: [
      "Segmento: Tradicional",
      "Contactos ultimos 7 dias: 5",
      "Reclamo reabierto",
    ],
    comportamiento: [
      '"Ya me dijeron eso"',
      "Desconfia de promesas",
      "Testea al agente",
    ],
    fuerza: [
      "Manejo de objeciones",
      "No prometer de mas",
      "Reforzar credibilidad",
    ],
    nota: "Muy bueno para mostrar penalizacion por repetir scripts.",
  },
  {
    title: "Cliente Urgente operativo",
    crm: [
      "Segmento: Empresa / Pyme",
      "Evento critico activo",
      "Tiempo critico",
    ],
    comportamiento: [
      "Directo, poco emocional",
      "Quiere solucion ahora",
      "No quiere conversacion",
    ],
    fuerza: ["Priorizacion", "Sintesis", "Accion concreta"],
    nota: "Muestra que el Coach tambien sabe acelerar, no solo contener.",
  },
  {
    title: "Cliente Silencioso pasivo (avanzado)",
    crm: [
      "Segmento: Masivo",
      "Frustracion estimada: Baja",
      "Riesgo de abandono: Medio",
    ],
    comportamiento: [
      "Respuestas cortas",
      "No expresa emocion",
      "Acepta todo, pero no queda conforme",
    ],
    fuerza: [
      "Detectar senales debiles",
      "Validar sin dramatizar",
      "Confirmar satisfaccion real",
    ],
    nota: "",
  },
];

export default function ClientesPage() {
  return (
    <div className="min-h-full bg-slate-900 text-slate-100">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-10" />
      <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6 pb-12">
        <header className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tipos de Cliente
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Perfiles sugeridos para simulaciones con Actor + Coach.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {profiles.map((profile) => (
            <div
              key={profile.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {profile.title}
                  </h2>
                  {profile.highlight && (
                    <span className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-400/30 rounded-full px-2 py-0.5">
                      {profile.highlight}
                    </span>
                  )}
                </div>
              </div>

              <section>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  CRM
                </h3>
                <ul className="text-sm text-slate-200 space-y-1">
                  {profile.crm.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Comportamiento
                </h3>
                <ul className="text-sm text-slate-200 space-y-1">
                  {profile.comportamiento.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Que fuerza al agente
                </h3>
                <ul className="text-sm text-slate-200 space-y-1">
                  {profile.fuerza.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {profile.nota && (
                <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2">
                  {profile.nota}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
