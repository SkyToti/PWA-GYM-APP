import { supabase } from './supabase'
import { openIDB } from './idb'
import type { WorkoutLogs } from './supabase'

export interface WorkoutSession {
  id: string
  user_id?: string
  day_id: string
  completed_at: string
  logs: WorkoutLogs
  created_at: string
}

export async function saveSessionToHistory(
  userId: string | null,
  dayId: string,
  logs: WorkoutLogs
): Promise<void> {
  const now = new Date().toISOString()
  const session: Omit<WorkoutSession, 'id'> & { id?: string } = {
    day_id: dayId,
    completed_at: now,
    logs,
    created_at: now,
    ...(userId && { user_id: userId }),
  }

  if (supabase && userId) {
    const { error } = await supabase.from('workout_sessions').insert({
      user_id: userId,
      day_id: dayId,
      completed_at: now,
      logs,
      created_at: now,
    })
    if (error) throw error
    return
  }

  const id = crypto.randomUUID()
  const db = await openIDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('workout_sessions', 'readwrite')
    tx.objectStore('workout_sessions').put({ ...session, id } as WorkoutSession)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => reject(tx.error)
  })
}

export async function deleteSession(
  userId: string | null,
  sessionId: string
): Promise<void> {
  if (supabase && userId) {
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId)
    if (error) throw error
    return
  }

  const db = await openIDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('workout_sessions', 'readwrite')
    tx.objectStore('workout_sessions').delete(sessionId)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => reject(tx.error)
  })
}

export async function fetchSessions(userId: string | null, limit = 50): Promise<WorkoutSession[]> {
  if (supabase && userId) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data || []) as WorkoutSession[]
  }

  const db = await openIDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('workout_sessions', 'readonly')
    const req = tx.objectStore('workout_sessions').index('completed_at').openCursor(null, 'prev')
    const results: WorkoutSession[] = []
    req.onsuccess = () => {
      const cursor = req.result
      if (cursor && results.length < limit) {
        results.push(cursor.value as WorkoutSession)
        cursor.continue()
      } else {
        db.close()
        resolve(results)
      }
    }
    req.onerror = () => reject(req.error)
  })
}
