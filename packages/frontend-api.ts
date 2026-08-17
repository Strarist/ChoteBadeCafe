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

export const DEFAULT_FETCH_TIMEOUT_MS = 20_000;
export const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const GET_RETRY_DELAYS_MS = [500, 1500];

export function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

export function normalizeFetchError(err: unknown): Error {
  if (err instanceof Error) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      return new Error('Request timed out. The server may be waking up — try again.');
    }
    if (err.message === 'Failed to fetch' || (err instanceof TypeError && err.message.includes('fetch'))) {
      if (isBrowserOffline()) {
        return new Error("You're offline. Check your connection and try again.");
      }
      return new Error("Can't reach the server. It may be starting up — try again in a moment.");
    }
    return err;
  }
  return new Error(String(err));
}

export function normalizeHttpError(status: number, message: string): Error {
  if (status === 429) {
    return new Error('Too many requests. Wait a moment and try again.');
  }
  if (RETRYABLE_STATUSES.has(status)) {
    return new Error('Server is temporarily unavailable. Please try again.');
  }
  return new Error(message);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ResilientFetchOptions = RequestInit & {
  timeoutMs?: number;
  /** Extra GET attempts after the first (2 = up to 3 tries total). Ignored for mutating methods. */
  retries?: number;
};

/** fetch with timeout; GET retries on transient network/502/503/504 failures. */
export async function resilientFetch(
  input: RequestInfo | URL,
  init: ResilientFetchOptions = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_FETCH_TIMEOUT_MS, retries = 0, ...fetchInit } = init;
  const method = (fetchInit.method ?? 'GET').toUpperCase();
  const maxAttempts = method === 'GET' ? 1 + retries : 1;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const signal = AbortSignal.timeout(timeoutMs);
      const res = await fetch(input, { ...fetchInit, signal });

      if (method === 'GET' && RETRYABLE_STATUSES.has(res.status) && attempt < maxAttempts - 1) {
        await sleep(GET_RETRY_DELAYS_MS[attempt] ?? 1500);
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
      const isRetryable =
        err instanceof TypeError ||
        (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'));

      if (method === 'GET' && isRetryable && attempt < maxAttempts - 1) {
        await sleep(GET_RETRY_DELAYS_MS[attempt] ?? 1500);
        continue;
      }

      throw normalizeFetchError(err);
    }
  }

  throw normalizeFetchError(lastError);
}
