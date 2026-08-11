/** Shared Vite dev-server proxy: same-origin `/api` + Socket.IO → Nest backend. */
export function cafeApiProxy(target = 'http://127.0.0.1:3001') {
  return {
    '/api': {
      target,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
    '/socket.io': {
      target,
      changeOrigin: true,
      ws: true,
    },
  } as const;
}
