// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.jsx'),
      formats: ['es'],
      fileName: (format) => `my-component-library.${format}.js`
    },
    rollupOptions: {
      // Mark peer dependencies as external, so they aren’t bundled
      external: ['react', 'react-dom'],
      output: {
        // Remove any auto-publicDir copy
        assetFileNames: 'assets/[name][extname]'
      }
    },
    copyPublicDir: false
  }
});
