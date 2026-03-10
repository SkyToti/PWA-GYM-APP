import type { RoutineType } from '../lib/routine'

interface DaySelectorProps {
  routine: RoutineType
  activeDay: string
  onSelectDay: (dayId: string) => void
}

export default function DaySelector({ routine, activeDay, onSelectDay }: DaySelectorProps) {
  return (
    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide snap-x">
      {Object.values(routine).map((day) => (
        <button
          key={day.id}
          type="button"
          onClick={() => onSelectDay(day.id)}
          aria-pressed={activeDay === day.id}
          aria-label={`Seleccionar ${day.title.split(':')[0]}`}
          className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 snap-start min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
            activeDay === day.id
              ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-100'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 scale-95'
          }`}
        >
          {day.title.split(':')[0]}
        </button>
      ))}
    </div>
  )
}
