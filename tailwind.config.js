/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['var(--font-bebas)'],
        montserrat: ['var(--font-montserrat)'],
      },
      colors: {
        primary: '#F9641E',
        'text-heading': '#111827',
        'text-body': '#4B5563',
        success: '#10B981',
        warning: '#F59E0B',
      },
      boxShadow: {
        subtle: '0 4px 12px rgba(0,0,0,0.03)',
      },
    },
  },
  plugins: [],
}

