// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backend = {
  target: 'http://192.168.68.57:8000',
  changeOrigin: true,
}

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': backend,
      '/socket.io': { ...backend, ws: true },
      '/health': backend,
    },
  },

  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
    // NOTE: vite preview does NOT support proxy.
    // If you need the API through the tunnel, use `npm run dev` (see option below)
    // or run a reverse proxy in front of both Vite and your backend.
  },
})