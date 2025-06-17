import React from 'react';
import { Card, CardBody, ScrollShadow } from "@nextui-org/react";

export interface ConversationMessage {
  id: string;
  type: 'user' | 'avatar';
  content: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  messages: ConversationMessage[];
  className?: string;
}

export default function ConversationHistory({
  messages,
  className = ""
}: ConversationHistoryProps) {
  return (
    <Card className={`border border-gray-200 ${className}`}>
      <CardBody className="p-0">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            💬 Historial de Conversación
            <span className="text-xs text-gray-500">({messages.length} mensajes)</span>
          </h4>
        </div>
        
        <ScrollShadow className="h-48 p-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">💭</div>
                <p>No hay mensajes aún</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-lg text-xs ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs opacity-70">
                        {message.type === 'user' ? '👤 Tú' : '🤖 Tara'}
                      </span>
                      <span className="text-xs opacity-50">
                        {message.timestamp.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollShadow>
      </CardBody>
    </Card>
  );
} 