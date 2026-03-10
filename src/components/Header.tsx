import { Flame, Dumbbell, Sun, Moon } from 'lucide-react'
import SyncIndicator from './SyncIndicator'
import type { SyncStatus } from '../hooks/useSyncStatus'
import { useTheme } from '../hooks/useTheme'

interface HeaderProps {
  progressPercent?: number
  showProgress?: boolean
  syncStatus?: SyncStatus
}

export default function Header({ progressPercent = 0, showProgress = true, syncStatus }: HeaderProps) {
  const [theme, setTheme] = useTheme()
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 pt-6 pb-4 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tight flex items-center gap-2">
            <Flame size={24} className="text-emerald-400" />
            PRIME TRACKER
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {syncStatus && <SyncIndicator status={syncStatus} />}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-emerald-400 touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Alternar tema claro/oscuro"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Dumbbell className="text-emerald-500/50" size={28} aria-hidden />
        </div>
      </div>
      {showProgress && (
        <>
          <div className="w-full bg-zinc-900 rounded-full h-2 mb-1 overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 font-medium text-right">{progressPercent}% completado</p>
        </>
      )}
    </header>
  )
}
