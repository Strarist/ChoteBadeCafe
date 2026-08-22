import { abortAfter, joinApiUrl } from './frontend-api.ts';

export type ConnectionStatus = 'checking' | 'online' | 'offline' | 'server_unreachable';

/** Cold starts (Render free) often need >5s; keep probes patient. */
const PING_TIMEOUT_MS = 15_000;
const HEALTHY_POLL_MS = 45_000;
const UNHEALTHY_POLL_MS = 5_000;
/** One blip or a single cold-start timeout must not flash the banner. */
const FAILURES_BEFORE_BANNER = 3;

export type ConnectionProbeHandlers = {
  onStatus: (status: ConnectionStatus) => void;
};

/**
 * Shared connection probe used by customer-app and counter-pos.
 * Returns a cleanup function.
 */
export function startConnectionProbe(
  pingPath: string,
  { onStatus }: ConnectionProbeHandlers,
): () => void {
  let failures = 0;
  let cancelled = false;
  let inFlight = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = (ms: number) => {
    if (cancelled) return;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => void probe(), ms);
  };

  const probe = async () => {
    if (cancelled || inFlight) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      failures = 0;
      onStatus('offline');
      schedule(HEALTHY_POLL_MS);
      return;
    }

    inFlight = true;
    try {
      const res = await fetch(joinApiUrl(pingPath), {
        cache: 'no-store',
        signal: abortAfter(PING_TIMEOUT_MS),
      });
      if (res.ok) {
        failures = 0;
        onStatus('online');
        schedule(HEALTHY_POLL_MS);
      } else {
        failures += 1;
        if (failures >= FAILURES_BEFORE_BANNER) onStatus('server_unreachable');
        schedule(UNHEALTHY_POLL_MS);
      }
    } catch {
      failures += 1;
      if (failures >= FAILURES_BEFORE_BANNER) onStatus('server_unreachable');
      schedule(UNHEALTHY_POLL_MS);
    } finally {
      inFlight = false;
    }
  };

  const onOffline = () => {
    failures = 0;
    onStatus('offline');
  };
  const onOnline = () => {
    failures = 0;
    onStatus('checking');
    void probe();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
  }

  void probe();

  return () => {
    cancelled = true;
    if (timer !== undefined) clearTimeout(timer);
    if (typeof window !== 'undefined') {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    }
  };
}
