'use client'

import React from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { useChatContext } from '@/components/providers/ChatProvider'
import { LanguageToggle } from './LanguageToggle'

export function ChatHeader() {
  const { closeChat, language } = useChatContext()

  const title = 'HarliBot'
  const subtitle = language === 'en' ? 'City of Harlingen' : 'Ciudad de Harlingen'
  const closeLabel = language === 'en' ? 'Close chat' : 'Cerrar chat'

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

        <button
          onClick={closeChat}
          className="w-8 h-8 rounded-full hover:bg-white/20 
                     flex items-center justify-center transition-smooth border border-white/20 hover:border-white/40"
          aria-label={closeLabel}
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </header>
  )
}
