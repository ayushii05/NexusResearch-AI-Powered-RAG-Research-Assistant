
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'https://nexusresearch-ai-powered-rag-research-5h79.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

