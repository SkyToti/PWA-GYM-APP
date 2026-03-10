import { memo } from 'react'
import { Check, Copy } from 'lucide-react'
import type { Exercise } from '../lib/routine'
import type { WorkoutLogs } from '../lib/supabase'

interface ExerciseCardProps {
  exercise: Exercise
  index: number
  logs: WorkoutLogs
  lastWeightReps?: { weight: string; reps: string } | null
  onInputChange: (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => void
  onToggleComplete: (exerciseId: string, setIndex: number) => void
}

function ExerciseCardInner({ exercise, index, logs, lastWeightReps, onInputChange, onToggleComplete }: ExerciseCardProps) {
  const exLogs = logs[exercise.id] || {}

  const getPlaceholder = (setIndex: number, field: 'weight' | 'reps') => {
    if (setIndex === 0 && lastWeightReps) return field === 'weight' ? lastWeightReps.weight || '0' : lastWeightReps.reps || '0'
    const prev = exLogs[setIndex - 1]
    if (prev && (prev.weight || prev.reps)) return field === 'weight' ? (prev.weight ?? '') : (prev.reps ?? '')
    return '0'
  }

  const handleCopyPrevious = (setIndex: number) => {
    const prev = exLogs[setIndex - 1]
    if (prev) {
      if (prev.weight) onInputChange(exercise.id, setIndex, 'weight', prev.weight)
      if (prev.reps) onInputChange(exercise.id, setIndex, 'reps', prev.reps)
    }
  }

  return (
    <div className="bg-zinc-900/50 rounded-3xl p-5 border border-zinc-800/50 shadow-lg backdrop-blur-sm">
      <div className="flex justify-between items-start mb-5">
        <h3 className="font-bold text-base leading-tight pr-4 text-zinc-100">
          <span className="text-emerald-500 mr-1">{index + 1}.</span> {exercise.name}
        </h3>
        <span className="bg-zinc-950 text-emerald-400 text-xs px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap border border-zinc-800 shadow-inner">
          {exercise.sets}x {exercise.reps}
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="grid grid-cols-[1fr_2fr_2fr_1fr_auto] gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 px-1">
          <div className="text-center">Set</div>
          <div className="text-center">kg</div>
          <div className="text-center">Reps</div>
          <div className="text-center">✓</div>
          <div className="w-8" />
        </div>

        {Array.from({ length: exercise.sets }).map((_, setIndex) => {
          const isDone = exLogs[setIndex]?.done
          const canCopy = setIndex > 0 && (exLogs[setIndex - 1]?.weight || exLogs[setIndex - 1]?.reps) && !isDone
          return (
            <div
              key={setIndex}
              className={`grid grid-cols-[1fr_2fr_2fr_1fr_auto] gap-2 items-center p-1 rounded-xl transition-all duration-300 ${isDone ? 'opacity-40 grayscale-[50%]' : ''}`}
            >
              <div className="text-center text-sm font-bold text-zinc-400">{setIndex + 1}</div>
              <div>
                <input
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  placeholder={getPlaceholder(setIndex, 'weight')}
                  max={999}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 px-2 text-center text-base font-bold text-emerald-50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-zinc-600 shadow-inner min-h-[44px]"
                  value={exLogs[setIndex]?.weight || ''}
                  onChange={(e) => onInputChange(exercise.id, setIndex, 'weight', e.target.value.slice(0, 5))}
                  disabled={isDone}
                  aria-label={`Set ${setIndex + 1} peso`}
                />
              </div>
              <div>
                <input
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  placeholder={getPlaceholder(setIndex, 'reps')}
                  max={999}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 px-2 text-center text-base font-bold text-emerald-50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-zinc-600 shadow-inner min-h-[44px]"
                  value={exLogs[setIndex]?.reps || ''}
                  onChange={(e) => onInputChange(exercise.id, setIndex, 'reps', e.target.value.slice(0, 4))}
                  disabled={isDone}
                  aria-label={`Set ${setIndex + 1} repeticiones`}
                />
              </div>
              <button
                type="button"
                onClick={() => onToggleComplete(exercise.id, setIndex)}
                className={`flex items-center justify-center h-full min-h-[44px] min-w-[44px] aspect-square rounded-xl transition-all duration-300 border shadow-sm active:scale-90 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:border-emerald-500/50'
                }`}
                aria-label={isDone ? `Set ${setIndex + 1} completado` : `Marcar set ${setIndex + 1}`}
              >
                <Check size={20} strokeWidth={isDone ? 4 : 2.5} />
              </button>
              <div className="w-8 flex justify-center">
                {canCopy && (
                  <button
                    type="button"
                    onClick={() => handleCopyPrevious(setIndex)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-emerald-400 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Copiar set anterior"
                  >
                    <Copy size={16} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(ExerciseCardInner)
