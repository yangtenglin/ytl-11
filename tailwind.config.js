/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        cork: {
          50: '#f9f3e9',
          100: '#f4e8d0',
          200: '#e8d5ac',
          300: '#d9bc82',
          400: '#c9a257',
          500: '#b88942',
          600: '#9a6e35',
          700: '#7c552b',
          800: '#654526',
          900: '#533820',
          950: '#2a1f1a',
        },
        parchment: {
          50: '#fdfaf2',
          100: '#f9f1de',
          200: '#f4e4c0',
          300: '#ecd299',
          400: '#e3bc6e',
          500: '#d9a84b',
        },
        ink: {
          50: '#f5f3f0',
          100: '#e7e1d8',
          200: '#cfc4b4',
          300: '#b3a28a',
          400: '#978064',
          500: '#7c6850',
          600: '#615241',
          700: '#4a3f33',
          800: '#372f27',
          900: '#231e18',
          950: '#14110d',
        },
        accent: {
          red: '#8b2c3e',
          redLight: '#a33d52',
          green: '#3a5a40',
          greenLight: '#4d7352',
          gold: '#c9a227',
          goldLight: '#dab83a',
          purple: '#5c4d7d',
          purpleLight: '#7a6a9e',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['"Crimson Text"', 'serif'],
        hand: ['"Ma Shan Zheng"', 'cursive'],
      },
      boxShadow: {
        'paper': '0 2px 8px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.12)',
        'paper-hover': '0 4px 16px rgba(0,0,0,0.2), 0 12px 36px rgba(0,0,0,0.18)',
        'pin': '0 1px 3px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3)',
        'inner-wood': 'inset 0 2px 8px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'cork-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.35 0 0 0 0.16 0 0.25 0 0 0.12 0 0.15 0 0 0.08 0 0 0 0.25 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        'wood-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='wood'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02 0.4' numOctaves='3'/%3E%3CfeColorMatrix type='matrix' values='0.3 0 0 0 0.12 0 0.2 0 0 0.08 0 0.1 0 0 0.04 0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23wood)'/%3E%3C/svg%3E\")",
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23f4e8d0' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float-in': 'float-in 0.6s ease-out forwards',
        'drop': 'drop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 162, 39, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(201, 162, 39, 0)' },
        },
        'float-in': {
          '0%': { opacity: '0', transform: 'translateY(20px) rotate(-3deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotate(0)' },
        },
        'drop': {
          '0%': { opacity: '0', transform: 'translateY(-30px) scale(0.8)' },
          '60%': { transform: 'translateY(5px) scale(1.05)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
