/**
 * useSyncEngine hook - Story 3.9
 * Orchestrates the background sync lifecycle
 *
 * Features:
 * - Auto-syncs when online and pending items exist
 * - Prevents concurrent sync operations
 * - Exposes manual sync trigger for settings page
 * - Tracks sync status for UI feedback
 *
 * @example
 * const { isSyncing, syncError, manualSync, failedCount } = useSyncEngine();
 *
 * if (syncError) {
 *   toast({ title: 'Sync failed', description: syncError });
 * }
 *
 * <Button onClick={manualSync} disabled={isSyncing}>
 *   Retry Sync ({failedCount} failed)
 * </Button>
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useOnline } from './useOnline';
import { processSyncQueue, type SyncResult } from '@/lib/sync/engine';

/**
 * Result type for the useSyncEngine hook
 */
export interface UseSyncEngineResult {
  /** Whether a sync operation is currently in progress */
  isSyncing: boolean;
  /** Error message from the last failed sync attempt */
  syncError: string | null;
  /** Result of the last sync operation */
  lastSyncResult: SyncResult | null;
  /** Number of failed items in the queue */
  failedCount: number;
  /** Number of pending items in the queue */
  pendingCount: number;
  /** Trigger a manual sync operation */
  manualSync: () => Promise<void>;
}

/**
 * Sync interval in milliseconds (30 seconds)
 */
const SYNC_INTERVAL = 30000;

/**
 * Hook to orchestrate the background sync engine
 *
 * @param options - Configuration options
 * @param options.autoSync - Enable automatic sync when online (default: true)
 * @returns Sync engine state and controls
 */
export function useSyncEngine(options?: { autoSync?: boolean }): UseSyncEngineResult {
  const { autoSync = true } = options ?? {};

  const isOnline = useOnline();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  // Use ref to prevent concurrent syncs
  const syncingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live query for failed count
  const failedCount = useLiveQuery(
    async () => db.syncQueue.where('status').equals('failed').count(),
    [],
    0
  );

  // Live query for pending count
  const pendingCount = useLiveQuery(
    async () => db.syncQueue.where('status').equals('pending').count(),
    [],
    0
  );

  /**
   * Execute a sync operation
   */
  const doSync = useCallback(async () => {
    // Prevent concurrent syncs
    if (syncingRef.current) {
      return;
    }

    // Don't sync if offline
    if (!isOnline) {
      return;
    }

    syncingRef.current = true;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await processSyncQueue();
      setLastSyncResult(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown sync error';
      setSyncError(message);
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
    }
  }, [isOnline]);

  /**
   * Manual sync trigger (exposed to UI)
   */
  const manualSync = useCallback(async () => {
    await doSync();
  }, [doSync]);

  // Auto-sync when coming online with pending items
  useEffect(() => {
    if (!autoSync) return;

    if (isOnline && pendingCount > 0 && !syncingRef.current) {
      doSync();
    }
  }, [isOnline, pendingCount, autoSync, doSync]);

  // Periodic sync interval when online
  useEffect(() => {
    if (!autoSync) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isOnline) {
      intervalRef.current = setInterval(() => {
        if (!syncingRef.current) {
          doSync();
        }
      }, SYNC_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOnline, autoSync, doSync]);

  return {
    isSyncing,
    syncError,
    lastSyncResult,
    failedCount,
    pendingCount,
    manualSync,
  };
}
