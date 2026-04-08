import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Remove any CSP headers that might be blocking eval()
      'Content-Security-Policy': null
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  define: {
    // Disable any potential CSP restrictions
    __CSP_ENABLED__: false
  }
})
