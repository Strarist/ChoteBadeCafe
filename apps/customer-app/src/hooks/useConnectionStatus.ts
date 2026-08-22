import { useEffect, useState } from 'react'
import {
  startConnectionProbe,
  type ConnectionStatus,
} from '../../../../packages/connection-status.ts'

export type { ConnectionStatus }

export function useConnectionStatus(pingPath = '/ping'): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'checking',
  )

  useEffect(() => startConnectionProbe(pingPath, { onStatus: setStatus }), [pingPath])

  return status
}
