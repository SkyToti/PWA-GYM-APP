import { useState, useEffect } from 'react'

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error'

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>(
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
  )

  useEffect(() => {
    const onOnline = () => setStatus('online')
    const onOffline = () => setStatus('offline')
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return { status, setStatus }
}
