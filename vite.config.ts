import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Set base to repository name for GitHub Pages
  // Change 'windsurf-project' to your actual repository name
  base: process.env.GITHUB_PAGES ? '/scibowl-trials/' : '/',
  optimizeDeps: {
    include: ['lucide-react', 'pdfjs-dist']
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'pdf-vendor': ['pdfjs-dist']
        }
      }
    }
  }
})
