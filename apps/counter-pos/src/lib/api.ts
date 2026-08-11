import { joinApiUrl, socketOrigin, throwIfNotJson } from '../../../../packages/frontend-api.ts';

let authToken: string | null = localStorage.getItem('counter-auth-token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('counter-auth-token', token);
  else localStorage.removeItem('counter-auth-token');
}

export function getAuthToken() {
  return authToken;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { headers: initHeaders, ...rest } = init;
  const res = await fetch(joinApiUrl(path), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(initHeaders ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throwIfNotJson(res, text);
    let message = text || `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(text) as { message?: string | string[] };
      if (parsed.message) {
        message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
      }
    } catch {
      /* keep raw */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  /** Socket.IO origin — same host in dev; Render API origin when VITE_API_URL is absolute. */
  url: socketOrigin(),
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
};
