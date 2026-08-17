import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { cafeApiProxy } from '../../packages/vite-api-proxy.ts';
import { legalPagesPlugin } from './legal-pages';


const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    legalPagesPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      workbox: {
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [
          /^\/api(?:\/|$)/,
          /^\/privacy(?:\.html)?\/?$/,
          /^\/terms(?:\.html)?\/?$/,
          /^\/refunds(?:\.html)?\/?$/,
          /^\/shipping(?:\.html)?\/?$/,
          /^\/contact(?:\.html)?\/?$/,
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.pathname.startsWith('/api') || url.pathname.startsWith('/payments') || url.pathname.startsWith('/menu') || url.pathname.startsWith('/orders'),
            handler: 'NetworkOnly',
          },
        ],
      },
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
            purpose: 'any',
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@cafe/shared-types': path.resolve(rootDir, '../../packages/shared-types/src/index.ts'),
      '@cafe/frontend-api': path.resolve(rootDir, '../../packages/frontend-api.ts'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    proxy: cafeApiProxy(),
  },
});
