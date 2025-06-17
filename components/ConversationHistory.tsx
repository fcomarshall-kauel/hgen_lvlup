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
  dynamicHeight?: boolean;
}

export default function ConversationHistory({
  messages,
  className = "",
  dynamicHeight = false
}: ConversationHistoryProps) {
  return (
    <Card className={`border border-gray-200 ${dynamicHeight ? 'flex flex-col' : ''} ${className}`}>
      <CardBody className={`p-0 ${dynamicHeight ? 'flex flex-col flex-1' : ''}`}>
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
            📝 Historial
            <span className="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded-full">
              {messages.length}
            </span>
          </h4>
        </div>
        
        <ScrollShadow 
          className={`${dynamicHeight ? 'h-full' : 'h-48'} p-3`} 
          hideScrollBar
        >
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