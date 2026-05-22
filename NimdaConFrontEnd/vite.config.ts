import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from "path";
import fs from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // package.json에서 버전 읽기
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
  const appVersion = packageJson.version || '0.0.0'

  return {
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/solvedac-api': {
          target: 'https://solved.ac',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/solvedac-api/, '/api'),
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // [추가] 프로덕션 빌드 시 보안 및 최적화 설정
    build: {
      minify: 'terser', // 강력한 압축 및 난독화 도구 사용
      terserOptions: {
        compress: {
          drop_console: true,   // 배포 시 모든 console.log 제거
          drop_debugger: true,  // 디버거 도구 차단
        },
        mangle: true, // 변수명과 함수명을 무작위 문자로 변경 (난독화 핵심)
      },
      sourcemap: false, // 소스 맵 생성 안 함 (해커가 원본 구조를 못 보게 함)
    },
  }
})
