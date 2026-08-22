import { abortAfter, joinApiUrl } from '../../../../packages/frontend-api.ts'

/** Ping the API early so free-tier cold starts begin before the user opens Menu. */
export function warmApi(): void {
  void fetch(joinApiUrl('/ping'), {
    method: 'GET',
    cache: 'no-store',
    signal: abortAfter(20_000),
  }).catch(() => {
    /* ignore — MenuPage still handles errors */
  })
}
