import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.png', 'app-icon.jpg', 'favicon.ico', 'mask-icon.svg'],
      manifest: {
        name: 'PlanNext',
        short_name: 'PlanNext',
        description: 'Your elegant weekly planner',
        theme_color: '#fffbf4',
        icons: [
          {
            src: 'app-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
