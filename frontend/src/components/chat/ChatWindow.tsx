'use client'

import React from 'react'
import { useChatContext } from '@/components/providers/ChatProvider'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'

export function ChatWindow() {
  const { closeChat } = useChatContext()

  return (
    <div
      className="fixed bottom-0 right-0 left-0 sm:bottom-6 sm:right-6 sm:left-auto 
                 w-full sm:w-[380px] md:w-[400px] 
                 h-[calc(100vh-2rem)] sm:h-[600px]
                 glass-light rounded-t-2xl sm:rounded-2xl shadow-card-hover animate-slide-up z-50
                 flex flex-col overflow-hidden border border-harlingen-navy/10"
      role="region"
      aria-label="Chat with HarliBot"
      data-testid="chat-window"
    >
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  )
}
