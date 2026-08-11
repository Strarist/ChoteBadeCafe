import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cafeApiProxy } from '../../packages/vite-api-proxy.ts';


const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@cafe/shared-types': path.resolve(rootDir, '../../packages/shared-types/src/index.ts'),
      '@cafe/frontend-api': path.resolve(rootDir, '../../packages/frontend-api.ts'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    proxy: cafeApiProxy(),
  },
});
