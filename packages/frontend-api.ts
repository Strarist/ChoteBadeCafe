/** Browser API base — strips trailing slashes so `/auth/...` does not become `//auth/...`. */
export function resolveApiBase(raw = import.meta.env.VITE_API_URL): string {
  const value = (raw ?? '/api').trim().replace(/\/+$/, '');
  return value || '/api';
}

export function joinApiUrl(path: string, base = resolveApiBase()): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function socketOrigin(base = resolveApiBase()): string {
  if (/^https?:\/\//i.test(base)) return new URL(base).origin;
  return typeof window !== 'undefined' ? window.location.origin : '';
}

export function throwIfNotJson(res: Response, text: string): void {
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('text/html') || /^\s*</.test(text)) {
    throw new Error(
      'VITE_API_URL points at a website, not the API Web Service. Set it to the service whose /health returns JSON (no trailing slash), then rebuild this static site.',
    );
  }
}

/** Reject HTML masquerading as a successful API response (common misconfigured Static Site). */
export function parseJsonBody<T>(res: Response, text: string): T {
  throwIfNotJson(res, text);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`API returned non-JSON (HTTP ${res.status}). Check VITE_API_URL and redeploy.`);
  }
}
