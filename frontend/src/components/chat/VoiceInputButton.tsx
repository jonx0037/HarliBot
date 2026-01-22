'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { useChatContext } from '@/components/providers/ChatProvider'

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
    resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string
    message?: string
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    start(): void
    stop(): void
    abort(): void
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    onstart: (() => void) | null
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition
        webkitSpeechRecognition: new () => SpeechRecognition
    }
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'unsupported'

interface VoiceInputButtonProps {
    onTranscript: (text: string) => void
    disabled?: boolean
}

export function VoiceInputButton({ onTranscript, disabled = false }: VoiceInputButtonProps) {
    const { language } = useChatContext()
    const [voiceState, setVoiceState] = useState<VoiceState>('idle')
    const [isSupported, setIsSupported] = useState(false)
    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const transcriptRef = useRef<string>('')

    // Check for browser support on mount
    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognitionAPI) {
            setIsSupported(true)
            recognitionRef.current = new SpeechRecognitionAPI()

            // Configure recognition
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true
        } else {
            setVoiceState('unsupported')
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort()
            }
        }
    }, [])

    // Update language when it changes
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = language === 'es' ? 'es-MX' : 'en-US'
        }
    }, [language])

    const startListening = useCallback(() => {
        if (!recognitionRef.current || disabled) return

        transcriptRef.current = ''

        recognitionRef.current.onstart = () => {
            setVoiceState('listening')
        }

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = ''
            let finalTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' '
                } else {
                    interimTranscript += transcript
                }
            }

            // Update transcript with final results
            if (finalTranscript) {
                transcriptRef.current += finalTranscript
            }

            // Show interim results to user immediately
            const currentText = (transcriptRef.current + interimTranscript).trim()
            if (currentText) {
                onTranscript(currentText)
            }
        }

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error)

            if (event.error === 'not-allowed') {
                // User denied microphone permission
                setVoiceState('unsupported')
            } else {
                setVoiceState('idle')
            }
        }

        recognitionRef.current.onend = () => {
            setVoiceState('idle')
        }

        try {
            recognitionRef.current.start()
        } catch (error) {
            console.error('Failed to start speech recognition:', error)
            setVoiceState('idle')
        }
    }, [disabled, onTranscript])

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            setVoiceState('processing')
            recognitionRef.current.stop()
        }
    }, [])

    const toggleListening = useCallback(() => {
        if (voiceState === 'listening') {
            stopListening()
        } else if (voiceState === 'idle') {
            startListening()
        }
    }, [voiceState, startListening, stopListening])

    // Don't render if not supported
    if (!isSupported || voiceState === 'unsupported') {
        return null
    }

    const getAriaLabel = () => {
        if (language === 'es') {
            switch (voiceState) {
                case 'listening': return 'Detener grabación de voz'
                case 'processing': return 'Procesando voz'
                default: return 'Iniciar entrada de voz'
            }
        }
        switch (voiceState) {
            case 'listening': return 'Stop voice recording'
            case 'processing': return 'Processing voice'
            default: return 'Start voice input'
        }
    }

    const getButtonClasses = () => {
        const baseClasses = `w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`

        if (voiceState === 'listening') {
            return `${baseClasses} bg-red-500 hover:bg-red-600 text-white animate-pulse`
        }

        if (voiceState === 'processing') {
            return `${baseClasses} bg-gray-400 text-white cursor-wait`
        }

        return `${baseClasses} bg-gray-200 hover:bg-harlingen-blue hover:text-white text-gray-600`
    }

    const getIcon = () => {
        if (voiceState === 'processing') {
            return <Loader2 className="w-5 h-5 animate-spin" />
        }
        if (voiceState === 'listening') {
            return <MicOff className="w-5 h-5" />
        }
        return <Mic className="w-5 h-5" />
    }

    return (
        <button
            type="button"
            onClick={toggleListening}
            disabled={disabled || voiceState === 'processing'}
            className={getButtonClasses()}
            aria-label={getAriaLabel()}
            title={getAriaLabel()}
        >
            {getIcon()}
        </button>
    )
}
