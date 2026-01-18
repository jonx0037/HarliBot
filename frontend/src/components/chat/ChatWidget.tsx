'use client'

import React from 'react'
import { useChatContext } from '@/components/providers/ChatProvider'
import { ChatToggleButton } from './ChatToggleButton'
import { ChatWindow } from './ChatWindow'

export default function ChatWidget() {
  const { isOpen } = useChatContext()

  return (
    <>
      {!isOpen && <ChatToggleButton />}
      {isOpen && <ChatWindow />}
    </>
  )
}
