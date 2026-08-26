import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
      '/cases': process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
      '/documents': process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
      '/api-proxy': {
        target: 'https://sih-dms.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
      },
    },
  },
})
