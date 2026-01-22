/**
 * Tests for useSyncEngine hook - Story 3.9
 * Sync engine orchestration and lifecycle management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import { useSyncEngine } from './useSyncEngine';

// Mock useOnline
const mockUseOnline = vi.fn(() => true);
vi.mock('./useOnline', () => ({
  useOnline: () => mockUseOnline(),
}));

// Mock sync engine
const mockProcessSyncQueue = vi.fn(() =>
  Promise.resolve({ processed: 0, succeeded: 0, failed: 0, errors: [] })
);
vi.mock('@/lib/sync/engine', () => ({
  processSyncQueue: () => mockProcessSyncQueue(),
  getFailedItemsCount: vi.fn(() => Promise.resolve(0)),
}));

describe('useSyncEngine', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await db.syncQueue.clear();
    // Default: online
    mockUseOnline.mockReturnValue(true);
    mockProcessSyncQueue.mockResolvedValue({
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [],
    });
  });

  afterEach(async () => {
    await db.syncQueue.clear();
  });

  it('initializes with default state', async () => {
    const { result } = renderHook(() => useSyncEngine({ autoSync: false }));

    await waitFor(() => {
      expect(result.current.isSyncing).toBe(false);
      expect(result.current.lastSyncResult).toBeNull();
    });
  });

  it('exposes manualSync function', () => {
    const { result } = renderHook(() => useSyncEngine({ autoSync: false }));

    expect(typeof result.current.manualSync).toBe('function');
  });

  it('updates lastSyncResult after sync', async () => {
    const mockResult = { processed: 2, succeeded: 2, failed: 0, errors: [] };
    mockProcessSyncQueue.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useSyncEngine({ autoSync: false }));

    await act(async () => {
      await result.current.manualSync();
    });

    expect(result.current.lastSyncResult).toEqual(mockResult);
  });

  it('does not sync when offline', async () => {
    mockUseOnline.mockReturnValue(false);

    const { result } = renderHook(() => useSyncEngine({ autoSync: false }));

    await act(async () => {
      await result.current.manualSync();
    });

    expect(mockProcessSyncQueue).not.toHaveBeenCalled();
  });

  it('handles sync errors gracefully', async () => {
    mockProcessSyncQueue.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSyncEngine({ autoSync: false }));

    await act(async () => {
      await result.current.manualSync();
    });

    expect(result.current.syncError).toBe('Network error');
    expect(result.current.isSyncing).toBe(false);
  });

  it('clears previous error on successful sync', async () => {
    // First sync fails
    mockProcessSyncQueue.mockRejectedValueOnce(new Error('Error'));

    const { result } = renderHook(() => useSyncEngine({ autoSync: false }));

    await act(async () => {
      await result.current.manualSync();
    });

    expect(result.current.syncError).toBe('Error');

    // Second sync succeeds
    mockProcessSyncQueue.mockResolvedValueOnce({
      processed: 1,
      succeeded: 1,
      failed: 0,
      errors: [],
    });

    await act(async () => {
      await result.current.manualSync();
    });

    expect(result.current.syncError).toBeNull();
  });

  it('exposes pendingCount and failedCount', async () => {
    // Add items to sync queue
    await db.syncQueue.bulkAdd([
      {
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      },
      {
        action: 'create',
        entityType: 'ticket',
        entityId: 2,
        payload: '{}',
        status: 'failed',
        retries: 5,
        createdAt: new Date().toISOString(),
      },
    ]);

    const { result } = renderHook(() => useSyncEngine({ autoSync: false }));

    // Wait for useLiveQuery to update
    await waitFor(() => {
      expect(result.current.pendingCount).toBe(1);
      expect(result.current.failedCount).toBe(1);
    });
  });

  it('tracks isSyncing state correctly', async () => {
    let resolveSync: () => void;
    const syncPromise = new Promise<void>((resolve) => {
      resolveSync = resolve;
    });

    mockProcessSyncQueue.mockImplementationOnce(async () => {
      await syncPromise;
      return { processed: 1, succeeded: 1, failed: 0, errors: [] };
    });

    const { result } = renderHook(() => useSyncEngine({ autoSync: false }));

    // Start sync
    let syncPromiseResult: Promise<void>;
    act(() => {
      syncPromiseResult = result.current.manualSync();
    });

    // Should be syncing
    expect(result.current.isSyncing).toBe(true);

    // Complete sync
    await act(async () => {
      resolveSync!();
      await syncPromiseResult;
    });

    expect(result.current.isSyncing).toBe(false);
  });
});
