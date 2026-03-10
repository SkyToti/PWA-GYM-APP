import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const { needRefresh, updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] bg-amber-500/95 text-zinc-950 py-3 px-4 rounded-xl shadow-lg flex flex-col gap-2">
      <p className="text-sm font-bold text-center">Nueva versión disponible</p>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="w-full py-2 rounded-lg bg-zinc-950 text-white font-bold text-sm"
      >
        Recargar
      </button>
    </div>
  )
}
