import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 모든 인터페이스(IPv4 127.0.0.1 포함)에 바인딩 — localhost 접속 보장
    port: 5273,
    open: true,
  },
});
