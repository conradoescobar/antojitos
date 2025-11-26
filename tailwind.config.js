/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fondos oscuros con calidez
        noche: {
          950: '#0A0A0A',
          900: '#0D0D0D',
          800: '#141414',
          700: '#1A1A1A',
          600: '#242424',
          500: '#2E2E2E',
        },
        // Dorado ámbar - luces de puesto
        ambar: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FFB800',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Verde lima - limón, cilantro
        lima: {
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#ADFF00',
          600: '#65A30D',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#365314',
        },
        // Rosa mexicano
        rosa: {
          50: '#FFF1F3',
          100: '#FFE4E9',
          200: '#FECDD6',
          300: '#FDA4B8',
          400: '#FB7193',
          500: '#FF3366',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
        },
        // Crema para texto
        crema: {
          50: '#FFFDFB',
          100: '#FFF8E7',
          200: '#FFF3D6',
          300: '#FFEDC4',
          400: '#FFE4A8',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-ambar': '0 0 20px rgba(255, 184, 0, 0.4)',
        'glow-ambar-lg': '0 0 40px rgba(255, 184, 0, 0.5)',
        'glow-lima': '0 0 20px rgba(173, 255, 0, 0.4)',
        'glow-rosa': '0 0 20px rgba(255, 51, 102, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(255, 184, 0, 0.1)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s linear infinite',
        'stagger-1': 'fade-slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        'stagger-2': 'fade-slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        'stagger-3': 'fade-slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
        'stagger-4': 'fade-slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 184, 0, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 184, 0, 0.6)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'fade-slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'shimmer': {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
