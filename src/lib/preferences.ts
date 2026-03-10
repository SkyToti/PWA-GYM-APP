const KEY_REST_SECONDS = 'prime_tracker_rest_seconds'
const KEY_ACTIVE_DAY = 'prime_tracker_active_day'
const DEFAULT_REST = 120

export function getRestSeconds(): number {
  try {
    const v = localStorage.getItem(KEY_REST_SECONDS)
    if (v) {
      const n = parseInt(v, 10)
      if ([90, 120, 180].includes(n)) return n
    }
  } catch { /* ignore */ }
  return DEFAULT_REST
}

export function setRestSeconds(seconds: number): void {
  localStorage.setItem(KEY_REST_SECONDS, String(seconds))
}

export function getActiveDay(): string {
  try {
    const v = localStorage.getItem(KEY_ACTIVE_DAY)
    if (v && ['day1', 'day2', 'day4', 'day5'].includes(v)) return v
  } catch { /* ignore */ }
  return 'day1'
}

export function setActiveDay(day: string): void {
  localStorage.setItem(KEY_ACTIVE_DAY, day)
}

const KEY_GOAL_WORKOUTS = 'prime_tracker_goal_workouts'
export const DEFAULT_GOAL = 4

export function getGoalWorkouts(): number {
  try {
    const v = localStorage.getItem(KEY_GOAL_WORKOUTS)
    if (v) {
      const n = parseInt(v, 10)
      if (n >= 1 && n <= 7) return n
    }
  } catch { /* ignore */ }
  return DEFAULT_GOAL
}

export function setGoalWorkouts(n: number): void {
  localStorage.setItem(KEY_GOAL_WORKOUTS, String(Math.max(1, Math.min(7, n))))
}
