'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { Message as MessageType } from '@/contexts/ChatContext'
import { useChatContext } from '@/contexts/ChatContext'

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const { language } = useChatContext()
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar (bot only) */}
        {!isUser && (
          <div className="w-8 h-8 bg-harlingen-blue rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">H</span>
          </div>
        )}

        <div className="flex flex-col">
          {/* Message Bubble */}
          <div
            className={`
              px-4 py-3 rounded-2xl animate-fade-in
              ${isUser 
                ? 'bg-chat-user-bg text-chat-user-text rounded-br-sm' 
                : 'bg-chat-bot-bg text-chat-bot-text rounded-tl-sm'
              }
            `}
          >
            <ReactMarkdown
              className="prose prose-sm max-w-none"
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-harlingen-gold"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Sources */}
            {!isUser && message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">
                  {language === 'en' ? 'Sources:' : 'Fuentes:'}
                </p>
                <div className="space-y-1">
                  {message.sources.map((source, i) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-harlingen-blue hover:text-harlingen-gold 
                                 hover:underline truncate"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <time 
            className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}
            dateTime={message.timestamp.toISOString()}
          >
            {formatTimestamp(message.timestamp, language)}
          </time>
        </div>
      </div>
    </div>
  )
}

function formatTimestamp(date: Date, language: 'en' | 'es'): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) {
    return language === 'en' ? 'Just now' : 'Ahora mismo'
  }
  
  if (diffMins < 60) {
    return language === 'en' 
      ? `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
      : `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
  }

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) {
    return language === 'en'
      ? `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
      : `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  }

  return date.toLocaleTimeString(language === 'en' ? 'en-US' : 'es-ES', {
    hour: 'numeric',
    minute: '2-digit',
  })
}
