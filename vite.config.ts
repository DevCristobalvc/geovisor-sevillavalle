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
        name: 'Geovisor Ecopedagógico · Sevilla, Valle del Cauca',
        short_name: 'EcoDex Sevilla',
        description:
          'Geovisor ecopedagógico del municipio de Sevilla, Valle del Cauca: explora, pregunta y cuida tu territorio',
        theme_color: '#F2EEE1',
        background_color: '#F2EEE1',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
