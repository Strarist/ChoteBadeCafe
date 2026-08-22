import type { ConnectionStatus } from '../hooks/useConnectionStatus'

type ConnectionBannerProps = {
  status: ConnectionStatus
}

const MESSAGES: Partial<Record<ConnectionStatus, string>> = {
  offline: "You're offline. Some features won't work until you're back online.",
  server_unreachable: "Can't reach the server. It may be starting up — we'll retry automatically.",
}

/** Only show after confirmed offline / sustained API failures — never while still checking. */
export function ConnectionBanner({ status }: ConnectionBannerProps) {
  const message = MESSAGES[status]
  if (!message) return null

  return (
    <div
      className="fixed inset-x-0 top-0 z-[90] border-b border-burgundy/20 bg-burgundy/95 px-4 py-2.5 text-center text-xs font-medium text-cream shadow-md"
      role="status"
    >
      {message}
    </div>
  )
}
