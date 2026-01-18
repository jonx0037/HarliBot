'use client'

import React from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'

export function ChatWindow() {
  const { closeChat } = useChatContext()

  return (
    <div 
      className="fixed bottom-6 right-6 w-full max-w-md h-[600px] 
                 bg-white rounded-2xl shadow-chat animate-slide-up z-50
                 flex flex-col overflow-hidden
                 sm:w-[400px]"
      role="region"
      aria-label="Chat with HarliBot"
    >
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  )
}
