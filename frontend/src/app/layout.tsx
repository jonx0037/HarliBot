import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import { ChatProvider } from '@/components/providers/ChatProvider'
import ChatWidget from '@/components/chat/ChatWidget'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'City of Harlingen | Official Website',
  description: 'Official website for the City of Harlingen, Texas. Access city services, permits, utilities, and connect with Harlí, your AI assistant.',
  metadataBase: new URL('https://harlibot.vercel.app'),
  openGraph: {
    title: 'City of Harlingen | Official Website',
    description: 'Your gateway to the Rio Grande Valley. Access city services, permits, utilities, and more.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <ChatProvider>
            {children}
            <ChatWidget />
          </ChatProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
