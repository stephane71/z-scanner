/**
 * React hooks for sync queue operations with useLiveQuery
 * Tracks pending synchronization operations for offline-first architecture
 *
 * @see https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { SyncQueueItem, SyncStatus, SyncAction, SyncEntityType } from '@/types';

/**
 * Hook to get all pending sync items with reactive updates
 * @returns Object with pending items array and loading state
 */
export function usePendingSyncItems() {
  const items = useLiveQuery(async () => {
    return db.syncQueue
      .where('status')
      .equals('pending')
      .sortBy('createdAt');
  }, []);

  return {
    items,
    isLoading: items === undefined,
  };
}

/**
 * Hook to get sync queue count by status
 * @returns Object with counts for each status and loading state
 */
export function useSyncQueueStats() {
  const stats = useLiveQuery(async () => {
    const all = await db.syncQueue.toArray();
    return {
      pending: all.filter((i) => i.status === 'pending').length,
      inProgress: all.filter((i) => i.status === 'in-progress').length,
      completed: all.filter((i) => i.status === 'completed').length,
      failed: all.filter((i) => i.status === 'failed').length,
      total: all.length,
    };
  }, []);

  return {
    stats,
    isLoading: stats === undefined,
  };
}

/**
 * Hook to get failed sync items for retry/review
 * @returns Object with failed items array and loading state
 */
export function useFailedSyncItems() {
  const items = useLiveQuery(async () => {
    return db.syncQueue
      .where('status')
      .equals('failed')
      .sortBy('createdAt');
  }, []);

  return {
    items,
    isLoading: items === undefined,
  };
}

/**
 * Hook to check if there are pending sync items (for UI indicator)
 * @returns Object with hasPending boolean and loading state
 */
export function useHasPendingSync() {
  const count = useLiveQuery(async () => {
    return db.syncQueue.where('status').equals('pending').count();
  }, []);

  return {
    hasPending: count !== undefined && count > 0,
    pendingCount: count ?? 0,
    isLoading: count === undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CRUD Operations (non-reactive)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add a new item to the sync queue
 * @param item - Sync queue item data to insert
 * @returns Promise with the new item ID
 */
export async function addToSyncQueue(
  item: Omit<SyncQueueItem, 'id' | 'status' | 'retries' | 'createdAt'>
): Promise<number> {
  const queueItem: Omit<SyncQueueItem, 'id'> = {
    ...item,
    status: 'pending',
    retries: 0,
    createdAt: new Date().toISOString(),
  };
  const id = await db.syncQueue.add(queueItem as SyncQueueItem);
  return id as number;
}

/**
 * Quick helper to queue a create operation
 * @param entityType - Type of entity being created
 * @param entityId - Local ID of the entity
 * @param payload - Data to sync
 * @returns Promise with the queue item ID
 */
export async function queueCreate(
  entityType: SyncEntityType,
  entityId: number,
  payload: unknown
): Promise<number> {
  return addToSyncQueue({
    action: 'create',
    entityType,
    entityId,
    payload: JSON.stringify(payload),
  });
}

/**
 * Quick helper to queue a cancel operation (for tickets)
 * @param entityId - Local ID of the ticket
 * @param payload - Cancellation data
 * @returns Promise with the queue item ID
 */
export async function queueCancel(
  entityId: number,
  payload: unknown
): Promise<number> {
  return addToSyncQueue({
    action: 'cancel',
    entityType: 'ticket',
    entityId,
    payload: JSON.stringify(payload),
  });
}

/**
 * Update sync queue item status
 * @param id - Queue item ID
 * @param status - New status
 * @param errorMessage - Optional error message (for failed status)
 */
export async function updateSyncStatus(
  id: number,
  status: SyncStatus,
  errorMessage?: string
): Promise<void> {
  const updates: Partial<SyncQueueItem> = {
    status,
    lastAttemptAt: new Date().toISOString(),
  };

  if (status === 'failed' && errorMessage) {
    updates.errorMessage = errorMessage;
  }

  await db.syncQueue.update(id, updates);
}

/**
 * Increment retry count for a queue item
 * @param id - Queue item ID
 * @returns Promise with the new retry count
 */
export async function incrementRetry(id: number): Promise<number> {
  const item = await db.syncQueue.get(id);
  if (!item) throw new Error(`Sync queue item ${id} not found`);

  const newRetries = item.retries + 1;
  await db.syncQueue.update(id, {
    retries: newRetries,
    lastAttemptAt: new Date().toISOString(),
  });

  return newRetries;
}

/**
 * Get the next pending item to process (oldest first)
 * @returns Promise with the next item or undefined
 */
export async function getNextPendingItem(): Promise<SyncQueueItem | undefined> {
  return db.syncQueue
    .where('status')
    .equals('pending')
    .first();
}

/**
 * Mark item as in-progress (being synced)
 * @param id - Queue item ID
 */
export async function markInProgress(id: number): Promise<void> {
  await updateSyncStatus(id, 'in-progress');
}

/**
 * Mark item as completed (successfully synced)
 * @param id - Queue item ID
 */
export async function markCompleted(id: number): Promise<void> {
  await updateSyncStatus(id, 'completed');
}

/**
 * Mark item as failed with error message
 * @param id - Queue item ID
 * @param errorMessage - Error description
 */
export async function markFailed(id: number, errorMessage: string): Promise<void> {
  await updateSyncStatus(id, 'failed', errorMessage);
}
