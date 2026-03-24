import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  preview: {
    host: true,
    port: 2000,
    allowedHosts: [
      'aliozdemir.tr',
      'alina.aliozdemir.tr',
      'alina2.semihcankadioglu.com.tr',
      'api.alina2.semihcankadioglu.com.tr',
      '.sslip.io'
    ]
  }
})
