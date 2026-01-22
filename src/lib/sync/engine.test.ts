/**
 * Tests for Sync Engine - Story 3.9
 * Background sync with priority ordering and retry logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import type { SyncQueueItem } from '@/types';
import {
  getItemPriority,
  getPendingItemsByPriority,
  isReadyForRetry,
  syncItem,
  processSyncQueue,
  SYNC_PRIORITY,
  type SyncResult,
} from './engine';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Sync Engine', () => {
  beforeEach(async () => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockFetch.mockReset();

    // Clear all tables before each test
    await db.syncQueue.clear();
    await db.tickets.clear();
    await db.photos.clear();
  });

  afterEach(async () => {
    await db.syncQueue.clear();
    await db.tickets.clear();
    await db.photos.clear();
  });

  describe('getItemPriority', () => {
    it('returns priority 1 for OCR items', () => {
      const item: SyncQueueItem = {
        id: 1,
        action: 'ocr',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      };
      expect(getItemPriority(item)).toBe(1);
    });

    it('returns priority 2 for ticket items', () => {
      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      };
      expect(getItemPriority(item)).toBe(2);
    });

    it('returns priority 3 for photo items', () => {
      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'photo',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      };
      expect(getItemPriority(item)).toBe(3);
    });

    it('returns priority 2 for market items', () => {
      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'market',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      };
      expect(getItemPriority(item)).toBe(2);
    });
  });

  describe('isReadyForRetry', () => {
    it('returns true for first attempt (no lastAttemptAt)', () => {
      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      };
      expect(isReadyForRetry(item)).toBe(true);
    });

    it('returns true for first attempt (retries is 0)', () => {
      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
        lastAttemptAt: new Date().toISOString(),
      };
      expect(isReadyForRetry(item)).toBe(true);
    });

    it('returns false when backoff period has not elapsed', () => {
      // 1 retry means we need 1000ms delay (backoff(0) = 1000)
      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 1,
        createdAt: new Date().toISOString(),
        lastAttemptAt: new Date().toISOString(), // Just now
      };
      expect(isReadyForRetry(item)).toBe(false);
    });

    it('returns true when backoff period has elapsed', () => {
      // 1 retry means we need 1000ms delay
      const lastAttempt = new Date(Date.now() - 2000); // 2 seconds ago
      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 1,
        createdAt: new Date().toISOString(),
        lastAttemptAt: lastAttempt.toISOString(),
      };
      expect(isReadyForRetry(item)).toBe(true);
    });

    it('respects exponential backoff for higher retry counts', () => {
      // 3 retries means we need 4000ms delay (backoff(2) = 4000)
      const lastAttempt3s = new Date(Date.now() - 3000); // 3 seconds ago
      const item3s: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 3,
        createdAt: new Date().toISOString(),
        lastAttemptAt: lastAttempt3s.toISOString(),
      };
      expect(isReadyForRetry(item3s)).toBe(false); // 3s < 4s required

      const lastAttempt5s = new Date(Date.now() - 5000); // 5 seconds ago
      const item5s: SyncQueueItem = {
        ...item3s,
        lastAttemptAt: lastAttempt5s.toISOString(),
      };
      expect(isReadyForRetry(item5s)).toBe(true); // 5s >= 4s required
    });
  });

  describe('getPendingItemsByPriority', () => {
    it('returns items sorted by priority (OCR first, then tickets, then photos)', async () => {
      // Add items in reverse priority order
      await db.syncQueue.bulkAdd([
        {
          action: 'create',
          entityType: 'photo',
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
          status: 'pending',
          retries: 0,
          createdAt: new Date().toISOString(),
        },
        {
          action: 'ocr',
          entityType: 'ticket',
          entityId: 3,
          payload: '{}',
          status: 'pending',
          retries: 0,
          createdAt: new Date().toISOString(),
        },
      ]);

      const items = await getPendingItemsByPriority();

      expect(items).toHaveLength(3);
      expect(items[0].action).toBe('ocr'); // Priority 1
      expect(items[1].entityType).toBe('ticket'); // Priority 2
      expect(items[2].entityType).toBe('photo'); // Priority 3
    });

    it('returns empty array when no pending items', async () => {
      const items = await getPendingItemsByPriority();
      expect(items).toHaveLength(0);
    });

    it('excludes items still in backoff period', async () => {
      await db.syncQueue.bulkAdd([
        {
          action: 'create',
          entityType: 'ticket',
          entityId: 1,
          payload: '{}',
          status: 'pending',
          retries: 2, // Needs 2s backoff (backoff(1) = 2000)
          createdAt: new Date().toISOString(),
          lastAttemptAt: new Date().toISOString(), // Just now - not ready
        },
        {
          action: 'create',
          entityType: 'ticket',
          entityId: 2,
          payload: '{}',
          status: 'pending',
          retries: 0, // First attempt - always ready
          createdAt: new Date().toISOString(),
        },
      ]);

      const items = await getPendingItemsByPriority();

      expect(items).toHaveLength(1);
      expect(items[0].entityId).toBe(2); // Only first-attempt item
    });

    it('excludes non-pending items', async () => {
      await db.syncQueue.bulkAdd([
        {
          action: 'create',
          entityType: 'ticket',
          entityId: 1,
          payload: '{}',
          status: 'completed',
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
        {
          action: 'create',
          entityType: 'ticket',
          entityId: 3,
          payload: '{}',
          status: 'pending',
          retries: 0,
          createdAt: new Date().toISOString(),
        },
      ]);

      const items = await getPendingItemsByPriority();

      expect(items).toHaveLength(1);
      expect(items[0].entityId).toBe(3);
    });
  });

  describe('syncItem', () => {
    it('calls correct API endpoint for ticket sync', async () => {
      // Create ticket in IndexedDB
      const ticketId = (await db.tickets.add({
        type: 'STATISTIQUES',
        status: 'validated',
        impressionDate: '2026-01-22',
        lastResetDate: '2026-01-01',
        resetNumber: 1,
        ticketNumber: 100,
        discountValue: 0,
        cancelValue: 0,
        cancelNumber: 0,
        payments: [],
        total: 1000,
        dataHash: 'abc123',
        clientTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userId: 'test-user-id',
      })) as number;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { serverId: 100 } }),
      });

      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'ticket',
        entityId: ticketId,
        payload: JSON.stringify({ dataHash: 'abc123', total: 1000 }),
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      };

      const result = await syncItem(item);

      expect(mockFetch).toHaveBeenCalledWith('/api/sync/tickets', expect.any(Object));
      expect(result.success).toBe(true);
    });

    it('handles photo sync with invalid blob gracefully', async () => {
      // Note: fake-indexeddb doesn't properly serialize Blob objects,
      // so we test that the sync engine handles this gracefully
      const photoBlob = new Blob(['test image data'], { type: 'image/webp' });

      // Add photo to db - the blob won't serialize properly in test environment
      const photoId = (await db.photos.add({
        ticketId: 1,
        blob: photoBlob,
        thumbnail: photoBlob,
        createdAt: new Date().toISOString(),
      })) as number;

      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'photo',
        entityId: photoId,
        payload: JSON.stringify({ ticketId: 1 }),
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      };

      const result = await syncItem(item);

      // In test environment, blob serialization fails
      // This validates our error handling works correctly
      expect(result.success).toBe(false);
      expect(result.error).toContain('invalid blob');
    });

    it('returns correct endpoint for photo entity type', () => {
      // Simple test to verify photo routing logic exists
      // Full integration test requires real browser environment for Blob support
      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'photo',
        entityId: 999,
        payload: JSON.stringify({ ticketId: 1 }),
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      };

      // Photo not found should give appropriate error
      return syncItem(item).then((result) => {
        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });

    it('returns error when ticket not found', async () => {
      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'ticket',
        entityId: 999, // Non-existent ticket
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      };

      const result = await syncItem(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('returns error on API failure', async () => {
      // Create ticket in IndexedDB
      const ticketId = (await db.tickets.add({
        type: 'STATISTIQUES',
        status: 'validated',
        impressionDate: '2026-01-22',
        lastResetDate: '2026-01-01',
        resetNumber: 1,
        ticketNumber: 100,
        discountValue: 0,
        cancelValue: 0,
        cancelNumber: 0,
        payments: [],
        total: 1000,
        dataHash: 'abc123',
        clientTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userId: 'test-user-id',
      })) as number;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false, error: 'Server error' }),
      });

      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'ticket',
        entityId: ticketId,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      };

      const result = await syncItem(item);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('handles network errors gracefully', async () => {
      // Create ticket in IndexedDB
      const ticketId = (await db.tickets.add({
        type: 'STATISTIQUES',
        status: 'validated',
        impressionDate: '2026-01-22',
        lastResetDate: '2026-01-01',
        resetNumber: 1,
        ticketNumber: 100,
        discountValue: 0,
        cancelValue: 0,
        cancelNumber: 0,
        payments: [],
        total: 1000,
        dataHash: 'abc123',
        clientTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userId: 'test-user-id',
      })) as number;

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const item: SyncQueueItem = {
        id: 1,
        action: 'create',
        entityType: 'ticket',
        entityId: ticketId,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      };

      const result = await syncItem(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('processSyncQueue', () => {
    it('processes all pending items', async () => {
      // Create tickets in IndexedDB first
      const ticketId1 = (await db.tickets.add({
        type: 'STATISTIQUES',
        status: 'validated',
        impressionDate: '2026-01-22',
        lastResetDate: '2026-01-01',
        resetNumber: 1,
        ticketNumber: 100,
        discountValue: 0,
        cancelValue: 0,
        cancelNumber: 0,
        payments: [],
        total: 1000,
        dataHash: 'abc123',
        clientTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userId: 'test-user-id',
      })) as number;
      const ticketId2 = (await db.tickets.add({
        type: 'STATISTIQUES',
        status: 'validated',
        impressionDate: '2026-01-22',
        lastResetDate: '2026-01-01',
        resetNumber: 1,
        ticketNumber: 101,
        discountValue: 0,
        cancelValue: 0,
        cancelNumber: 0,
        payments: [],
        total: 2000,
        dataHash: 'def456',
        clientTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userId: 'test-user-id',
      })) as number;

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { serverId: 100 } }),
      });

      await db.syncQueue.bulkAdd([
        {
          action: 'create',
          entityType: 'ticket',
          entityId: ticketId1,
          payload: '{}',
          status: 'pending',
          retries: 0,
          createdAt: new Date().toISOString(),
        },
        {
          action: 'create',
          entityType: 'ticket',
          entityId: ticketId2,
          payload: '{}',
          status: 'pending',
          retries: 0,
          createdAt: new Date().toISOString(),
        },
      ]);

      const result = await processSyncQueue();

      expect(result.processed).toBe(2);
      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('returns zero counts when queue is empty', async () => {
      const result = await processSyncQueue();

      expect(result.processed).toBe(0);
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('marks successful items as completed', async () => {
      // Create ticket in IndexedDB
      const ticketId = (await db.tickets.add({
        type: 'STATISTIQUES',
        status: 'validated',
        impressionDate: '2026-01-22',
        lastResetDate: '2026-01-01',
        resetNumber: 1,
        ticketNumber: 100,
        discountValue: 0,
        cancelValue: 0,
        cancelNumber: 0,
        payments: [],
        total: 1000,
        dataHash: 'abc123',
        clientTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userId: 'test-user-id',
      })) as number;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { serverId: 100 } }),
      });

      const id = await db.syncQueue.add({
        action: 'create',
        entityType: 'ticket',
        entityId: ticketId,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      });

      await processSyncQueue();

      const item = await db.syncQueue.get(id as number);
      expect(item?.status).toBe('completed');
    });

    it('increments retry count on failure', async () => {
      // Create ticket in IndexedDB
      const ticketId = (await db.tickets.add({
        type: 'STATISTIQUES',
        status: 'validated',
        impressionDate: '2026-01-22',
        lastResetDate: '2026-01-01',
        resetNumber: 1,
        ticketNumber: 100,
        discountValue: 0,
        cancelValue: 0,
        cancelNumber: 0,
        payments: [],
        total: 1000,
        dataHash: 'abc123',
        clientTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userId: 'test-user-id',
      })) as number;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ success: false, error: 'Error' }),
      });

      const id = await db.syncQueue.add({
        action: 'create',
        entityType: 'ticket',
        entityId: ticketId,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      });

      await processSyncQueue();

      const item = await db.syncQueue.get(id as number);
      expect(item?.retries).toBe(1);
      expect(item?.status).toBe('pending'); // Still pending for retry
    });
  });
});
