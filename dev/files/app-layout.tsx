import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ChatWidget } from '@/components/ChatWidget/ChatWidget'
import { ChatProvider } from '@/contexts/ChatContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HarliBot Demo | City of Harlingen',
  description: 'AI-powered chatbot assistant for City of Harlingen services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChatProvider>
          {children}
          <ChatWidget />
        </ChatProvider>
      </body>
    </html>
  )
}
