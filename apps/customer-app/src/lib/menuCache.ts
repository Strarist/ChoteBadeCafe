import type { MenuItem as ApiMenuItem } from '@cafe/shared-types'
import { staticMenu } from '../data/staticMenu'
import { api } from './api'

const MEMORY_TTL_MS = 60_000
const STORAGE_KEY = 'chote-bade-menu-v1'
const STORAGE_TTL_MS = 7 * 24 * 60 * 60 * 1000

let cached: ApiMenuItem[] | null = null
let cachedAt = 0
let inflight: Promise<ApiMenuItem[]> | null = null

function isValidMenuItem(value: unknown): value is ApiMenuItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    typeof item.category === 'string' &&
    typeof item.isAvailable === 'boolean'
  )
}

function loadStoredMenu(): ApiMenuItem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { savedAt?: number; items?: unknown[] }
    if (!parsed.savedAt || !Array.isArray(parsed.items)) return null
    if (Date.now() - parsed.savedAt > STORAGE_TTL_MS) return null
    const items = parsed.items.filter(isValidMenuItem)
    return items.length ? items : null
  } catch {
    return null
  }
}

function saveStoredMenu(items: ApiMenuItem[]) {
  const safe = items.filter(isValidMenuItem)
  if (!safe.length) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), items: safe }))
  } catch {
    /* quota / private mode */
  }
}

function hydrateMemory(items: ApiMenuItem[]) {
  cached = items
  cachedAt = Date.now()
}

/** Best available menu for instant render — memory, localStorage, then bundled snapshot. */
export function peekMenuCache(): ApiMenuItem[] | null {
  if (cached && Date.now() - cachedAt <= MEMORY_TTL_MS) return cached

  const stored = loadStoredMenu()
  if (stored) {
    hydrateMemory(stored)
    return stored
  }

  return null
}

/** Bundled fallback when nothing is cached yet (first visit + cold API). */
export function peekMenuFallback(): ApiMenuItem[] {
  return staticMenu
}

export function fetchMenu(force = false): Promise<ApiMenuItem[]> {
  const fresh = peekMenuCache()
  if (!force && fresh) return Promise.resolve(fresh)
  if (!force && inflight) return inflight

  inflight = api
    .get<ApiMenuItem[]>('/menu')
    .then((data) => {
      hydrateMemory(data)
      saveStoredMenu(data)
      return data
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function prefetchMenu(): void {
  void fetchMenu(true).catch(() => {
    /* warm quietly */
  })
}
