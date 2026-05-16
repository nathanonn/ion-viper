import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 8080,
    open: false,
  },
  build: {
    outDir: 'dist',
  },
});
