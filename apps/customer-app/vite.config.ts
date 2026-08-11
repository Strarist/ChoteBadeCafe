import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { cafeApiProxy } from '../../packages/vite-api-proxy.ts';


const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Chote Bade Café',
        short_name: 'Chote Bade',
        description: 'Order from your table — Chote Bade Café',
        theme_color: '#ede6da',
        background_color: '#ede6da',
        display: 'standalone',
        start_url: '/menu',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@cafe/shared-types': path.resolve(rootDir, '../../packages/shared-types/src/index.ts'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    proxy: cafeApiProxy(),
  },
});
