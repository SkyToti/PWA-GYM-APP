import { Flame, Dumbbell } from 'lucide-react'

interface HeaderProps {
  progressPercent: number
}

export default function Header({ progressPercent }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 pt-6 pb-4 px-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tight flex items-center gap-2">
            <Flame size={24} className="text-emerald-400" />
            PRIME TRACKER
          </h1>
        </div>
        <Dumbbell className="text-emerald-500/50" size={28} />
      </div>
      <div className="w-full bg-zinc-900 rounded-full h-2 mb-1 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500 font-medium text-right">{progressPercent}% completado</p>
    </header>
  )
}
