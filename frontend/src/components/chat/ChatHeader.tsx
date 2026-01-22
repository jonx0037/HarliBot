'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { X, Trash2 } from 'lucide-react'
import { useChatContext } from '@/components/providers/ChatProvider'
import { LanguageToggle } from './LanguageToggle'

export function ChatHeader() {
  const { closeChat, clearHistory, language, messages } = useChatContext()
  const [showConfirm, setShowConfirm] = useState(false)

  const title = 'HarliBot'
  const subtitle = language === 'en' ? 'City of Harlingen' : 'Ciudad de Harlingen'
  const closeLabel = language === 'en' ? 'Close chat' : 'Cerrar chat'
  const clearLabel = language === 'en' ? 'Clear conversation' : 'Borrar conversación'

  const handleClear = () => {
    if (showConfirm) {
      clearHistory()
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
      // Auto-dismiss after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000)
    }
  }

  // Only show clear button if there's more than the welcome message
  const showClearButton = messages.length > 1

  return (
    <header className="text-white px-4 py-4 flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-harlingen-navy to-harlingen-teal shadow-md">
      <div className="flex items-center gap-3">
        {/* City Logo */}
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
          <div className="relative w-full h-full">
            <Image
              src="/harlingen-logo.png"
              alt="Harlingen"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="font-bold text-lg leading-tight text-shadow-sm">{title}</h2>
          <p className="text-xs text-white/90 leading-tight">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageToggle />

        {/* Clear Conversation Button */}
        {showClearButton && (
          <button
            onClick={handleClear}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-smooth border
                       ${showConfirm
                ? 'bg-red-500/80 hover:bg-red-500 border-red-400'
                : 'hover:bg-white/20 border-white/20 hover:border-white/40'}`}
            aria-label={clearLabel}
            title={showConfirm ? (language === 'en' ? 'Click again to confirm' : 'Clic de nuevo para confirmar') : clearLabel}
            data-testid="clear-chat-button"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>
        )}

        <button
          onClick={closeChat}
          className="w-8 h-8 rounded-full hover:bg-white/20 
                     flex items-center justify-center transition-smooth border border-white/20 hover:border-white/40"
          aria-label={closeLabel}
          data-testid="chat-close-button"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </header>
  )
}

