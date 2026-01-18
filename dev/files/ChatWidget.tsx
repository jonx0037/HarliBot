'use client'

import React from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import { ChatToggleButton } from './ChatToggleButton'
import { ChatWindow } from './ChatWindow'

export function ChatWidget() {
  const { isOpen } = useChatContext()

  return (
    <>
      {!isOpen && <ChatToggleButton />}
      {isOpen && <ChatWindow />}
    </>
  )
}
