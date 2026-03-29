import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['plan-bit-icon.jpg', 'favicon.ico', 'mask-icon.svg'],
      manifest: {
        name: 'PlanBite',
        short_name: 'PlanBite',
        description: 'Your elegant weekly meal planner',
        theme_color: '#fffbf4',
        icons: [
          {
            src: 'plan-bit-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
