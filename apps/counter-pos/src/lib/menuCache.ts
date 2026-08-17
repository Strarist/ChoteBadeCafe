const MENU_KEY = 'counter-pos-menu-v1';

export function saveMenuCache(items: unknown[]): void {
  try {
    sessionStorage.setItem(MENU_KEY, JSON.stringify({ savedAt: Date.now(), items }));
  } catch {
    /* quota / private mode */
  }
}

export function loadMenuCache<T>(): T[] | null {
  try {
    const raw = sessionStorage.getItem(MENU_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { items?: T[] };
    return Array.isArray(parsed.items) && parsed.items.length ? parsed.items : null;
  } catch {
    return null;
  }
}
