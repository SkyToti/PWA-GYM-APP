import { useState, useEffect, useCallback } from 'react'
import { Calendar } from 'lucide-react'
import { routine } from '../lib/routine'
import { useWorkoutLogs } from '../hooks/useWorkoutLogs'
import { useSyncStatus } from '../hooks/useSyncStatus'
import { useWorkoutSessions } from '../hooks/useWorkoutSessions'
import { saveSessionToHistory } from '../lib/sessions'
import { getRestSeconds, setRestSeconds, getActiveDay, setActiveDay } from '../lib/preferences'
import Header from './Header'
import DaySelector from './DaySelector'
import ExerciseCard from './ExerciseCard'
import RestTimer from './RestTimer'
import SaveButton from './SaveButton'
import TabNav from './TabNav'
import Toast from './Toast'
import { WorkoutSkeleton } from './Skeleton'
import type { WorkoutSession } from '../lib/sessions'
import type { WorkoutLogs } from '../lib/supabase'

interface WorkoutViewProps {
  userId: string | null
  activeTab: 'workout' | 'progress'
  onTabChange: (tab: 'workout' | 'progress') => void
}

function getLastWeightReps(exerciseId: string, sessions: WorkoutSession[], logs: WorkoutLogs): { weight: string; reps: string } | null {
  for (const s of sessions) {
    const exLogs = s.logs[exerciseId] || {}
    for (let i = Object.keys(exLogs).length - 1; i >= 0; i--) {
      const d = exLogs[i]
      if (d?.done && (d.weight || d.reps)) {
        return { weight: d.weight ?? '', reps: d.reps ?? '' }
      }
    }
  }
  const current = logs[exerciseId]
  if (current) {
    const keys = Object.keys(current).map(Number).sort((a, b) => b - a)
    for (const k of keys) {
      const d = current[k]
      if (d?.weight || d?.reps) return { weight: d.weight ?? '', reps: d.reps ?? '' }
    }
  }
  return null
}

export default function WorkoutView({ userId, activeTab, onTabChange }: WorkoutViewProps) {
  const { status: syncStatus, setStatus: setSyncStatus } = useSyncStatus()
  const { sessions } = useWorkoutSessions(userId)
  const [activeDay, setActiveDayState] = useState(getActiveDay)
  const [isSaved, setIsSaved] = useState(false)
  const [restTime, setRestTime] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [restSeconds, setRestSecondsState] = useState(getRestSeconds)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const { logs, loading, handleInputChange, toggleSetComplete } = useWorkoutLogs(
    userId,
    userId ? setSyncStatus : undefined
  )

  useEffect(() => {
    setActiveDayState(getActiveDay())
  }, [])

  const handleSelectDay = useCallback((day: string) => {
    setActiveDayState(day)
    setActiveDay(day)
  }, [])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (isResting && restTime > 0) {
      interval = setInterval(() => setRestTime(t => t - 1), 1000)
    } else if (restTime === 0) {
      setIsResting(false)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isResting, restTime])

  const currentRoutine = routine[activeDay as keyof typeof routine] ?? routine.day1
  const totalSets = currentRoutine.exercises.reduce((acc, ex) => acc + ex.sets, 0)
  const completedSets = currentRoutine.exercises.reduce((acc, ex) => {
    const exLogs = logs[ex.id] || {}
    return acc + Object.values(exLogs).filter(s => s.done).length
  }, 0)
  const progressPercent = totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100)

  const handleToggleComplete = (exerciseId: string, setIndex: number) => {
    toggleSetComplete(exerciseId, setIndex, () => {
      setRestTime(restSeconds)
      setIsResting(true)
    })
  }

  const saveSession = async () => {
    try {
      await saveSessionToHistory(userId, activeDay, logs)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (e) {
      console.error('Error guardando sesión:', e)
      setToast({ message: 'Error al guardar. Comprueba la conexión.', type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Header progressPercent={0} />
        <TabNav activeTab={activeTab} onTabChange={onTabChange} />
        <WorkoutSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-36 selection:bg-emerald-500/30">
      <Header
        progressPercent={progressPercent}
        syncStatus={userId ? syncStatus : undefined}
      />
      <TabNav activeTab={activeTab} onTabChange={onTabChange} />

      <div className="p-4 pt-6">
        <DaySelector routine={routine} activeDay={activeDay} onSelectDay={handleSelectDay} />

        <RestTimerConfig
          restSeconds={restSeconds}
          onChange={(s) => { setRestSecondsState(s); setRestSeconds(s); }}
        />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black tracking-tight">{currentRoutine.title.split(': ')[1]}</h2>
              <p className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5 mt-1">
                <Calendar size={14} aria-hidden /> {currentRoutine.focus}
              </p>
            </div>
            {isResting && (
              <RestTimer
                restTime={restTime}
                onDismiss={() => { setIsResting(false); setRestTime(0) }}
              />
            )}
          </div>

          <div className="space-y-5">
            {currentRoutine.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                logs={logs}
                lastWeightReps={getLastWeightReps(exercise.id, sessions, logs)}
                onInputChange={handleInputChange}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/50 pb-24" style={{ paddingBottom: 'max(6rem, calc(env(safe-area-inset-bottom) + 4rem))' }}>
        <SaveButton isSaved={isSaved} onSave={saveSession} />
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

function RestTimerConfig({ restSeconds, onChange }: { restSeconds: number; onChange: (s: number) => void }) {
  return (
    <div className="flex gap-2 mb-4">
      {[90, 120, 180].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all touch-manipulation ${
            restSeconds === s ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          {s === 90 ? '90s' : s === 120 ? '2 min' : '3 min'}
        </button>
      ))}
    </div>
  )
}
