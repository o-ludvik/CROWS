import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Project Pages URL: https://o-ludvik.github.io/CROWS/
  base: '/CROWS/',
  plugins: [react()],
})
