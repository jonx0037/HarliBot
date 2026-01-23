'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'es'

interface LanguageContextValue {
    language: Language
    setLanguage: (lang: Language) => void
    t: (enText: string, esText: string) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const STORAGE_KEY = 'harlibot-language'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en')
    const [isHydrated, setIsHydrated] = useState(false)

    // Load language preference from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as Language
        if (saved === 'en' || saved === 'es') {
            setLanguageState(saved)
        }
        setIsHydrated(true)
    }, [])

    // Save language preference when it changes
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(STORAGE_KEY, language)
            // Dispatch custom event so ChatProvider can sync
            window.dispatchEvent(new CustomEvent('language-change', { detail: language }))
        }
    }, [language, isHydrated])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
    }

    // Translation helper - returns English or Spanish text based on current language
    const t = (enText: string, esText: string): string => {
        return language === 'en' ? enText : esText
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
