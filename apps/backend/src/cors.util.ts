const DEV_ORIGINS =
  'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174';

/** Custom-domain origins that must work even if Render's CORS_ORIGINS is stale. */
export const PUBLIC_CAFE_ORIGINS = [
  'https://chotebadecafe.com',
  'https://www.chotebadecafe.com',
] as const;

function splitOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

export function parseCorsOrigins(raw?: string): string[] {
  const fromEnv = splitOrigins(raw ?? DEV_ORIGINS);
  return [...new Set([...fromEnv, ...PUBLIC_CAFE_ORIGINS])];
}

export function envCorsIsLocalhostOnly(raw?: string): boolean {
  const fromEnv = splitOrigins(raw ?? DEV_ORIGINS);
  return (
    fromEnv.length === 0 ||
    fromEnv.every((origin) => /localhost|127\.0\.0\.1/.test(origin))
  );
}
