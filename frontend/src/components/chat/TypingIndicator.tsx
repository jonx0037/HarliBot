'use client'

import React from 'react'
import { useChatContext } from '@/components/providers/ChatProvider'

export function TypingIndicator() {
  const { language } = useChatContext()

  const message = language === 'en'
    ? 'HarliBot is typing...'
    : 'HarliBot está escribiendo...'

  return (
    <div className="flex justify-start">
      <div className="flex gap-2">
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-harlingen-navy to-harlingen-teal rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-bold text-sm">H</span>
        </div>

        {/* Typing bubble */}
        <div className="glass-light px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-200">
          <div className="flex items-center gap-1" aria-label={message}>
            <span className="sr-only">{message}</span>
            <div className="w-2 h-2 bg-harlingen-teal rounded-full typing-dot" />
            <div className="w-2 h-2 bg-harlingen-teal rounded-full typing-dot" />
            <div className="w-2 h-2 bg-harlingen-teal rounded-full typing-dot" />
          </div>
        </div>
      </div>
    </div>
  )
}
