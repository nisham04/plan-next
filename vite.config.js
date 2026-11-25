import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-180.png', 'app-icon.png', 'favicon.ico'],
      manifest: {
        name: 'PlanNext',
        short_name: 'PlanNext',
        description: 'Your elegant weekly planner',
        theme_color: '#13120f',
        background_color: '#13120f',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        shortcuts: [
          {
            name: "Today's Meals",
            short_name: 'Today',
            description: "Open PlanBite Today's Meals widget view",
            url: '/?widget=today',
            icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }]
          }
        ],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
