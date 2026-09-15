import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      '__GOOGLE_CLIENT_ID__': JSON.stringify(env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || '')
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    }
  };
})
