import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
    fs: {
      allow: ['..'],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    typecheck: { tsconfig: './tsconfig.test.json' },
    include: ['src/**/*.{test,spec}.{ts,tsx}', '../tests/frontend/**/*.{test,spec}.{ts,tsx}'],
    alias: [
      {
        find: /^@testing-library\/(.*)$/,
        replacement: path.resolve(__dirname, 'node_modules/@testing-library/$1'),
      },
      {
        find: /^react$/,
        replacement: path.resolve(__dirname, 'node_modules/react'),
      },
      {
        find: /^react-dom$/,
        replacement: path.resolve(__dirname, 'node_modules/react-dom'),
      },
      {
        find: /^react-router-dom$/,
        replacement: path.resolve(__dirname, 'node_modules/react-router-dom'),
      },
    ],
  },
})
