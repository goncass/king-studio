import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Gold/Champagne palette
        gold: {
          50: '#fdfcf7',
          100: '#faf7eb',
          200: '#f3edd5',
          300: '#ebe0b8',
          400: '#e0ce8f',
          500: '#d4ba6b',      // Main gold
          600: '#c4a352',      // Hover
          700: '#a68440',      // Active
          800: '#8a6b36',
          900: '#735730',
          950: '#3d2d16',
        },
        // Deep charcoal/black for luxury feel
        noir: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
          1000: '#030303',     // Pure black
        },
        // Keep 'primary' pointing to gold for backward compat
        primary: {
          50: '#fdfcf7',
          100: '#faf7eb',
          200: '#f3edd5',
          300: '#ebe0b8',
          400: '#e0ce8f',
          500: '#d4ba6b',
          600: '#c4a352',
          700: '#a68440',
          800: '#8a6b36',
          900: '#735730',
          950: '#3d2d16',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4ba6b 0%, #f3edd5 50%, #d4ba6b 100%)',
        'noir-gradient': 'linear-gradient(180deg, #09090b 0%, #18181b 50%, #030303 100%)',
      },
    },
  },
  plugins: [],
}
export default config