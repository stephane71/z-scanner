/**
 * Unit tests for usePendingSyncCount hook
 * Tests reactive ticket count (not raw sync items) using useLiveQuery
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { db } from '@/lib/db';
import { usePendingSyncCount } from './usePendingSyncCount';

describe('usePendingSyncCount', () => {
  beforeEach(async () => {
    await db.syncQueue.clear();
  });

  afterEach(async () => {
    await db.syncQueue.clear();
  });

  it('should return 0 when sync queue is empty', async () => {
    const { result } = renderHook(() => usePendingSyncCount());

    await waitFor(() => {
      expect(result.current).toBe(0);
    });
  });

  it('should return count of pending ticket items only', async () => {
    // Add 3 pending ticket items
    await db.syncQueue.bulkAdd([
      {
        action: 'validate',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      },
      {
        action: 'validate',
        entityType: 'ticket',
        entityId: 2,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      },
      {
        action: 'validate',
        entityType: 'ticket',
        entityId: 3,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      },
    ]);

    const { result } = renderHook(() => usePendingSyncCount());

    await waitFor(() => {
      expect(result.current).toBe(3);
    });
  });

  it('should not count photo entities (only tickets)', async () => {
    await db.syncQueue.bulkAdd([
      {
        action: 'validate',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      },
      {
        action: 'create',
        entityType: 'photo', // Photo should NOT be counted
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      },
    ]);

    const { result } = renderHook(() => usePendingSyncCount());

    // Should only count the ticket, not the photo
    await waitFor(() => {
      expect(result.current).toBe(1);
    });
  });

  it('should count pending and in-progress tickets', async () => {
    await db.syncQueue.bulkAdd([
      {
        action: 'validate',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      },
      {
        action: 'validate',
        entityType: 'ticket',
        entityId: 2,
        payload: '{}',
        status: 'in-progress', // Should be counted
        retries: 0,
        createdAt: new Date().toISOString(),
      },
      {
        action: 'validate',
        entityType: 'ticket',
        entityId: 3,
        payload: '{}',
        status: 'completed', // Should NOT be counted
        retries: 0,
        createdAt: new Date().toISOString(),
      },
      {
        action: 'validate',
        entityType: 'ticket',
        entityId: 4,
        payload: '{}',
        status: 'failed', // Should NOT be counted
        retries: 5,
        createdAt: new Date().toISOString(),
      },
    ]);

    const { result } = renderHook(() => usePendingSyncCount());

    await waitFor(() => {
      expect(result.current).toBe(2); // pending + in-progress
    });
  });

  it('should update reactively when ticket is added', async () => {
    const { result } = renderHook(() => usePendingSyncCount());

    await waitFor(() => {
      expect(result.current).toBe(0);
    });

    await db.syncQueue.add({
      action: 'validate',
      entityType: 'ticket',
      entityId: 1,
      payload: '{}',
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    await waitFor(() => {
      expect(result.current).toBe(1);
    });
  });
});
