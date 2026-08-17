import type { ConnectionStatus } from '../hooks/useConnectionStatus';

type ConnectionBannerProps = {
  status: ConnectionStatus;
};

const MESSAGES: Record<Exclude<ConnectionStatus, 'online'>, string> = {
  offline: "You're offline. Some features won't work until you're back online.",
  server_unreachable: "Can't reach the server. It may be starting up — we'll retry automatically.",
};

export function ConnectionBanner({ status }: ConnectionBannerProps) {
  if (status === 'online') return null;

  return (
    <div className="connection-banner" role="status">
      {MESSAGES[status]}
    </div>
  );
}
