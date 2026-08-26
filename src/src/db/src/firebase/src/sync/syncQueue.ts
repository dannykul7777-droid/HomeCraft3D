import type { AppDB, SyncQueueEntry } from '../db/schema'

// Кладём изменение в очередь локально — работает одинаково и офлайн, и онлайн.
export async function enqueueChange(db: AppDB, entry: Omit<SyncQueueEntry, 'id' | 'createdAt'>) {
  await db.syncQueue.add({ ...entry, createdAt: Date.now() })
  if (navigator.onLine) {
    void flushQueue(db)
  }
}

// Отправляет накопленные изменения в Firestore. Вызывается при появлении сети
// (слушатель — в AuthContext, у него всегда под рукой db текущего пользователя).
export async function flushQueue(db: AppDB) {
  const pending = await db.syncQueue.orderBy('createdAt').toArray()
  if (pending.length === 0) return

  const { getFirestoreDb } = await import('../firebase/config')
  const { doc, setDoc, deleteDoc, collection } = await import('firebase/firestore')
  const firestore = getFirestoreDb()

  for (const entry of pending) {
    try {
      const ref = doc(collection(firestore, entry.entity + 's'), entry.entityId)
      if (entry.op === 'delete') {
        await deleteDoc(ref)
      } else {
        await setDoc(ref, entry.payload as Record<string, unknown>, { merge: true })
      }
      if (entry.id !== undefined) {
        await db.syncQueue.delete(entry.id)
      }
    } catch {
      // Сеть могла снова пропасть на середине — остальное доотправим
      // при следующем событии online.
      break
    }
  }
}
