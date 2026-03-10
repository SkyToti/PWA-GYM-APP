import type { WorkoutSession } from './sessions'
import { routine } from './routine'

export interface ExercisePR {
  exerciseId: string
  exerciseName: string
  dayId: string
  dayName: string
  maxWeight: number
  maxReps: number
  estimated1RM: number
  date: string
  sessionId: string
}

/** Epley: 1RM ≈ weight × (1 + reps/30) */
export function estimate1RM(weight: number, reps: number): number {
  if (weight <= 0) return 0
  if (reps <= 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

export interface ExerciseProgression {
  exerciseId: string
  exerciseName: string
  dayId: string
  history: { date: string; weight: number; reps: number; volume: number }[]
  trend: 'up' | 'down' | 'stable'
  lastWeight: number
  bestWeight: number
}

export interface SessionStats {
  date: string
  sessionId: string
  dayId: string
  volume: number
  setsDone: number
  totalSets: number
}

function parseNum(s: string | undefined): number {
  if (!s) return 0
  const n = parseFloat(s.replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function extractExerciseData(
  sessions: WorkoutSession[]
): { exerciseId: string; weight: number; reps: number; date: string; sessionId: string }[] {
  const result: { exerciseId: string; weight: number; reps: number; date: string; sessionId: string }[] = []
  for (const s of sessions) {
    for (const [exId, sets] of Object.entries(s.logs)) {
      for (const setData of Object.values(sets)) {
        if (setData?.done && (setData.weight || setData.reps)) {
          const w = parseNum(setData.weight)
          const r = parseNum(setData.reps)
          if (w > 0 || r > 0) {
            result.push({
              exerciseId: exId,
              weight: w,
              reps: r || 1,
              date: s.completed_at,
              sessionId: s.id,
            })
          }
        }
      }
    }
  }
  return result
}

function getExerciseName(exerciseId: string): string {
  for (const day of Object.values(routine)) {
    const ex = day.exercises.find(e => e.id === exerciseId)
    if (ex) return ex.name
  }
  return exerciseId
}

function getDayName(dayId: string): string {
  const day = routine[dayId as keyof typeof routine]
  return day?.title.split(': ')[1] ?? dayId
}

export function computePRs(sessions: WorkoutSession[]): ExercisePR[] {
  const data = extractExerciseData(sessions)
  const byExercise = new Map<string, typeof data>()
  for (const d of data) {
    if (!byExercise.has(d.exerciseId)) byExercise.set(d.exerciseId, [])
    byExercise.get(d.exerciseId)!.push(d)
  }

  const prs: ExercisePR[] = []
  for (const [exId, entries] of byExercise) {
    const withWeight = entries.filter(e => e.weight > 0)
    if (withWeight.length === 0) continue
    const best = withWeight.reduce((a, b) =>
      a.weight > b.weight ? a : a.weight === b.weight && a.reps > b.reps ? a : b
    )
    const session = sessions.find(s => s.id === best.sessionId)
    prs.push({
      exerciseId: exId,
      exerciseName: getExerciseName(exId),
      dayId: session?.day_id ?? '',
      dayName: getDayName(session?.day_id ?? ''),
      maxWeight: best.weight,
      maxReps: best.reps,
      estimated1RM: estimate1RM(best.weight, best.reps),
      date: best.date,
      sessionId: best.sessionId,
    })
  }
  return prs.sort((a, b) => b.estimated1RM - a.estimated1RM)
}

export function computeProgressions(sessions: WorkoutSession[], limitPerExercise = 8): ExerciseProgression[] {
  const data = extractExerciseData(sessions)
  const byExercise = new Map<string, typeof data>()
  for (const d of data) {
    if (!byExercise.has(d.exerciseId)) byExercise.set(d.exerciseId, [])
    byExercise.get(d.exerciseId)!.push(d)
  }

  const progressions: ExerciseProgression[] = []
  for (const [exId, entries] of byExercise) {
    const withWeight = entries.filter(e => e.weight > 0)
    if (withWeight.length < 2) continue
    const sorted = [...withWeight].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const recent = sorted.slice(-limitPerExercise)
    const history = recent.map(e => ({
      date: e.date,
      weight: e.weight,
      reps: e.reps,
      volume: e.weight * e.reps,
    }))
    const weights = history.map(h => h.weight)
    const lastWeight = weights[weights.length - 1] ?? 0
    const bestWeight = Math.max(...weights)
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (weights.length >= 3) {
      const firstHalf = weights.slice(0, Math.floor(weights.length / 2))
      const secondHalf = weights.slice(Math.floor(weights.length / 2))
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      const diff = avgSecond - avgFirst
      if (diff > 1) trend = 'up'
      else if (diff < -1) trend = 'down'
    }
    const session = sessions.find(s => s.id === entries[0]?.sessionId)
    progressions.push({
      exerciseId: exId,
      exerciseName: getExerciseName(exId),
      dayId: session?.day_id ?? '',
      history,
      trend,
      lastWeight,
      bestWeight,
    })
  }
  return progressions.sort((a, b) => b.bestWeight - a.bestWeight)
}

export function computeSessionStats(sessions: WorkoutSession[]): SessionStats[] {
  return sessions.map(s => {
    let volume = 0
    let setsDone = 0
    const dayInfo = routine[s.day_id as keyof typeof routine]
    const totalSets = dayInfo?.exercises.reduce((a, e) => a + e.sets, 0) ?? 0
    for (const sets of Object.values(s.logs)) {
      for (const setData of Object.values(sets)) {
        if (setData?.done) {
          setsDone++
          const w = parseNum(setData.weight)
          const r = parseNum(setData.reps) || 1
          volume += w * r
        }
      }
    }
    return {
      date: s.completed_at,
      sessionId: s.id,
      dayId: s.day_id,
      volume,
      setsDone,
      totalSets,
    }
  })
}

export function computeWeekComparison(sessions: WorkoutSession[]): { thisWeek: number; lastWeek: number } {
  const now = new Date()
  const thisWeekStart = new Date(now)
  thisWeekStart.setDate(now.getDate() - now.getDay())
  thisWeekStart.setHours(0, 0, 0, 0)
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  let thisWeek = 0
  let lastWeek = 0
  const seenThis = new Set<string>()
  const seenLast = new Set<string>()
  for (const s of sessions) {
    const d = new Date(s.completed_at)
    const dateKey = s.completed_at.slice(0, 10)
    if (d >= thisWeekStart) {
      if (!seenThis.has(dateKey)) { seenThis.add(dateKey); thisWeek++ }
    } else if (d >= lastWeekStart && d < thisWeekStart) {
      if (!seenLast.has(dateKey)) { seenLast.add(dateKey); lastWeek++ }
    }
  }
  return { thisWeek, lastWeek }
}

export function computeStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0
  const dateSet = new Set(sessions.map(s => s.completed_at.slice(0, 10)))
  const dates = [...dateSet].sort()
  if (dates.length === 0) return 0
  const mostRecent = dates[dates.length - 1]
  const today = new Date().toISOString().slice(0, 10)
  const diffMs = new Date(today).getTime() - new Date(mostRecent).getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays > 1) return 0
  let streak = 0
  let d = new Date(mostRecent + 'T12:00:00')
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10)
    if (dateSet.has(key)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
}
