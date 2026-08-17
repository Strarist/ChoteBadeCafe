import { useEffect, useState } from 'react';
import { joinApiUrl } from '../../../../packages/frontend-api.ts';

export type ConnectionStatus = 'online' | 'offline' | 'server_unreachable';

export function useConnectionStatus(pingPath = '/ping'): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(() =>
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline',
  );

  useEffect(() => {
    const onOffline = () => setStatus('offline');

    const probe = async () => {
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }
      try {
        const res = await fetch(joinApiUrl(pingPath), {
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        });
        setStatus(res.ok ? 'online' : 'server_unreachable');
      } catch {
        setStatus('server_unreachable');
      }
    };

    const onOnline = () => void probe();

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    void probe();
    const interval = window.setInterval(() => void probe(), 30_000);

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      window.clearInterval(interval);
    };
  }, [pingPath]);

  return status;
}
