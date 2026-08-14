import { joinApiUrl, throwIfNotJson } from '../../../packages/frontend-api.ts';

export async function api<T>(
  path: string,
  opts?: { method?: string; body?: unknown; token?: string | null },
): Promise<T> {
  const res = await fetch(joinApiUrl(path), {
    method: opts?.method ?? 'GET',
    headers: {
      ...(opts?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  throwIfNotJson(res, text);
  if (!res.ok) {
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
  return text ? (JSON.parse(text) as T) : (null as T);
}
