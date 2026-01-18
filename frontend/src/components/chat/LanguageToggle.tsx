'use client'

import React from 'react'
import { useChatContext } from '@/components/providers/ChatProvider'

export function LanguageToggle() {
  const { language, setLanguage } = useChatContext()

  return (
    <div 
      className="flex bg-white/10 rounded-full p-1"
      role="tablist"
      aria-label="Select language"
    >
      <button
        role="tab"
        aria-selected={language === 'en'}
        onClick={() => setLanguage('en')}
        className={`
          px-3 py-1 rounded-full text-sm font-medium transition-all
          ${language === 'en' 
            ? 'bg-white text-harlingen-blue' 
            : 'text-white/60 hover:text-white'
          }
        `}
      >
        EN
      </button>
      <button
        role="tab"
        aria-selected={language === 'es'}
        onClick={() => setLanguage('es')}
        className={`
          px-3 py-1 rounded-full text-sm font-medium transition-all
          ${language === 'es' 
            ? 'bg-white text-harlingen-blue' 
            : 'text-white/60 hover:text-white'
          }
        `}
      >
        ES
      </button>
    </div>
  )
}
