import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // يضمن توافق مسارات الملفات مع GitHub Pages
  build: {
    outDir: 'dist'
  }
});
