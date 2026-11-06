import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'assets/images/**/*.webp'],
      manifest: {
        name: 'Tiếng Anh 6 – Học từ vựng',
        short_name: 'Tiếng Anh 6',
        description: 'Học từ vựng Tiếng Anh 6 (Global Success) cho bạn mới bắt đầu',
        lang: 'vi',
        start_url: '/',
        display: 'standalone',
        background_color: '#FFF8E7',
        theme_color: '#FFC83D',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Khung app + JSON + ảnh được cache sẵn; model 3D (.glb) không cache sẵn vì nặng.
        globPatterns: ['**/*.{js,css,html,svg,webp,woff2,json}'],
        // Thư viện 3D (~1MB) và font chữ Kirin không cache sẵn; 3D sẽ được cache khi mở lần đầu.
        globIgnores: ['**/model-viewer-*.js', '**/*cyrillic*'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /model-viewer-.*\.js$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'model-viewer-lib' },
          },
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.glb'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'models-3d',
              expiration: { maxEntries: 200 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/assets/audio/'),
            handler: 'CacheFirst',
            options: { cacheName: 'audio' },
          },
        ],
      },
    }),
  ],
  base: '/',
  build: {
    // model-viewer là chunk tải lười, chỉ dùng khi từ có mô hình 3D
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: 'node',
  },
});
