import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' agar bisa di-host di subfolder (mis. GitHub Pages /JEJARI/)
export default defineConfig({
  base: './',
  plugins: [react()],
})
