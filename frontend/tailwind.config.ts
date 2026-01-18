import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        harlingen: {
          // Primary brand colors
          navy: '#1a2b4e',
          teal: '#2d4a5e',
          purple: '#4a3d6e',

          // Legacy/accent colors
          blue: '#003B71',
          gold: '#D4A017',
          green: '#2D5F3F',
          orange: '#E67E22',

          // UI colors
          'header-dark': '#1a1d4e',
          'header-light': '#2d4a5e',
        },
        chat: {
          bg: '#F0F4F8',
          'user-bg': '#003B71',
          'user-text': '#FFFFFF',
          'bot-bg': '#F7FAFC',
          'bot-text': '#2D3748',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'harlingen-header': 'linear-gradient(135deg, #1a1d4e 0%, #2d4a5e 50%, #4a3d6e 100%)',
      },
      boxShadow: {
        'chat': '0 10px 40px rgba(0,0,0,0.2)',
        'glow': '0 0 20px rgba(26, 43, 78, 0.5)',
        'glow-lg': '0 0 30px rgba(26, 43, 78, 0.8)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'typing-dot': 'typing 1.4s infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(26, 43, 78, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(26, 43, 78, 0.8)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
