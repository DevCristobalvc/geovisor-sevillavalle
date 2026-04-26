import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          swiper: ['swiper'],
          turf: ['@turf/turf'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
      },
      manifest: {
        name: 'Geovisor Ecopedagógico — Sevilla',
        short_name: 'Geovisor Sevilla',
        description: 'Geovisor web ecopedagógico para el municipio de Sevilla, Valle del Cauca',
        theme_color: '#2D6A4F',
        background_color: '#F5F5F5',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
