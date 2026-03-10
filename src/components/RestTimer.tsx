import { Timer } from 'lucide-react'

interface RestTimerProps {
  restTime: number
  onDismiss: () => void
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function RestTimer({ restTime, onDismiss }: RestTimerProps) {
  return (
    <button
      type="button"
      onClick={onDismiss}
      aria-label={`Temporizador de descanso ${formatTime(restTime)}, tocar para detener`}
      className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-full border border-emerald-500/20 animate-pulse active:scale-95 transition-all cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.2)] min-h-[44px] focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <Timer size={16} />
      <span className="font-bold font-mono text-sm">{formatTime(restTime)}</span>
    </button>
  )
}
