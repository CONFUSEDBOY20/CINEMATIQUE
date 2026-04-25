import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },

    build: {
      // Split vendor chunks for better long-term caching
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor':  ['react', 'react-dom'],
            'motion-vendor': ['motion/react'],
            'lucide-vendor': ['lucide-react'],
          },
        },
      },
      // Reduce chunk size warnings threshold
      chunkSizeWarningLimit: 600,
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Target modern browsers for smaller output
      target: 'es2020',
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: { '/api': 'http://localhost:5000' },
    },

    // Faster dependency pre-bundling
    optimizeDeps: {
      include: ['react', 'react-dom', 'motion/react', 'lucide-react'],
    },
  };
});
