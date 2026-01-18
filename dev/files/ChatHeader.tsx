'use client'

import React from 'react'
import { X } from 'lucide-react'
import { useChatContext } from '@/contexts/ChatContext'
import { LanguageToggle } from './LanguageToggle'

export function ChatHeader() {
  const { closeChat, language } = useChatContext()

  const title = 'HarliBot'
  const subtitle = language === 'en' ? 'City of Harlingen' : 'Ciudad de Harlingen'
  const closeLabel = language === 'en' ? 'Close chat' : 'Cerrar chat'

  return (
    <header className="bg-harlingen-blue text-white px-4 py-3 flex items-center justify-between rounded-t-2xl">
      <div className="flex items-center gap-3">
        {/* Avatar/Logo */}
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <span className="text-harlingen-blue font-bold text-lg">H</span>
        </div>
        
        {/* Title */}
        <div>
          <h2 className="font-bold text-lg leading-tight">{title}</h2>
          <p className="text-sm text-white/80 leading-tight">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageToggle />
        
        <button
          onClick={closeChat}
          className="w-8 h-8 rounded-full hover:bg-white/10 
                     flex items-center justify-center transition-colors"
          aria-label={closeLabel}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
