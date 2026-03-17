"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from "@nextui-org/react";

import { ROLE_CONFIG } from "./llmConfig";

type TimelineMessage = {
  id: string;
  role: "cliente" | "vendedor";
  text: string;
  timestamp: number;
};

type CoachComment = {
  id: string;
  messageId: string;
  text: string;
  category?: string;
  timestamp: number;
};

const ACTOR_OPTIONS = {
  perfilCliente: [
    { key: "c1", label: "Cliente Premium frustrado" },
    { key: "c2", label: "Cliente Masivo confundido" },
    { key: "c3", label: "Cliente Reincidente escéptico" },
  ],
  tipoProducto: [
    { key: "cc", label: "cuenta corriente" },
    { key: "cred", label: "tarjeta de crédito" },
  ],
};

export default function DualModePage() {
  const initialMessageRef = useRef(false);
  const [messages, setMessages] = useState<TimelineMessage[]>([]);
  const [coachComments, setCoachComments] = useState<CoachComment[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  const [perfilCliente, setPerfilCliente] = useState("c1");
  const [tipoProducto, setTipoProducto] = useState("lapiz");

  const messageIdCounter = useRef(0);
  const commentIdCounter = useRef(0);
  const coachAbortRef = useRef<AbortController | null>(null);

  const scenarioText = useMemo(() => {
    const perfil = ACTOR_OPTIONS.perfilCliente.find(
      (item) => item.key === perfilCliente,
    )?.label;
    const producto = ACTOR_OPTIONS.tipoProducto.find(
      (item) => item.key === tipoProducto,
    )?.label;

    return `Perfil de cliente: ${perfil}\nTipo de producto: ${producto}`;
  }, [perfilCliente, tipoProducto]);

  const actorSystemPrompt = useMemo(() => {
    return `${ROLE_CONFIG.actor.systemPrompt}\n\nContexto de simulacion:\n${scenarioText}`;
  }, [scenarioText]);

  const coachSystemPrompt = useMemo(() => {
    return `${ROLE_CONFIG.coach.systemPrompt}\n\nContexto de simulacion:\n${scenarioText}`;
  }, [scenarioText]);

  const getInitialMessages = useCallback((): TimelineMessage[] => {
    return [
      {
        id: `msg-${Date.now()}-${messageIdCounter.current++}`,
        role: "cliente",
        text: "Hola, me aparece un cobro que no reconozco en mi cuenta y ya intenté resolverlo antes sin éxito.",
        timestamp: Date.now(),
      },
    ];
  }, []);

  const resetSession = useCallback(() => {
    setMessages(getInitialMessages());
    setInput("");
    setCoachComments([]);
    coachAbortRef.current?.abort();
    coachAbortRef.current = null;
  }, [getInitialMessages]);

  const requestCoachGuidance = useCallback(
    async (messagesSnapshot: TimelineMessage[], vendorMessageId: string) => {
      if (!messagesSnapshot.length || !vendorMessageId) return;

      coachAbortRef.current?.abort();
      const controller = new AbortController();

      coachAbortRef.current = controller;
      setIsCoachLoading(true);

      try {
        const response = await fetch("/api/dualmode/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            provider: ROLE_CONFIG.coach.provider,
            model: ROLE_CONFIG.coach.model,
            systemPrompt: coachSystemPrompt,
            messages: messagesSnapshot.map((message) => ({
              role: message.role === "vendedor" ? "user" : "assistant",
              content: message.text,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error("Coach request failed");
        }

        const data = await response.json();
        const guidance = (data?.guidance || "").trim();

        if (guidance) {
          setCoachComments((prev) => [
            ...prev,
            {
              id: `note-${Date.now()}-${commentIdCounter.current++}`,
              messageId: vendorMessageId,
              text: guidance,
              timestamp: Date.now(),
            },
          ]);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Coach error:", error);
        }
      } finally {
        setIsCoachLoading(false);
      }
    },
    [coachSystemPrompt],
  );

  const sendToActor = useCallback(
    async (nextMessages: TimelineMessage[], vendorMessageId: string) => {
      setIsSending(true);
      try {
        const response = await fetch("/api/dualmode/actor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: ROLE_CONFIG.actor.provider,
            model: ROLE_CONFIG.actor.model,
            systemPrompt: actorSystemPrompt,
            messages: nextMessages.map((message) => ({
              role: message.role === "vendedor" ? "user" : "assistant",
              content: message.text,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error("Actor request failed");
        }

        const data = await response.json();
        const actorReply = (data?.message || "").trim();

        if (actorReply) {
          setMessages((prev) => {
            const newMessage: TimelineMessage = {
              id: `msg-${Date.now()}-${messageIdCounter.current++}`,
              role: "cliente",
              text: actorReply,
              timestamp: Date.now(),
            };
            const updated = [...prev, newMessage];

            requestCoachGuidance(updated, vendorMessageId);

            return updated;
          });
        }
      } catch (error) {
        console.error("Actor error:", error);
      } finally {
        setIsSending(false);
      }
    },
    [actorSystemPrompt, requestCoachGuidance],
  );

  const handleSend = useCallback(() => {
    if (!input.trim() || isSending) return;
    const newMessageId = `msg-${Date.now()}-${messageIdCounter.current++}`;
    const userMessage: TimelineMessage = {
      id: newMessageId,
      role: "vendedor",
      text: input.trim(),
      timestamp: Date.now(),
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    sendToActor(nextMessages, newMessageId);
  }, [input, isSending, messages, sendToActor]);

  useEffect(() => {
    if (initialMessageRef.current) return;
    initialMessageRef.current = true;
    setMessages(getInitialMessages());
  }, [getInitialMessages]);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 h-full">
        {/* Header Card with glassmorphism */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex-shrink-0">
          <CardHeader className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-200 via-cyan-200 to-slate-200 bg-clip-text text-transparent">
                    Active Coaching Training
                  </h1>
                  <p className="text-xs text-slate-300/70 truncate">
                    Entrenamiento con Actor IA + Coach en tiempo real
                  </p>
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                color="primary"
                isDisabled={isSending && messages.length === 0}
                size="sm"
                variant="shadow"
                onPress={resetSession}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Reiniciar
              </Button>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-500/50 to-transparent" />

            <div className="grid grid-cols-1 lg:grid-cols-[280px_200px_1fr] gap-3 items-end">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Perfil de cliente
                </span>
                <Select
                  classNames={{
                    trigger:
                      "bg-white/10 border-white/20 backdrop-blur-sm data-[hover=true]:bg-white/20 transition-all min-w-[260px]",
                    value: "text-white font-semibold text-ellipsis",
                    popoverContent: "min-w-[280px]",
                  }}
                  selectedKeys={[perfilCliente]}
                  size="sm"
                  onChange={(e) => setPerfilCliente(e.target.value)}
                >
                  {ACTOR_OPTIONS.perfilCliente.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {item.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Tipo de producto
                </span>
                <Select
                  classNames={{
                    trigger:
                      "bg-white/10 border-white/20 backdrop-blur-sm data-[hover=true]:bg-white/20 transition-all",
                    value: "text-white font-semibold",
                  }}
                  selectedKeys={[tipoProducto]}
                  size="sm"
                  onChange={(e) => setTipoProducto(e.target.value)}
                >
                  {ACTOR_OPTIONS.tipoProducto.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {item.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="text-xs text-slate-300/80 lg:text-right font-medium px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                {scenarioText.replace("\n", " • ")}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Chat Card */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex-1 min-h-0 flex flex-col">
          <CardHeader className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg
                  className="w-4 h-4 text-white"
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
                <h2 className="text-base font-bold text-white">
                  Conversación en Vivo
                </h2>
                <p className="text-[10px] text-slate-300/60">
                  Mensajes con feedback del Coach en tiempo real
                </p>
              </div>
            </div>
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-200 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm animate-pulse">
                <Spinner
                  classNames={{
                    circle1: "border-b-blue-400",
                    circle2: "border-b-cyan-400",
                  }}
                  size="sm"
                />
                <span className="font-semibold">Cliente respondiendo...</span>
              </div>
            )}
          </CardHeader>
          <Divider className="bg-white/10" />
          <CardBody className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden p-3">
            {/* Messages Container */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-b from-black/20 to-black/10 rounded-2xl border border-white/10 p-4 space-y-3 backdrop-blur-sm">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-white/20">
                    <svg
                      className="w-7 h-7 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Inicia la conversación
                    </p>
                    <p className="text-xs text-slate-300/50 mt-0.5">
                      El Coach te guiará en tiempo real
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isVendor = message.role === "vendedor";
                  const notes = isVendor
                    ? coachComments.filter(
                        (comment) => comment.messageId === message.id,
                      )
                    : [];

                  return (
                    <div
                      key={message.id}
                      className="grid grid-cols-1 lg:grid-cols-[2fr_auto_1fr] gap-0 animate-in fade-in slide-in-from-bottom-2 duration-200"
                    >
                      <div className="flex flex-col pr-2.5">
                        <div
                          className={`rounded-lg px-2.5 py-1.5 text-[13px] max-w-[80%] shadow-sm ${
                            isVendor
                              ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white ml-auto"
                              : "bg-white/10 text-white border border-white/10 backdrop-blur-md"
                          }`}
                        >
                          <div
                            className={`text-[10px] font-semibold mb-0.5 ${isVendor ? "text-emerald-100" : "text-blue-300"}`}
                          >
                            {isVendor ? "Tú" : "Cliente"}
                          </div>
                          <div
                            className={`leading-relaxed ${isVendor ? "text-white" : "text-white/95"}`}
                          >
                            {message.text}
                          </div>
                        </div>
                      </div>

                      {/* Sutil división vertical */}
                      <div className="hidden lg:flex items-stretch px-2">
                        <div className="w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
                      </div>

                      <div className="flex flex-col gap-2 pl-2.5 lg:pl-0 pt-2 lg:pt-0">
                        {isVendor && notes.length > 0 ? (
                          notes.map((note) => (
                            <div
                              key={note.id}
                              className="rounded-md border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-md p-2 text-[11px] text-white shadow-sm shadow-amber-500/20 animate-in fade-in slide-in-from-right-2 duration-200"
                            >
                              <div className="flex items-center gap-1 text-[9px] font-bold text-amber-200 mb-1">
                                <span className="text-xs">🧠</span>
                                <span>Coach</span>
                                {note.category && (
                                  <>
                                    <span className="text-amber-300/40">·</span>
                                    <span className="px-1 py-0.5 bg-amber-400/20 rounded text-[8px]">
                                      {note.category}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="text-amber-50 leading-relaxed">
                                {note.text}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="min-h-[1px]" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="flex flex-col gap-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/20 p-3 shadow-2xl">
              <Textarea
                classNames={{
                  input: "text-white placeholder:text-slate-400/60 text-sm",
                  inputWrapper:
                    "bg-white/5 border-white/10 data-[hover=true]:bg-white/10 group-data-[focus=true]:bg-white/10 backdrop-blur-sm",
                }}
                maxRows={4}
                minRows={2}
                placeholder="Escribe tu mensaje como vendedor..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="flex items-center justify-between gap-2">
                {isCoachLoading && (
                  <div className="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full backdrop-blur-sm border border-amber-400/30">
                    <Spinner
                      classNames={{
                        circle1: "border-b-amber-400",
                        circle2: "border-b-orange-400",
                      }}
                      size="sm"
                    />
                    <span className="font-semibold">Coach analizando...</span>
                  </div>
                )}
                <div className="ml-auto flex gap-2">
                  <Button
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all"
                    color="success"
                    endContent={
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    }
                    isDisabled={isSending || !input.trim()}
                    size="sm"
                    onPress={handleSend}
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
