import { useState, useEffect, useCallback } from 'react'
import { fetchSessions } from '../lib/sessions'
import type { WorkoutSession } from '../lib/sessions'

export function useWorkoutSessions(userId: string | null) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchSessions(userId)
      setSessions(data)
    } catch {
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  return { sessions, loading, reload: load }
}
