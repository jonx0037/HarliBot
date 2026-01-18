'use client'

import React from 'react'
import { useChatContext } from '@/contexts/ChatContext'

export function TypingIndicator() {
  const { language } = useChatContext()
  
  const message = language === 'en' 
    ? 'HarliBot is typing...'
    : 'HarliBot está escribiendo...'

  return (
    <div className="flex justify-start">
      <div className="flex gap-2">
        {/* Avatar */}
        <div className="w-8 h-8 bg-harlingen-blue rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">H</span>
        </div>

        {/* Typing bubble */}
        <div className="bg-chat-bot-bg px-4 py-3 rounded-2xl rounded-tl-sm">
          <div className="flex items-center gap-1" aria-label={message}>
            <span className="sr-only">{message}</span>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
