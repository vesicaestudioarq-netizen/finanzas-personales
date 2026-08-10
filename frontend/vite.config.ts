import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';

const frontendDir = path.resolve(__dirname, '.');

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          content: [
            path.join(frontendDir, 'index.html'),
            path.join(frontendDir, 'src/**/*.{js,ts,jsx,tsx}'),
          ],
          theme: {
            extend: {
              colors: {
                primary: { DEFAULT: '#195740', light: '#236b4e', dark: '#123d2c' },
                accent:  { DEFAULT: '#4C857F', light: '#5a9b94' },
                beige:   { DEFAULT: '#EAE2CF', dark: '#d4c9b0' },
                success: '#10b981',
                danger:  '#ef4444',
              },
            },
          },
          plugins: [],
        }),
        autoprefixer(),
      ],
    },
  },
  server: { proxy: { '/api': 'http://localhost:3002' } },
});
