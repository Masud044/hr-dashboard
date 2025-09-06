import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Use process.env.API_BASE for proxy in Vite config
// eslint-disable-next-line no-undef
// const API_BASE = process.env.API_BASE || 'http://103.172.44.99:8989/api_bwal'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
      target: "http://103.172.44.99:8989/api_bwal",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
