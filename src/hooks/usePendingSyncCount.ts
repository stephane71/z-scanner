'use client'

/**
 * Returns the count of pending (unsynchronized) items in the sync queue.
 * Used to warn users before logout if they have unsynchronized data.
 *
 * NOTE: The Dexie database schema and syncQueue table will be created in
 * Epic 3 (Story 3.1). For now, this hook returns 0 as the database doesn't
 * exist yet.
 *
 * Once Epic 3 is implemented, replace this implementation with:
 * ```typescript
 * import { useLiveQuery } from 'dexie-react-hooks'
 * import { db } from '@/lib/db'
 *
 * export function usePendingSyncCount(): number {
 *   const count = useLiveQuery(
 *     async () => db.syncQueue.where('status').equals('pending').count(),
 *     [],
 *     0
 *   )
 *   return count ?? 0
 * }
 * ```
 */
export function usePendingSyncCount(): number {
  // Placeholder implementation until Epic 3 creates the Dexie database
  // Returns 0 as there's no sync queue yet
  // The sync warning feature will become active once Story 3.1 is implemented
  return 0
}
