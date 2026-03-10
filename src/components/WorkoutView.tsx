import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { routine } from '../lib/routine'
import { useWorkoutLogs } from '../hooks/useWorkoutLogs'
import Header from './Header'
import DaySelector from './DaySelector'
import ExerciseCard from './ExerciseCard'
import RestTimer from './RestTimer'
import SaveButton from './SaveButton'

interface WorkoutViewProps {
  userId: string | null
}

export default function WorkoutView({ userId }: WorkoutViewProps) {
  const [activeDay, setActiveDay] = useState('day1')
  const [isSaved, setIsSaved] = useState(false)
  const [restTime, setRestTime] = useState(0)
  const [isResting, setIsResting] = useState(false)

  const { logs, loading, handleInputChange, toggleSetComplete } = useWorkoutLogs(userId)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (isResting && restTime > 0) {
      interval = setInterval(() => setRestTime(t => t - 1), 1000)
    } else if (restTime === 0) {
      setIsResting(false)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isResting, restTime])

  const currentRoutine = routine[activeDay]
  const totalSets = currentRoutine.exercises.reduce((acc, ex) => acc + ex.sets, 0)
  const completedSets = currentRoutine.exercises.reduce((acc, ex) => {
    const exLogs = logs[ex.id] || {}
    return acc + Object.values(exLogs).filter(s => s.done).length
  }, 0)
  const progressPercent = totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100)

  const handleToggleComplete = (exerciseId: string, setIndex: number) => {
    toggleSetComplete(exerciseId, setIndex, () => {
      setRestTime(120)
      setIsResting(true)
    })
  }

  const saveSession = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-36 selection:bg-emerald-500/30">
      <Header progressPercent={progressPercent} />

      <div className="p-4 pt-6">
        <DaySelector routine={routine} activeDay={activeDay} onSelectDay={setActiveDay} />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black tracking-tight">{currentRoutine.title.split(': ')[1]}</h2>
              <p className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5 mt-1">
                <Calendar size={14} /> {currentRoutine.focus}
              </p>
            </div>
            {isResting && (
              <RestTimer restTime={restTime} onDismiss={() => { setIsResting(false); setRestTime(0) }} />
            )}
          </div>

          <div className="space-y-5">
            {currentRoutine.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                logs={logs}
                onInputChange={handleInputChange}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/50 pb-8" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        <SaveButton isSaved={isSaved} onSave={saveSession} />
      </div>
    </div>
  )
}
