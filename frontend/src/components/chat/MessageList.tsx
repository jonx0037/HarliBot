'use client'

import React, { useEffect, useRef } from 'react'
import { useChatContext } from '@/components/providers/ChatProvider'
import { Message } from './Message'
import { TypingIndicator } from './TypingIndicator'

export function MessageList() {
  const { messages, isTyping, language } = useChatContext()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const welcomeTitle = language === 'en' 
    ? 'Welcome to HarliBot!'
    : '¡Bienvenido a HarliBot!'
  
  const welcomeMessage = language === 'en'
    ? 'I can help you with:'
    : 'Puedo ayudarte con:'

  const services = language === 'en'
    ? [
        'City services information',
        'Department contacts',
        'Permits and licenses',
        'Events and news',
      ]
    : [
        'Información de servicios de la ciudad',
        'Contactos de departamentos',
        'Permisos y licencias',
        'Eventos y noticias',
      ]

  const exampleQuestion = language === 'en'
    ? 'Try asking: "How do I pay my water bill?"'
    : 'Intenta preguntar: "¿Cómo pago mi factura de agua?"'

  return (
    <div 
      className="flex-1 overflow-y-auto bg-chat-bg px-4 py-4 space-y-4"
      role="log"
      aria-live="polite"
      aria-atomic="false"
    >
      {/* Welcome Message (only if no conversation history) */}
      {messages.length === 0 && (
        <div className="text-center py-8 px-4">
          <div className="w-16 h-16 bg-harlingen-blue rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {welcomeTitle}
          </h3>
          
          <p className="text-gray-600 mb-3">{welcomeMessage}</p>
          
          <ul className="text-sm text-gray-700 space-y-2 mb-4">
            {services.map((service, i) => (
              <li key={i} className="flex items-center justify-center gap-2">
                <span className="text-harlingen-blue">•</span>
                {service}
              </li>
            ))}
          </ul>
          
          <p className="text-sm text-gray-500 italic">{exampleQuestion}</p>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} />
    </div>
  )
}
