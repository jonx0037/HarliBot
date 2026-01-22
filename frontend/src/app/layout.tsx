import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/components/providers/ChatProvider";
import dynamic from 'next/dynamic';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Optimized: reduced from 5 to 3 weights
  display: "swap",
  preload: true,
  variable: "--font-montserrat",
});

// Lazy load chat widget for better initial performance
const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), {
  ssr: false,
  loading: () => null,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "City of Harlingen | Official Website",
  description: "Official website of the City of Harlingen, Texas. Access city services, pay utilities, view events, and connect with your local government.",
  keywords: ["Harlingen", "Texas", "City Government", "Municipal Services", "Utilities", "Permits", "Rio Grande Valley"],
  authors: [{ name: "City of Harlingen" }],
  openGraph: {
    title: "City of Harlingen",
    description: "Your Gateway to the Rio Grande Valley",
    siteName: "City of Harlingen Official Website",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "City of Harlingen",
    description: "Your Gateway to the Rio Grande Valley",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/harlingen-logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans`}>
        <ChatProvider>
          {children}
          <ChatWidget />
        </ChatProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

