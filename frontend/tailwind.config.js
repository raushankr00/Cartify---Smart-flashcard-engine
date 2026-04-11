/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', '"Cabinet Grotesk"', 'sans-serif'],
        body:    ['"Instrument Sans"', 'sans-serif'],
        mono:    ['"Fira Code"', 'monospace'],
      },
      colors: {
        sand: {
          50:  '#FAFAF7',
          100: '#F5F4EE',
          200: '#EAE8DC',
          300: '#D8D5C4',
          400: '#B8B49E',
          500: '#8E8A76',
        },
        ink: {
          900: '#1A1916',
          800: '#2C2A26',
          700: '#3D3B35',
          600: '#524F47',
        },
        leaf:   { DEFAULT: '#3D6B4F', light: '#EDF3EF', dark: '#2A4B37' },
        amber:  { DEFAULT: '#C17F2A', light: '#FDF3E3', dark: '#8E5C1E' },
        rose:   { DEFAULT: '#B5433A', light: '#FCEAE9', dark: '#7D2E28' },
        sky:    { DEFAULT: '#2B6CB0', light: '#EBF4FF', dark: '#1E4D84' },
        violet: { DEFAULT: '#6B46C1', light: '#EDE9FF', dark: '#4C3190' },
      },
      boxShadow: {
        card:   '0 1px 3px rgba(26,25,22,0.08), 0 4px 16px rgba(26,25,22,0.06)',
        lifted: '0 4px 12px rgba(26,25,22,0.12), 0 12px 40px rgba(26,25,22,0.08)',
        float:  '0 8px 24px rgba(26,25,22,0.15), 0 24px 64px rgba(26,25,22,0.10)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        'fade-in':    'fadeIn 0.35s ease-out',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16,1,0.3,1)',
        'flip-front': 'flipFront 0.4s ease-in forwards',
        'flip-back':  'flipBack 0.4s ease-out forwards',
        'scale-in':   'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        'spin-slow':  'spin 3s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
      },
    },
  },
  plugins: [],
}
