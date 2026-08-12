import type { MenuItem as ApiMenuItem } from '@cafe/shared-types'
import { api } from './api'

const MENU_TTL_MS = 60_000

let cached: ApiMenuItem[] | null = null
let cachedAt = 0
let inflight: Promise<ApiMenuItem[]> | null = null

/** In-memory menu cache — revisiting /menu skips the loading flash. */
export function peekMenuCache(): ApiMenuItem[] | null {
  if (!cached) return null
  if (Date.now() - cachedAt > MENU_TTL_MS) return null
  return cached
}

export function fetchMenu(force = false): Promise<ApiMenuItem[]> {
  const fresh = peekMenuCache()
  if (!force && fresh) return Promise.resolve(fresh)
  if (!force && inflight) return inflight

  inflight = api
    .get<ApiMenuItem[]>('/menu')
    .then((data) => {
      cached = data
      cachedAt = Date.now()
      return data
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function prefetchMenu(): void {
  void fetchMenu().catch(() => {
    /* warm quietly */
  })
}
