'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { X, Trash2 } from 'lucide-react'
import { useChatContext } from '@/components/providers/ChatProvider'
import { LanguageToggle } from './LanguageToggle'

export function ChatHeader() {
  const { closeChat, clearHistory, language, messages } = useChatContext()
  const [showConfirm, setShowConfirm] = useState(false)

  const title = 'Harlí'
  const subtitle = language === 'en' ? 'Your City of Harlingen Assistant' : 'Tu Asistente de la Ciudad de Harlingen'
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
        {/* Harlí Avatar */}
        <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 shadow-md ring-2 ring-white/30">
          <Image
            src="/Harli-with-Harlingen-logo.png"
            alt="Harlí"
            width={44}
            height={44}
            className="object-cover w-full h-full"
            priority
          />
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

