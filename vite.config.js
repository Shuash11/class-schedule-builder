import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the production build works on GitHub Pages project
  // subpaths (/class-schedule-builder/) and in local development alike.
  base: './',
  plugins: [react(), tailwindcss()],
})
