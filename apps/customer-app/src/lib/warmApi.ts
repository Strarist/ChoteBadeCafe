import { joinApiUrl } from '../../../../packages/frontend-api.ts'

/** Ping the API early so free-tier cold starts begin before the user opens Menu. */
export function warmApi(): void {
  void fetch(joinApiUrl('/ping'), { method: 'GET', cache: 'no-store' }).catch(() => {
    /* ignore — MenuPage still handles errors */
  })
}
