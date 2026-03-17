import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'https://api.nimda.kr',
          changeOrigin: true,
          secure: true,
        },
        '/solvedac-api': {
          target: 'https://solved.ac',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/solvedac-api/, '/api'),
        },
      },
    },
    // 절대 경로 설정
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
