import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { openIDB } from '../lib/idb'
import type { WorkoutLogs } from '../lib/supabase'

const IDB_STORE = 'workout_logs'
const IDB_KEY = 'logs'
const DEBOUNCE_MS = 1000

async function getFromIDB(): Promise<WorkoutLogs> {
  const db = await openIDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY)
    req.onsuccess = () => resolve((req.result as WorkoutLogs) || {})
    req.onerror = () => reject(req.error)
    tx.oncomplete = () => db.close()
  })
}

async function setToIDB(logs: WorkoutLogs): Promise<void> {
  const db = await openIDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(logs, IDB_KEY)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => reject(tx.error)
  })
}

export function useWorkoutLogs(userId: string | null) {
  const [logs, setLogs] = useState<WorkoutLogs>({})
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialLoad = useRef(true)

  const loadLogs = useCallback(async () => {
    if (supabase && userId) {
      const { data } = await supabase
        .from('user_workout_logs')
        .select('logs')
        .eq('user_id', userId)
        .maybeSingle()
      if (data?.logs && typeof data.logs === 'object') {
        return data.logs as WorkoutLogs
      }
    }
    return getFromIDB()
  }, [userId])

  useEffect(() => {
    let cancelled = false
    loadLogs().then((loaded) => {
      if (!cancelled) {
        setLogs(loaded)
      }
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [loadLogs])

  const persist = useCallback(async (newLogs: WorkoutLogs) => {
    await setToIDB(newLogs)
    if (supabase && userId) {
      await supabase
        .from('user_workout_logs')
        .upsert({ user_id: userId, logs: newLogs, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    }
  }, [userId])

  const schedulePersist = useCallback((newLogs: WorkoutLogs) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      persist(newLogs).catch(console.error)
    }, DEBOUNCE_MS)
  }, [persist])

  const updateLogs = useCallback((updater: (prev: WorkoutLogs) => WorkoutLogs) => {
    setLogs(prev => {
      const next = updater(prev)
      if (!isInitialLoad.current) schedulePersist(next)
      return next
    })
  }, [schedulePersist])

  useEffect(() => {
    isInitialLoad.current = false
  }, [])

  const handleInputChange = useCallback((exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    updateLogs(prev => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] || {}),
        [setIndex]: {
          ...((prev[exerciseId] || {})[setIndex] || {}),
          [field]: value
        }
      }
    }))
  }, [updateLogs])

  const toggleSetComplete = useCallback((exerciseId: string, setIndex: number, onStartRest: () => void) => {
    updateLogs(prev => {
      const isDone = prev[exerciseId]?.[setIndex]?.done
      if (!isDone) onStartRest()
      return {
        ...prev,
        [exerciseId]: {
          ...(prev[exerciseId] || {}),
          [setIndex]: {
            ...((prev[exerciseId] || {})[setIndex] || {}),
            done: !isDone
          }
        }
      }
    })
  }, [updateLogs])

  return { logs, loading, handleInputChange, toggleSetComplete }
}
