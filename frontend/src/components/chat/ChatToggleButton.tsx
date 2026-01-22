'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'
import { useChatContext } from '@/components/providers/ChatProvider'

export function ChatToggleButton() {
  const { openChat, messages, language } = useChatContext()

  // Unread count placeholder for future implementation
  const unreadCount = 0

  const label = language === 'en'
    ? 'Open HarliBot chat assistant'
    : 'Abrir el asistente de chat HarliBot'

  return (
    <button
      onClick={openChat}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-harlingen-navy to-harlingen-teal hover:from-harlingen-teal hover:to-harlingen-purple
                 text-white rounded-full shadow-chat hover:shadow-glow-lg 
                 transition-all duration-300 hover:scale-110 active:scale-95
                 flex items-center justify-center animate-pulse-glow z-50 border-2 border-white/20"
      aria-label={label}
      data-testid="chat-toggle-button"
    >
      <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.5} />

      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-harlingen-gold text-harlingen-navy text-xs font-bold 
                     rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse"
          aria-label={`${unreadCount} unread messages`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
