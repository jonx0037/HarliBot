'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'
import { useChatContext } from '@/contexts/ChatContext'

export function ChatToggleButton() {
  const { openChat, messages, language } = useChatContext()

  // Count unread messages (messages since last close - simplified)
  const unreadCount = 0 // TODO: Implement unread tracking

  const label = language === 'en' 
    ? 'Open HarliBot chat assistant'
    : 'Abrir el asistente de chat HarliBot'

  return (
    <button
      onClick={openChat}
      className="fixed bottom-6 right-6 w-16 h-16 bg-harlingen-blue hover:bg-harlingen-gold 
                 text-white rounded-full shadow-chat-button hover:shadow-xl 
                 transition-all duration-300 hover:scale-105 active:scale-95
                 flex items-center justify-center animate-pulse-slow z-50"
      aria-label={label}
    >
      <MessageCircle className="w-8 h-8" />
      
      {unreadCount > 0 && (
        <span 
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold 
                     rounded-full w-6 h-6 flex items-center justify-center"
          aria-label={`${unreadCount} unread messages`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
