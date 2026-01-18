'use client'

import React from 'react'
import { useChatContext } from '@/components/providers/ChatProvider'

export function SkeletonMessage() {
    const { language } = useChatContext()

    const loadingText = language === 'en'
        ? 'HarliBot is thinking...'
        : 'HarliBot está pensando...'

    return (
        <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%]">
                {/* Avatar skeleton */}
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse flex-shrink-0" />

                {/* Message skeleton */}
                <div className="glass-light px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-200 animate-pulse">
                    <span className="sr-only">{loadingText}</span>
                    <div className="h-4 bg-gray-300 rounded w-48 mb-2" />
                    <div className="h-4 bg-gray-300 rounded w-32" />
                </div>
            </div>
        </div>
    )
}
