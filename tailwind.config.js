/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        verde: {
          bosque: '#2D6A4F',
          claro: '#52B788',
          palido: '#D8F3DC',
        },
        azul: {
          oscuro: '#1B4F72',
          medio: '#2E86C1',
          palido: '#D6EAF8',
        },
        teal: '#0F6B73',
        ambar: '#B7950B',
        cafe: '#6D4C41',
        naranja: {
          clima: '#F39C12',
          suave: '#FB8C00',
        },
        indigo: '#3949AB',
        suelo: '#8B6914',
        gris: {
          texto: '#4A4A4A',
          claro: '#F5F5F5',
        },
        negro: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        pedagogica: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'map-label': '12px',
      },
      lineHeight: {
        body: '1.6',
        heading: '1.2',
      },
    },
  },
  plugins: [],
}
