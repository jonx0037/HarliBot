import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        harlingen: {
          blue: '#003B71',
          gold: '#D4A017',
          green: '#2D5F3F',
        },
        chat: {
          bg: '#F0F4F8',
          'user-bg': '#003B71',
          'user-text': '#FFFFFF',
          'bot-bg': '#F7FAFC',
          'bot-text': '#2D3748',
        },
      },
      boxShadow: {
        'chat': '0 10px 40px rgba(0, 0, 0, 0.12)',
        'chat-button': '0 4px 12px rgba(0, 59, 113, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-dot': 'bounce 1.4s infinite ease-in-out',
        'slide-up': 'slideUp 200ms ease-out',
        'fade-in': 'fadeIn 150ms ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
