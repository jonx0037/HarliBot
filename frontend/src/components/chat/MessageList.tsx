'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useChatContext } from '@/components/providers/ChatProvider'
import { Message } from './Message'
import { TypingIndicator } from './TypingIndicator'
import { SuggestedQuestions, getWelcomeSuggestions } from './SuggestedQuestions'

export function MessageList() {
  const { messages, isTyping, isStreaming, language, sendMessage } = useChatContext()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, isStreaming])

  // Determine if we should show suggestions
  const lastMessage = messages[messages.length - 1]
  const showSuggestions = lastMessage?.role === 'assistant' && !isStreaming && !isTyping

  const handleSuggestionSelect = (question: string) => {
    sendMessage(question)
  }

  const welcomeTitle = language === 'en'
    ? 'Hi, I\'m Harlí!'
    : '¡Hola, soy Harlí!'

  const welcomeMessage = language === 'en'
    ? 'Your City of Harlingen assistant. I can help you with:'
    : 'Tu asistente de la Ciudad de Harlingen. Puedo ayudarte con:'

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
    ? 'Just ask me anything about city services!'
    : '¡Pregúntame lo que quieras sobre los servicios de la ciudad!'

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
          <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden shadow-lg ring-2 ring-harlingen-navy/20">
            <Image
              src="/Harli-with-Harlingen-logo.png"
              alt="Harlí"
              width={80}
              height={80}
              className="object-cover w-full h-full"
              priority
            />
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

      {/* Suggested Questions - show after last assistant message */}
      {showSuggestions && (
        <SuggestedQuestions
          suggestions={getWelcomeSuggestions(language)}
          onSelect={handleSuggestionSelect}
        />
      )}

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} />
    </div>
  )
}

