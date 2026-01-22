'use client';

/**
 * Returns the count of pending (unsynchronized) tickets.
 * Counts only ticket entities (not photos) for user-friendly display.
 * Each validated ticket = 1 count, regardless of associated sync items.
 *
 * Uses useLiveQuery for reactive updates when sync queue changes.
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

/**
 * Hook to get the count of pending tickets to sync
 * @returns The number of pending tickets (0 if loading or empty)
 */
export function usePendingSyncCount(): number {
  const count = useLiveQuery(
    async () => {
      // Count only ticket entities that are pending or in-progress
      // This gives a user-friendly count (1 per ticket, not 1 per sync item)
      return db.syncQueue
        .where('entityType')
        .equals('ticket')
        .and((item) => item.status === 'pending' || item.status === 'in-progress')
        .count();
    },
    [],
    0 // Default value while loading
  );

  return count ?? 0;
}
