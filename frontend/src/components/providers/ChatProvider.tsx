'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { track } from '@vercel/analytics'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    title: string
    url: string
  }>
}

interface ChatState {
  messages: Message[]
  isOpen: boolean
  isTyping: boolean
  isStreaming: boolean
  language: 'en' | 'es'
  error: string | null
}

type ChatAction =
  | { type: 'OPEN_CHAT' }
  | { type: 'CLOSE_CHAT' }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; content?: string; sources?: Message['sources'] } }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'es' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_HISTORY'; payload: Message[] }
  | { type: 'CLEAR_HISTORY' }

// Initial welcome messages
const getWelcomeMessages = (language: 'en' | 'es'): Message[] => {
  const welcomeId = 'welcome-' + Date.now()

  if (language === 'es') {
    return [{
      id: welcomeId,
      role: 'assistant',
      content: '¡Hola, soy Harlí!\n\nSoy tu asistente virtual para la Ciudad de Harlingen. Puedo ayudarte con:\n• Información sobre servicios municipales\n• Servicios públicos y facturación\n• Eventos y programas\n\n¡Pregúntame lo que quieras sobre los servicios de la ciudad!',
      timestamp: new Date(),
    }]
  }

  return [{
    id: welcomeId,
    role: 'assistant',
    content: 'Hi, I\'m Harlí!\n\nI\'m your virtual assistant for the City of Harlingen. I can help you with:\n• City services information\n• Utilities and billing\n• Events and programs\n\nJust ask me anything about city services!',
    timestamp: new Date(),
  }]
}

const initialState: ChatState = {
  messages: getWelcomeMessages('en'),
  isOpen: false,
  isTyping: false,
  isStreaming: false,
  language: 'en',
  error: null,
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'OPEN_CHAT':
      return { ...state, isOpen: true }

    case 'CLOSE_CHAT':
      return { ...state, isOpen: false }

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      }

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload }

    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload }

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? {
              ...msg,
              content: action.payload.content !== undefined
                ? msg.content + action.payload.content
                : msg.content,
              sources: action.payload.sources ?? msg.sources,
            }
            : msg
        ),
      }

    case 'SET_LANGUAGE':
      // If only the welcome message exists, regenerate it in the new language
      const isOnlyWelcome = state.messages.length === 1 &&
        state.messages[0].id.startsWith('welcome-')
      return {
        ...state,
        language: action.payload,
        messages: isOnlyWelcome ? getWelcomeMessages(action.payload) : state.messages
      }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'LOAD_HISTORY':
      return { ...state, messages: action.payload }

    case 'CLEAR_HISTORY':
      return { ...state, messages: getWelcomeMessages(state.language) }

    default:
      return state
  }
}

interface ChatContextValue extends ChatState {
  openChat: () => void
  closeChat: () => void
  sendMessage: (content: string) => Promise<void>
  setLanguage: (lang: 'en' | 'es') => void
  clearHistory: () => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const [hasHydrated, setHasHydrated] = React.useState(false)

  // Load conversation history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('harlibot-history')
    if (saved) {
      try {
        const history: any[] = JSON.parse(saved)
        // Convert timestamp strings back to Date objects
        const messagesWithDates: Message[] = history.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        dispatch({ type: 'LOAD_HISTORY', payload: messagesWithDates })
      } catch (error) {
        console.error('Failed to load chat history:', error)
        // On error, start fresh with welcome message
        dispatch({ type: 'LOAD_HISTORY', payload: getWelcomeMessages('en') })
      }
    }

    // Load language preference
    const savedLang = localStorage.getItem('harlibot-language') as 'en' | 'es'
    if (savedLang === 'en' || savedLang === 'es') {
      dispatch({ type: 'SET_LANGUAGE', payload: savedLang })
    }

    // Mark as hydrated - this will trigger a re-render and enable saving
    setHasHydrated(true)
  }, [])

  // Listen for language changes from LanguageProvider
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<'en' | 'es'>) => {
      if (event.detail !== state.language) {
        dispatch({ type: 'SET_LANGUAGE', payload: event.detail })
      }
    }

    window.addEventListener('language-change', handleLanguageChange as EventListener)
    return () => {
      window.removeEventListener('language-change', handleLanguageChange as EventListener)
    }
  }, [state.language])

  // Save conversation history to localStorage whenever it changes
  // Only save after hydration is complete to avoid overwriting saved data
  useEffect(() => {
    if (!hasHydrated) return

    if (state.messages.length > 0) {
      localStorage.setItem('harlibot-history', JSON.stringify(state.messages))
    }
  }, [state.messages, hasHydrated])

  // Save language preference
  useEffect(() => {
    localStorage.setItem('harlibot-language', state.language)
  }, [state.language])

  const openChat = () => {
    dispatch({ type: 'OPEN_CHAT' })
  }

  const closeChat = () => {
    dispatch({ type: 'CLOSE_CHAT' })
  }

  const sendMessage = async (content: string) => {
    const startTime = Date.now()

    // Track message sent event
    track('chat_message_sent', { language: state.language })

    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

    // Create placeholder for streaming response
    const assistantMessageId = `assistant-${Date.now()}`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage })
    dispatch({ type: 'SET_STREAMING', payload: true })

    try {
      // Call API with SSE streaming
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          language: state.language,
          conversationHistory: state.messages.slice(-6).map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from server')
      }

      // Parse SSE stream
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let sources: Array<{ title: string; url: string }> = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.text) {
                // Append text chunk to message
                dispatch({
                  type: 'UPDATE_MESSAGE',
                  payload: { id: assistantMessageId, content: data.text }
                })
              }

              if (data.done) {
                // Stream complete - update sources
                sources = data.sources || []
                dispatch({
                  type: 'UPDATE_MESSAGE',
                  payload: { id: assistantMessageId, sources }
                })
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }
      }

      const responseTime = Date.now() - startTime

      // Track response received with timing
      track('chat_response_received', {
        responseTime,
        hasRAGSources: sources.length > 0,
        language: state.language
      })

    } catch (error) {
      console.error('Error sending message:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: state.language === 'en'
          ? 'Failed to get response. Please try again.'
          : 'No se pudo obtener respuesta. Por favor intenta de nuevo.'
      })

      // Update placeholder with error message
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          id: assistantMessageId,
          content: state.language === 'en'
            ? 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
            : 'Lo siento, pero estoy teniendo problemas de conexión. Por favor intenta de nuevo en un momento.'
        }
      })

    } finally {
      dispatch({ type: 'SET_STREAMING', payload: false })
    }
  }

  const setLanguage = (lang: 'en' | 'es') => {
    track('language_changed', { from: state.language, to: lang })
    dispatch({ type: 'SET_LANGUAGE', payload: lang })
  }

  const clearHistory = () => {
    track('chat_cleared', { language: state.language })
    dispatch({ type: 'CLEAR_HISTORY' })
    localStorage.removeItem('harlibot-history')
  }

  const value: ChatContextValue = {
    ...state,
    openChat,
    closeChat,
    sendMessage,
    setLanguage,
    clearHistory,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
