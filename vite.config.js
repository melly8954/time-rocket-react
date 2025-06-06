import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
   define: {
    global: 'window',  // global을 window로 매핑
  },
  plugins: [
    react({
      jsxImportSource: 'react',
    }),
  ],
  server: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})