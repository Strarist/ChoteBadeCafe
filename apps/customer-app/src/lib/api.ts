import { joinApiUrl, parseJsonBody, socketOrigin, throwIfNotJson } from '../../../../packages/frontend-api.ts';

const ORDER_ACCESS_KEY = 'cafe-order-access';

export function storeOrderAccess(orderId: string, accessToken: string) {
  const map = readAccessMap();
  map[orderId] = accessToken;
  localStorage.setItem(ORDER_ACCESS_KEY, JSON.stringify(map));
}

export function getOrderAccess(orderId: string): string | null {
  return readAccessMap()[orderId] ?? null;
}

function readAccessMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(ORDER_ACCESS_KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

async function request<T>(path: string, init: RequestInit = {}, orderId?: string): Promise<T> {
  const { headers: initHeaders, ...rest } = init;
  const access = orderId ? getOrderAccess(orderId) : null;
  const res = await fetch(joinApiUrl(path), {
    ...rest,
    headers: {
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...(access ? { 'X-Order-Access': access } : {}),
      ...(initHeaders ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
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
  return parseJsonBody<T>(res, text);
}

export const api = {
  url: socketOrigin(),
  get: <T>(path: string, orderId?: string) => request<T>(path, {}, orderId),
  post: <T>(path: string, body?: unknown, orderId?: string) =>
    request<T>(
      path,
      { method: 'POST', body: body ? JSON.stringify(body) : undefined },
      orderId,
    ),
  patch: <T>(path: string, body?: unknown, orderId?: string) =>
    request<T>(
      path,
      { method: 'PATCH', body: body ? JSON.stringify(body) : undefined },
      orderId,
    ),
};
