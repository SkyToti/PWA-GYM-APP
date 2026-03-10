import { Dumbbell, TrendingUp } from 'lucide-react'

interface TabNavProps {
  activeTab: 'workout' | 'progress'
  onTabChange: (tab: 'workout' | 'progress') => void
}

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="flex gap-1 p-1 bg-zinc-900/80 rounded-2xl mx-4 mb-4 border border-zinc-800/50">
      <button
        type="button"
        onClick={() => onTabChange('workout')}
        aria-pressed={activeTab === 'workout'}
        aria-label="Ver entrenamiento"
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
          activeTab === 'workout'
            ? 'bg-emerald-500 text-zinc-950 shadow-lg'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
        }`}
      >
        <Dumbbell size={18} strokeWidth={2.5} />
        Entreno
      </button>
      <button
        type="button"
        onClick={() => onTabChange('progress')}
        aria-pressed={activeTab === 'progress'}
        aria-label="Ver progreso"
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
          activeTab === 'progress'
            ? 'bg-emerald-500 text-zinc-950 shadow-lg'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
        }`}
      >
        <TrendingUp size={18} strokeWidth={2.5} />
        Progreso
      </button>
    </nav>
  )
}
