'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react'
import { track } from '@vercel/analytics'
import type { Message as MessageType } from '@/components/providers/ChatProvider'
import { useChatContext } from '@/components/providers/ChatProvider'

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const { language, isStreaming, messages } = useChatContext()
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)
  const isUser = message.role === 'user'

  // Show cursor when this is the last message and we're streaming
  const isLastMessage = messages[messages.length - 1]?.id === message.id
  const showStreamingCursor = !isUser && isStreaming && isLastMessage

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleFeedback = (rating: 'positive' | 'negative') => {
    // Toggle off if clicking the same rating
    const newRating = feedback === rating ? null : rating
    setFeedback(newRating)

    if (newRating) {
      track('feedback_submitted', {
        rating: newRating,
        messageId: message.id,
        language
      })
    }
  }

  const copyLabel = language === 'en' ? 'Copy message' : 'Copiar mensaje'
  const thumbsUpLabel = language === 'en' ? 'Helpful' : 'Útil'
  const thumbsDownLabel = language === 'en' ? 'Not helpful' : 'No útil'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      data-testid={`message-${isUser ? 'user' : 'assistant'}`}
    >
      <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar (bot only) */}
        {!isUser && (
          <div className="w-8 h-8 bg-gradient-to-br from-harlingen-navy to-harlingen-teal rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">H</span>
          </div>
        )}

        <div className="flex flex-col">
          {/* Message Bubble */}
          <div
            className={`
              px-4 py-3 rounded-2xl animate-fade-in shadow-sm
              ${isUser
                ? 'bg-gradient-to-br from-harlingen-navy to-harlingen-teal text-white rounded-br-sm'
                : 'glass-light text-gray-800 rounded-tl-sm border border-gray-200'
              }
            `}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
                  a: ({ href, children }: any) => (
                    <a
                      href={href as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`underline ${isUser ? 'hover:text-harlingen-gold' : 'text-harlingen-blue hover:text-harlingen-navy'}`}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {/* Streaming cursor */}
              {showStreamingCursor && (
                <span className="inline-block w-2 h-4 ml-1 bg-harlingen-navy animate-pulse" />
              )}
            </div>

            {/* Sources */}
            {!isUser && message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-xs text-gray-600 mb-1 font-semibold">
                  {language === 'en' ? 'Sources:' : 'Fuentes:'}
                </p>
                <div className="space-y-1">
                  {message.sources.map((source: any, i: number) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-harlingen-blue hover:text-harlingen-navy 
                                 hover:underline truncate transition-smooth"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timestamp and Copy Button */}
          <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <time
              className="text-xs text-gray-500"
              dateTime={message.timestamp.toISOString()}
            >
              {formatTimestamp(message.timestamp, language)}
            </time>

            {/* Copy button - only on assistant messages */}
            {!isUser && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                aria-label={copyLabel}
                title={copyLabel}
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Feedback buttons - only on assistant messages */}
            {!isUser && !isStreaming && message.content && (
              <>
                <button
                  onClick={() => handleFeedback('positive')}
                  className={`p-1 rounded transition-all focus:outline-none focus:ring-2 focus:ring-green-400 ${feedback === 'positive'
                    ? 'bg-green-100 text-green-600'
                    : 'opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                  aria-label={thumbsUpLabel}
                  title={thumbsUpLabel}
                  data-testid="feedback-positive"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleFeedback('negative')}
                  className={`p-1 rounded transition-all focus:outline-none focus:ring-2 focus:ring-red-400 ${feedback === 'negative'
                    ? 'bg-red-100 text-red-600'
                    : 'opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                  aria-label={thumbsDownLabel}
                  title={thumbsDownLabel}
                  data-testid="feedback-negative"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTimestamp(date: Date, language: 'en' | 'es'): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) {
    return language === 'en' ? 'Just now' : 'Ahora mismo'
  }

  if (diffMins < 60) {
    return language === 'en'
      ? `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
      : `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
  }

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) {
    return language === 'en'
      ? `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
      : `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  }

  return date.toLocaleTimeString(language === 'en' ? 'en-US' : 'es-ES', {
    hour: 'numeric',
    minute: '2-digit',
  })
}
