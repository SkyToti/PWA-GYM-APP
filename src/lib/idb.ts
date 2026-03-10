const IDB_NAME = 'prime_tracker_idb'
const IDB_VERSION = 2

export function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('workout_logs')) {
        db.createObjectStore('workout_logs')
      }
      if (!db.objectStoreNames.contains('workout_sessions')) {
        const store = db.createObjectStore('workout_sessions', { keyPath: 'id', autoIncrement: false })
        store.createIndex('completed_at', 'completed_at', { unique: false })
        store.createIndex('day_id', 'day_id', { unique: false })
      }
    }
  })
}
