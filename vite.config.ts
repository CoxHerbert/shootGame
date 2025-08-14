import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { createRequire } from 'module';

// Use require() to load the Vue plugin's CommonJS build. This avoids
// Node's ESM named export check against the installed Vue package and
// prevents "does not provide an export named 'computed'" errors.
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const vue = require('@vitejs/plugin-vue');

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Shooter Raising',
        short_name: 'SR',
        start_url: '/',
        display: 'standalone',
        icons: []
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,mp3,ogg}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true
  }
});
