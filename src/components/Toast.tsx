import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  const colors =
    type === 'success'
      ? 'bg-emerald-500/90 text-zinc-950'
      : type === 'error'
        ? 'bg-red-500/90 text-white'
        : 'bg-zinc-800 text-zinc-100'

  return (
    <div
      className={`fixed bottom-24 left-4 right-4 z-[100] py-3 px-4 rounded-xl shadow-lg ${colors} text-center font-medium text-sm`}
      role="alert"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {message}
    </div>
  )
}
