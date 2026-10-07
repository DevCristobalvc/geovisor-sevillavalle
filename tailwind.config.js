/** @type {import('tailwindcss').Config} */

// Tokens del sistema EcoDex: cada color es una variable CSS con un triplete RGB, definida en
// src/styles/global.css para el tema claro (:root) y el oscuro (.dark). Así una misma clase,
// p. ej. `bg-surface` o `text-ink/70`, funciona en ambos temas y admite opacidad.
const token = nombre => `rgb(var(--c-${nombre}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        surface2: token('surface2'),
        ink: token('ink'),
        'ink-soft': token('ink-soft'),
        muted: token('muted'),
        line: token('line'),
        'line-soft': token('line-soft'),
        accent: token('accent'),
        'on-accent': token('on-accent'),
        'accent-soft': token('accent-soft'),
        lcd: token('lcd'),
        'lcd-ink': token('lcd-ink'),
        earth: token('earth'),
        ocre: token('ocre'),
        danger: token('danger'),
        warn: token('warn'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        pixel: ['"Pixelify Sans"', '"JetBrains Mono"', 'monospace'],
        // En el tema oscuro la interfaz pasa a monoespaciada (modo terminal)
        ui: ['var(--font-ui)'],
        pedagogica: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        dex: 'var(--shadow-dex)',
        'dex-sm': 'var(--shadow-dex-sm)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        blink: 'blink 1.1s steps(1) infinite',
        'led-pulse': 'ledPulse 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        ledPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
    },
  },
  plugins: [],
}
