/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial RUCASH (del logo)
        navy: {
          50:  '#EEF2F8',
          100: '#D5DFED',
          200: '#ABBFDB',
          300: '#7E9EC8',
          400: '#517EB5',
          500: '#2D5EA2',
          600: '#1E4B8A',
          700: '#172B4D',   // navy principal (logo)
          800: '#0F1D35',
          900: '#070E1C',
        },
        teal: {
          50:  '#E6FBF7',
          100: '#C0F5EC',
          200: '#8AEDD8',
          300: '#4DDFC0',
          400: '#1ED4AB',
          500: '#00C9A7',   // teal principal (logo)
          600: '#00A98C',
          700: '#008870',
          800: '#006754',
          900: '#004538',
        },
        // Neutrales premium
        slate: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px' }],
      },
      boxShadow: {
        'card':  '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,.08), 0 2px 4px -2px rgba(0,0,0,.06)',
        'modal': '0 20px 60px -10px rgba(0,0,0,.25)',
        'nav':   '1px 0 0 0 #E2E8F0',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
