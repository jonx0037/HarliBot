'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useChatContext } from '@/contexts/ChatContext'

export function MessageInput() {
  const { sendMessage, isTyping, language } = useChatContext()
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const placeholder = language === 'en'
    ? 'Ask about city services...'
    : 'Pregunta sobre servicios de la ciudad...'

  const sendLabel = language === 'en' ? 'Send message' : 'Enviar mensaje'

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmed = input.trim()
    if (!trimmed || isTyping) return

    setInput('')
    await sendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const charCount = input.length
  const showCounter = charCount > 400

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-4 rounded-b-2xl"
      role="search"
      aria-label="Send message to HarliBot"
    >
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isTyping}
            maxLength={500}
            rows={1}
            className="w-full px-4 py-3 pr-12 bg-gray-100 border border-gray-200 rounded-lg
                       resize-none focus:outline-none focus:ring-2 focus:ring-harlingen-blue
                       focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed
                       max-h-32 text-gray-800 placeholder:text-gray-400"
            aria-label={placeholder}
          />
          
          {showCounter && (
            <span 
              className={`absolute bottom-1 right-2 text-xs ${
                charCount > 450 ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              {charCount}/500
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="w-12 h-12 bg-harlingen-blue hover:bg-harlingen-gold text-white rounded-full
                     flex items-center justify-center transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-harlingen-blue
                     hover:scale-105 active:scale-95 flex-shrink-0"
          aria-label={sendLabel}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
