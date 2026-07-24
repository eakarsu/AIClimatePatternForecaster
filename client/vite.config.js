import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const frontendPort = process.env.FRONTEND_PORT || 3000;
const backendPort = process.env.BACKEND_PORT || process.env.PORT || 4000;

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(frontendPort),
    proxy: {
      '/api': `http://127.0.0.1:${backendPort}`
    }
  }
});
