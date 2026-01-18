'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'

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
  language: 'en' | 'es'
  error: string | null
}

type ChatAction =
  | { type: 'OPEN_CHAT' }
  | { type: 'CLOSE_CHAT' }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
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
      content: '¡Bienvenido a HarliBot!\n\nSoy su asistente virtual para la Ciudad de Harlingen. Puedo ayudarle con:\n• Información sobre servicios municipales\n• Servicios públicos y facturación\n• Eventos y programas\n\nIntente preguntar "¿Cómo puedo pagar mi factura de agua?"',
      timestamp: new Date(),
    }]
  }

  return [{
    id: welcomeId,
    role: 'assistant',
    content: 'Welcome to HarliBot!\n\nI\'m your virtual assistant for the City of Harlingen. I can help you with:\n• City services information\n• Utilities and billing\n• Events and programs\n\nTry asking "How do I pay my water bill?"',
    timestamp: new Date(),
  }]
}

const initialState: ChatState = {
  messages: getWelcomeMessages('en'),
  isOpen: false,
  isTyping: false,
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

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload }

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
  }, [])

  // Save conversation history to localStorage whenever it changes
  useEffect(() => {
    if (state.messages.length > 0) {
      localStorage.setItem('harlibot-history', JSON.stringify(state.messages))
    }
  }, [state.messages])

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
    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

    // Set typing indicator
    dispatch({ type: 'SET_TYPING', payload: true })

    try {
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          language: state.language,
          conversationHistory: state.messages.slice(-6), // Last 3 exchanges
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from server')
      }

      const data = await response.json()

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sources: data.sources,
      }
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage })

    } catch (error) {
      console.error('Error sending message:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: state.language === 'en'
          ? 'Failed to get response. Please try again.'
          : 'No se pudo obtener respuesta. Por favor intenta de nuevo.'
      })

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: state.language === 'en'
          ? 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
          : 'Lo siento, pero estoy teniendo problemas de conexión. Por favor intenta de nuevo en un momento.',
        timestamp: new Date(),
      }
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage })

    } finally {
      dispatch({ type: 'SET_TYPING', payload: false })
    }
  }

  const setLanguage = (lang: 'en' | 'es') => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang })
  }

  const clearHistory = () => {
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
