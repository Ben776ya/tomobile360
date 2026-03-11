import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Deep Maybach Navy (luxury dark accent)
        primary: {
          50: '#EEF0F4',
          100: '#D5DAE3',
          200: '#ABB5C7',
          300: '#8190AB',
          400: '#576B8F',
          500: '#2D4673',
          600: '#243A5F',
          700: '#1C2541',
          800: '#162037',
          900: '#101A2D',
          950: '#0A1120',
          DEFAULT: '#1C2541',
          foreground: '#ffffff',
        },
        // Secondary - Blue
        secondary: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c1ff',
          300: '#66a3ff',
          400: '#3384ff',
          500: '#006EFE',
          600: '#0058cb',
          700: '#004299',
          800: '#002c66',
          900: '#001633',
          DEFAULT: '#006EFE',
          foreground: '#ffffff',
        },
        // Dark colors - Deep Navy (for header, footer, admin)
        dark: {
          50: '#ECEFF2',  // Creamy silver
          100: '#D5DBE2', // Light silver
          200: '#ABB7C5', // Mid silver
          300: '#8193A8', // Slate
          400: '#576F8B', // Steel blue
          500: '#3A5068', // Dark steel
          600: '#2A3A4E', // Deep navy-steel
          700: '#1F2D3F', // Card background (dark)
          800: '#1C2541', // Main dark background (Maybach navy)
          900: '#141C30', // Deeper navy
          950: '#0D1220', // Deepest navy
          DEFAULT: '#1C2541',
        },
        success: {
          DEFAULT: '#10B981',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#ffffff',
        },
        background: '#ffffff', // White
        foreground: '#1C2541', // Navy text
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1C2541',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1C2541',
        },
        muted: {
          DEFAULT: '#ECEFF2', // Creamy silver
          foreground: '#6B7280',
        },
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#006EFE',
        // Accent color - blue
        accent: {
          DEFAULT: '#006EFE',
          foreground: '#ffffff',
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c1ff',
          300: '#66a3ff',
          400: '#3384ff',
          500: '#006EFE',
          600: '#0058cb',
          700: '#004299',
          800: '#002c66',
          // Named colors for services section
          blue: '#006EFE',
          cyan: '#006EFE',
          purple: '#6B5B8D',
          red: '#EF4444',
          orange: '#E5AC3E',
          yellow: '#006EFE',
          green: '#10B981',
        },
        // Glow utilities
        neon: {
          cyan: '#006EFE',
          indigo: '#1C2541',
          purple: '#6B5B8D',
          blue: '#006EFE',
        },
      },
      fontFamily: {
        sans: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        display: ['var(--font-montserrat-alternates)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        'lg': '0.5rem',
        'md': '0.375rem',
        'sm': '0.25rem',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
        'elevated': '0 8px 24px rgba(0,0,0,0.12)',
        'glow-cyan': '0 0 15px rgba(0,110,254,0.20), 0 0 40px rgba(0,110,254,0.06)',
        'glow-cyan-sm': '0 0 8px rgba(0,110,254,0.15)',
        'glow-cyan-lg': '0 0 25px rgba(0,110,254,0.30), 0 0 60px rgba(0,110,254,0.10)',
        'glow-indigo': '0 0 15px rgba(28,37,65,0.20), 0 0 40px rgba(28,37,65,0.08)',
        'glow-indigo-sm': '0 0 8px rgba(28,37,65,0.15)',
        'glow-indigo-lg': '0 0 25px rgba(28,37,65,0.30), 0 0 60px rgba(28,37,65,0.12)',
        'neon': '0 0 5px rgba(0,110,254,0.20), 0 0 20px rgba(0,110,254,0.10), 0 0 40px rgba(0,110,254,0.04)',
        'dark-card': '0 4px 20px rgba(0,0,0,0.25)',
        'dark-elevated': '0 8px 30px rgba(0,0,0,0.35)',
        'gold': '0 0 12px rgba(0,110,254,0.15)',
        'gold-lg': '0 0 20px rgba(0,110,254,0.25), 0 0 50px rgba(0,110,254,0.08)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,110,254,0.15), 0 0 20px rgba(0,110,254,0.06)' },
          '50%': { boxShadow: '0 0 12px rgba(0,110,254,0.25), 0 0 35px rgba(0,110,254,0.10)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-futuristic': 'linear-gradient(135deg, #1C2541 0%, #2A3A4E 50%, #1C2541 100%)',
        'gradient-hero': 'linear-gradient(135deg, #1C2541 0%, #2A3A4E 40%, #1F2D3F 70%, #1C2541 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(28,37,65,0.9) 0%, rgba(42,58,78,0.9) 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
