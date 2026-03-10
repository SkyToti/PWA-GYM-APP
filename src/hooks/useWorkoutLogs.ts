import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { openIDB } from '../lib/idb'
import type { WorkoutLogs } from '../lib/supabase'
import type { SyncStatus } from './useSyncStatus'

const IDB_STORE = 'workout_logs'
const IDB_KEY = 'logs'
const DEBOUNCE_MS = 1000
const RETRY_MS = 30000

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

function mergeLogs(remote: WorkoutLogs, local: WorkoutLogs): WorkoutLogs {
  const merged = { ...remote }
  for (const [exId, sets] of Object.entries(local)) {
    if (!merged[exId]) merged[exId] = {}
    for (const [setIdx, data] of Object.entries(sets)) {
      const si = Number(setIdx)
      const existing = merged[exId][si]
      if (!existing || (data.done && !existing.done) || (data.weight && !existing.weight)) {
        merged[exId][si] = { ...(merged[exId][si] || {}), ...data }
      }
    }
  }
  return merged
}

export function useWorkoutLogs(
  userId: string | null,
  setSyncStatus?: (s: SyncStatus) => void
) {
  const [logs, setLogs] = useState<WorkoutLogs>({})
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingLogsRef = useRef<WorkoutLogs | null>(null)
  const isInitialLoad = useRef(true)

  const loadLogs = useCallback(async () => {
    if (supabase && userId) {
      setSyncStatus?.('syncing')
      try {
        const { data } = await supabase
          .from('user_workout_logs')
          .select('logs')
          .eq('user_id', userId)
          .maybeSingle()
        const remote = (data?.logs && typeof data.logs === 'object') ? (data.logs as WorkoutLogs) : {}
        const local = await getFromIDB()
        const merged = Object.keys(remote).length > 0 || Object.keys(local).length === 0
          ? mergeLogs(remote, local)
          : local
        if (Object.keys(merged).length > 0 && (Object.keys(remote).length === 0 || JSON.stringify(merged) !== JSON.stringify(remote))) {
          await supabase
            .from('user_workout_logs')
            .upsert({ user_id: userId, logs: merged, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
          await setToIDB(merged)
        } else {
          await setToIDB(merged)
        }
        setSyncStatus?.('online')
        return merged
      } catch {
        setSyncStatus?.('error')
        const local = await getFromIDB()
        return local
      }
    }
    return getFromIDB()
  }, [userId, setSyncStatus])

  useEffect(() => {
    let cancelled = false
    loadLogs().then((loaded) => {
      if (!cancelled) setLogs(loaded)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [loadLogs])

  const persist = useCallback(async (newLogs: WorkoutLogs) => {
    try {
      await setToIDB(newLogs)
      if (supabase && userId) {
        setSyncStatus?.('syncing')
        const { error } = await supabase
          .from('user_workout_logs')
          .upsert({ user_id: userId, logs: newLogs, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        if (error) throw error
        setSyncStatus?.('online')
        pendingLogsRef.current = null
      }
    } catch {
      if (navigator.onLine) setSyncStatus?.('error')
      pendingLogsRef.current = newLogs
      if (retryRef.current) clearTimeout(retryRef.current)
      retryRef.current = setTimeout(() => {
        retryRef.current = null
        if (pendingLogsRef.current) persist(pendingLogsRef.current).catch(console.error)
      }, RETRY_MS)
    }
  }, [userId, setSyncStatus])

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
