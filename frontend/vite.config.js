import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      protocol: 'ws',
      port: 5173,
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/auth': 'http://localhost:8000',
      '/media': 'http://localhost:8000',
      '/process': 'http://localhost:8000',
      '/admin': 'http://localhost:8000',
    }
  }
})
