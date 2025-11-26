/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sistema de grises neutros (estilo Linear/Vercel)
        gray: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          150: '#ECECED',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
        // Acento principal - Violeta sutil (estilo Linear)
        accent: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        // Naranja cálido para comida (acento secundario)
        warm: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Estados
        success: {
          50: '#F0FDF4',
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        // Sombras sutiles estilo Linear
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
        // Sombra de elevación para cards
        'card': '0 0 0 1px rgb(0 0 0 / 0.03), 0 2px 4px rgb(0 0 0 / 0.05), 0 12px 24px rgb(0 0 0 / 0.05)',
        'card-hover': '0 0 0 1px rgb(0 0 0 / 0.03), 0 4px 8px rgb(0 0 0 / 0.08), 0 24px 48px rgb(0 0 0 / 0.08)',
        // Sombra interior sutil
        'inner-soft': 'inset 0 1px 2px rgb(0 0 0 / 0.06)',
        // Ring focus
        'focus': '0 0 0 2px #fff, 0 0 0 4px rgb(139 92 246 / 0.3)',
      },
      backgroundImage: {
        // Gradientes sutiles
        'gradient-subtle': 'linear-gradient(180deg, rgba(250, 250, 250, 0) 0%, rgba(250, 250, 250, 1) 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
        'grid-pattern': 'linear-gradient(to right, rgb(0 0 0 / 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.02) 1px, transparent 1px)',
      },
      animation: {
        // Animaciones suaves estilo Linear
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'fade-in-down': 'fadeInDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-bottom': 'slideInBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.15s ease-out',
        'spin-slow': 'spin 1.5s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInBottom: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
