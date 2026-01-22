'use client'

import React from 'react'
import { useChatContext } from '@/components/providers/ChatProvider'

interface SuggestedQuestionsProps {
    suggestions: string[]
    onSelect: (question: string) => void
}

// Default suggestions for when we don't have context-specific ones
const DEFAULT_SUGGESTIONS = {
    en: [
        "How do I pay my water bill?",
        "What are City Hall hours?",
        "How do I get a building permit?"
    ],
    es: [
        "¿Cómo pago mi factura de agua?",
        "¿Cuáles son los horarios del Ayuntamiento?",
        "¿Cómo obtengo un permiso de construcción?"
    ]
}

export function SuggestedQuestions({ suggestions, onSelect }: SuggestedQuestionsProps) {
    const { language, isStreaming } = useChatContext()

    // Don't show while streaming
    if (isStreaming) return null

    // Use provided suggestions or fall back to defaults
    const displaySuggestions = suggestions.length > 0
        ? suggestions
        : DEFAULT_SUGGESTIONS[language]

    return (
        <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
            {displaySuggestions.slice(0, 3).map((question, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(question)}
                    className="
            px-3 py-1.5 
            text-sm text-harlingen-navy 
            bg-white/80 backdrop-blur-sm 
            border border-harlingen-navy/20 
            rounded-full 
            hover:bg-harlingen-navy hover:text-white 
            hover:border-transparent
            focus:outline-none focus:ring-2 focus:ring-harlingen-blue focus:ring-offset-2
            transition-all duration-200
            shadow-sm hover:shadow-md
          "
                    data-testid={`suggestion-${index}`}
                >
                    {question}
                </button>
            ))}
        </div>
    )
}

// Helper to get welcome suggestions based on language
export function getWelcomeSuggestions(language: 'en' | 'es'): string[] {
    return DEFAULT_SUGGESTIONS[language]
}
