/**
 * Unit tests for useSyncQueue hooks and CRUD operations
 * Uses fake-indexeddb for in-memory IndexedDB testing
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import {
  addToSyncQueue,
  queueCreate,
  queueCancel,
  updateSyncStatus,
  incrementRetry,
  getNextPendingItem,
  markInProgress,
  markCompleted,
  markFailed,
} from './useSyncQueue';
import type { SyncQueueItem } from '@/types';

describe('useSyncQueue CRUD Operations', () => {
  beforeEach(async () => {
    await db.syncQueue.clear();
  });

  afterEach(async () => {
    await db.syncQueue.clear();
  });

  describe('addToSyncQueue', () => {
    it('should add a sync item with auto-generated fields', async () => {
      const id = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: JSON.stringify({ test: 'data' }),
      });

      expect(id).toBeGreaterThan(0);

      const item = await db.syncQueue.get(id);
      expect(item?.status).toBe('pending');
      expect(item?.retries).toBe(0);
      expect(item?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should store all provided fields correctly', async () => {
      const payload = { ticketId: 123, amount: 5000 };
      const id = await addToSyncQueue({
        action: 'cancel',
        entityType: 'ticket',
        entityId: 456,
        payload: JSON.stringify(payload),
      });

      const item = await db.syncQueue.get(id);

      expect(item?.action).toBe('cancel');
      expect(item?.entityType).toBe('ticket');
      expect(item?.entityId).toBe(456);
      expect(JSON.parse(item!.payload)).toEqual(payload);
    });
  });

  describe('queueCreate', () => {
    it('should create a sync item for create action', async () => {
      const payload = { name: 'Test Ticket' };
      const id = await queueCreate('ticket', 1, payload);

      const item = await db.syncQueue.get(id);

      expect(item?.action).toBe('create');
      expect(item?.entityType).toBe('ticket');
      expect(item?.entityId).toBe(1);
      expect(JSON.parse(item!.payload)).toEqual(payload);
    });

    it('should work with different entity types', async () => {
      await queueCreate('photo', 10, { blob: 'data' });
      await queueCreate('market', 20, { name: 'Market' });

      const items = await db.syncQueue.toArray();

      expect(items).toHaveLength(2);
      expect(items[0].entityType).toBe('photo');
      expect(items[1].entityType).toBe('market');
    });
  });

  describe('queueCancel', () => {
    it('should create a sync item for cancel action on ticket', async () => {
      const payload = { reason: 'Customer refund' };
      const id = await queueCancel(42, payload);

      const item = await db.syncQueue.get(id);

      expect(item?.action).toBe('cancel');
      expect(item?.entityType).toBe('ticket');
      expect(item?.entityId).toBe(42);
      expect(JSON.parse(item!.payload)).toEqual(payload);
    });
  });

  describe('updateSyncStatus', () => {
    it('should update status and set lastAttemptAt', async () => {
      const id = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
      });

      await updateSyncStatus(id, 'in-progress');

      const item = await db.syncQueue.get(id);
      expect(item?.status).toBe('in-progress');
      expect(item?.lastAttemptAt).toBeDefined();
    });

    it('should store error message when status is failed', async () => {
      const id = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
      });

      await updateSyncStatus(id, 'failed', 'Network timeout');

      const item = await db.syncQueue.get(id);
      expect(item?.status).toBe('failed');
      expect(item?.errorMessage).toBe('Network timeout');
    });

    it('should not set errorMessage when status is not failed', async () => {
      const id = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
      });

      await updateSyncStatus(id, 'completed');

      const item = await db.syncQueue.get(id);
      expect(item?.status).toBe('completed');
      expect(item?.errorMessage).toBeUndefined();
    });
  });

  describe('incrementRetry', () => {
    it('should increment retry count', async () => {
      const id = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
      });

      const newCount = await incrementRetry(id);

      expect(newCount).toBe(1);

      const item = await db.syncQueue.get(id);
      expect(item?.retries).toBe(1);
      expect(item?.lastAttemptAt).toBeDefined();
    });

    it('should increment multiple times', async () => {
      const id = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
      });

      await incrementRetry(id);
      await incrementRetry(id);
      const finalCount = await incrementRetry(id);

      expect(finalCount).toBe(3);
    });

    it('should throw error for non-existent item', async () => {
      await expect(incrementRetry(99999)).rejects.toThrow(
        'Sync queue item 99999 not found'
      );
    });
  });

  describe('getNextPendingItem', () => {
    it('should return oldest pending item first (FIFO)', async () => {
      const id1 = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: JSON.stringify({ order: 'first' }),
      });

      // Small delay to ensure different createdAt
      await new Promise((resolve) => setTimeout(resolve, 10));

      await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 2,
        payload: JSON.stringify({ order: 'second' }),
      });

      const next = await getNextPendingItem();

      expect(next?.id).toBe(id1);
      expect(JSON.parse(next!.payload).order).toBe('first');
    });

    it('should skip non-pending items', async () => {
      const id1 = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
      });
      await updateSyncStatus(id1, 'completed');

      const id2 = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 2,
        payload: '{}',
      });

      const next = await getNextPendingItem();

      expect(next?.id).toBe(id2);
    });

    it('should return undefined when no pending items', async () => {
      const next = await getNextPendingItem();

      expect(next).toBeUndefined();
    });
  });

  describe('markInProgress', () => {
    it('should set status to in-progress', async () => {
      const id = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
      });

      await markInProgress(id);

      const item = await db.syncQueue.get(id);
      expect(item?.status).toBe('in-progress');
    });
  });

  describe('markCompleted', () => {
    it('should set status to completed', async () => {
      const id = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
      });

      await markCompleted(id);

      const item = await db.syncQueue.get(id);
      expect(item?.status).toBe('completed');
    });
  });

  describe('markFailed', () => {
    it('should set status to failed with error message', async () => {
      const id = await addToSyncQueue({
        action: 'create',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
      });

      await markFailed(id, 'Server returned 500');

      const item = await db.syncQueue.get(id);
      expect(item?.status).toBe('failed');
      expect(item?.errorMessage).toBe('Server returned 500');
    });
  });

  describe('Sync Queue Workflow', () => {
    it('should support full sync lifecycle: pending → in-progress → completed', async () => {
      // 1. Create item (starts as pending)
      const id = await queueCreate('ticket', 1, { amount: 1000 });
      let item = await db.syncQueue.get(id);
      expect(item?.status).toBe('pending');

      // 2. Mark as processing
      await markInProgress(id);
      item = await db.syncQueue.get(id);
      expect(item?.status).toBe('in-progress');

      // 3. Mark as completed
      await markCompleted(id);
      item = await db.syncQueue.get(id);
      expect(item?.status).toBe('completed');
    });

    it('should support retry workflow: pending → in-progress → failed → retry', async () => {
      const id = await queueCreate('ticket', 1, { amount: 1000 });

      // First attempt fails
      await markInProgress(id);
      await markFailed(id, 'Network error');
      await incrementRetry(id);

      // Reset to pending for retry
      await updateSyncStatus(id, 'pending');

      const item = await db.syncQueue.get(id);
      expect(item?.status).toBe('pending');
      expect(item?.retries).toBe(1);
    });

    it('should track max 5 retries as per NF525 audit trail', async () => {
      const id = await queueCreate('ticket', 1, { amount: 1000 });

      // Simulate 5 retry attempts
      for (let i = 0; i < 5; i++) {
        await incrementRetry(id);
      }

      const item = await db.syncQueue.get(id);
      expect(item?.retries).toBe(5);

      // Mark as permanently failed after max retries
      await markFailed(id, 'Max retries exceeded');
      expect((await db.syncQueue.get(id))?.status).toBe('failed');
    });
  });

  describe('JSON Payload Handling', () => {
    it('should store and retrieve complex payloads', async () => {
      const complexPayload = {
        ticket: {
          id: 1,
          amount: 5000,
          items: ['Item 1', 'Item 2'],
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mobile',
        },
      };

      const id = await queueCreate('ticket', 1, complexPayload);

      const item = await db.syncQueue.get(id);
      const retrieved = JSON.parse(item!.payload);

      expect(retrieved).toEqual(complexPayload);
      expect(retrieved.ticket.items).toHaveLength(2);
    });
  });
});
