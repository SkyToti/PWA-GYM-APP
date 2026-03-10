import { Cloud, CloudOff, Loader2, AlertCircle } from 'lucide-react'
import type { SyncStatus } from '../hooks/useSyncStatus'

interface SyncIndicatorProps {
  status: SyncStatus
}

const labels: Record<SyncStatus, string> = {
  online: 'Sincronizado',
  offline: 'Sin conexión',
  syncing: 'Sincronizando...',
  error: 'Error de sincronización',
}

export default function SyncIndicator({ status }: SyncIndicatorProps) {
  const Icon =
    status === 'online' ? Cloud :
    status === 'offline' ? CloudOff :
    status === 'syncing' ? Loader2 : AlertCircle

  const color =
    status === 'online' ? 'text-emerald-500' :
    status === 'offline' ? 'text-zinc-500' :
    status === 'syncing' ? 'text-amber-400' : 'text-red-400'

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`} aria-live="polite">
      {status === 'syncing' ? (
        <Loader2 size={14} className="animate-spin" aria-hidden />
      ) : (
        <Icon size={14} aria-hidden />
      )}
      <span>{labels[status]}</span>
    </div>
  )
}
