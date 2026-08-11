const DEV_ORIGINS =
  'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174';

export function parseCorsOrigins(raw?: string): string[] {
  return (raw ?? DEV_ORIGINS)
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}
