/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3A86FF',
          50: '#EAF2FF',
          100: '#D5E5FF',
          200: '#ABCBFF',
          300: '#81B1FF',
          400: '#5798FF',
          500: '#3A86FF',
          600: '#0B64F5',
          700: '#084EC0',
          800: '#06398A',
          900: '#032354'
        },
        accent: {
          DEFAULT: '#FFBE0B',
          50: '#FFF7E0',
          100: '#FFEEC2',
          200: '#FFDD85',
          300: '#FFCC47',
          400: '#FFC22C',
          500: '#FFBE0B',
          600: '#CC9800',
          700: '#997200',
          800: '#664C00',
          900: '#332600'
        },
        dark: '#1A1A1A',
        bg: '#F7F7F7'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 8px 30px rgba(26, 26, 26, 0.08)',
        'card-hover': '0 16px 40px rgba(26, 26, 26, 0.14)',
        glow: '0 0 0 4px rgba(58, 134, 255, 0.15)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        shimmer: 'shimmer 1.8s infinite'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: 0, transform: 'scale(0.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } }
      }
    }
  },
  plugins: []
}
