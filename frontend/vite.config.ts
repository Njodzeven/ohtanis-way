import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.svg'],
      manifest: {
        name: "Ohtani's Way",
        short_name: "Ohtani",
        description: "Digitize your dreams with the Harada Method Mandala Chart.",
        theme_color: "#f5f5f0",
        background_color: "#f5f5f0",
        display: "standalone",
        icons: [
          {
            src: "pwa-icon.svg",
            sizes: "192x192 512x512",
            type: "image/svg+xml"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure _redirects file is copied to dist
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge'],
          pdf: ['jspdf', 'html2canvas']
        }
      }
    }
  }
})
