import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const installed = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as { standalone?: boolean }).standalone
    setIsInstalled(!!installed)
    if (installed) return

    const dismissed = sessionStorage.getItem('prime_install_dismissed')
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setShowPrompt(false)
    setDeferredPrompt(null)
    if (outcome === 'accepted') setIsInstalled(true)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    sessionStorage.setItem('prime_install_dismissed', '1')
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[90] bg-zinc-800 border border-emerald-500/50 rounded-xl p-4 shadow-xl">
      <p className="text-sm text-zinc-100 font-medium mb-3">Instala la app para usarla como en el móvil</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="flex-1 py-2 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-sm"
        >
          Instalar
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-2 rounded-lg text-zinc-400 text-sm"
        >
          Ahora no
        </button>
      </div>
    </div>
  )
}
