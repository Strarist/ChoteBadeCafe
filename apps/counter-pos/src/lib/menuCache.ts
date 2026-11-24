const MENU_KEY = 'counter-pos-menu-v3';
const MENU_TTL_MS = 60 * 60 * 1000;

function isValidMenuItem(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    typeof item.category === 'string' &&
    typeof item.isAvailable === 'boolean'
  );
}

export function saveMenuCache(items: unknown[]): void {
  try {
    const safe = items.filter(isValidMenuItem);
    if (!safe.length) return;
    sessionStorage.setItem(
      MENU_KEY,
      JSON.stringify({ savedAt: Date.now(), items: safe }),
    );
  } catch {
    /* quota / private mode */
  }
}

export function loadMenuCache<T>(): T[] | null {
  try {
    const raw = sessionStorage.getItem(MENU_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: number; items?: unknown[] };
    if (!parsed.savedAt || !Array.isArray(parsed.items)) return null;
    if (Date.now() - parsed.savedAt > MENU_TTL_MS) return null;
    const items = parsed.items.filter(isValidMenuItem);
    return items.length ? (items as T[]) : null;
  } catch {
    return null;
  }
}
