/**
 * Unit tests for OCR queue
 * Story 3.3: OCR Processing (Claude 3.5 Haiku API)
 * Based on Z-ticket (Statistique Totaux) data model
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';

// Reset Dexie before importing
import Dexie from 'dexie';
Dexie.delete('ZScannerDB');

import { db } from '@/lib/db';
import {
  queueForOcr,
  getOcrQueue,
  getOcrQueueCount,
  processOcrQueue,
  clearCompletedOcrItems,
} from './queue';

// Mock processOcr
vi.mock('./client', () => ({
  processOcr: vi.fn(),
  isOcrError: (err: unknown) =>
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    'message' in err,
}));

import { processOcr } from './client';

describe('OCR Queue', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.syncQueue.clear();
    await db.tickets.clear();
    await db.photos.clear();
    vi.clearAllMocks();
  });

  // Helper to create a test ticket with Z-ticket fields
  const createTestTicket = async () => {
    return db.tickets.add({
      dataHash: 'test-hash',
      type: 'STATISTIQUES',
      impressionDate: '2026-01-18',
      lastResetDate: '2026-01-15',
      resetNumber: 1,
      ticketNumber: 1,
      discountValue: 0,
      cancelValue: 0,
      cancelNumber: 0,
      payments: [],
      total: 0,
      userId: 'test-user',
      status: 'draft',
      createdAt: new Date().toISOString(),
      clientTimestamp: new Date().toISOString(),
      ocrStatus: 'pending_ocr',
    });
  };

  // Helper to create mock OCR result
  const createMockOcrResult = () => ({
    type: 'STATISTIQUES' as const,
    impressionDate: '2026-01-18',
    lastResetDate: '2026-01-15',
    resetNumber: 42,
    ticketNumber: 123,
    discountValue: 500,
    cancelValue: 250,
    cancelNumber: 2,
    payments: [
      { mode: 'CB' as const, value: 3500 },
      { mode: 'ESPECES' as const, value: 750 },
    ],
    total: 4250,
    confidence: {
      type: 0.98,
      impressionDate: 0.95,
      lastResetDate: 0.92,
      resetNumber: 0.90,
      ticketNumber: 0.88,
      discountValue: 0.85,
      cancelValue: 0.82,
      cancelNumber: 0.80,
      payments: 0.90,
      total: 0.95,
    },
  });

  describe('queueForOcr', () => {
    it('should add ticket to OCR queue', async () => {
      await queueForOcr(1);

      const queue = await db.syncQueue.toArray();
      expect(queue).toHaveLength(1);
      expect(queue[0].action).toBe('ocr');
      expect(queue[0].entityType).toBe('ticket');
      expect(queue[0].entityId).toBe(1);
      expect(queue[0].status).toBe('pending');
    });

    it('should not duplicate queue entries for same ticket', async () => {
      await queueForOcr(1);
      await queueForOcr(1);

      const queue = await db.syncQueue.toArray();
      expect(queue).toHaveLength(1);
    });

    it('should allow multiple tickets in queue', async () => {
      await queueForOcr(1);
      await queueForOcr(2);
      await queueForOcr(3);

      const queue = await db.syncQueue.toArray();
      expect(queue).toHaveLength(3);
    });
  });

  describe('getOcrQueue', () => {
    it('should return only pending OCR items', async () => {
      // Add various queue items
      await db.syncQueue.add({
        action: 'ocr',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      });
      await db.syncQueue.add({
        action: 'ocr',
        entityType: 'ticket',
        entityId: 2,
        payload: '{}',
        status: 'completed',
        retries: 0,
        createdAt: new Date().toISOString(),
      });
      await db.syncQueue.add({
        action: 'create',
        entityType: 'ticket',
        entityId: 3,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      });

      const queue = await getOcrQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].entityId).toBe(1);
    });
  });

  describe('getOcrQueueCount', () => {
    it('should return count of pending OCR items', async () => {
      await queueForOcr(1);
      await queueForOcr(2);
      await queueForOcr(3);

      const count = await getOcrQueueCount();
      expect(count).toBe(3);
    });

    it('should return 0 when queue is empty', async () => {
      const count = await getOcrQueueCount();
      expect(count).toBe(0);
    });
  });

  describe('processOcrQueue', () => {
    it('should process pending OCR items', async () => {
      // Setup ticket and photo
      const ticketId = await createTestTicket();

      await db.photos.add({
        ticketId: ticketId as number,
        blob: new Blob(['test'], { type: 'image/webp' }),
        thumbnail: new Blob(['thumb'], { type: 'image/webp' }),
        createdAt: new Date().toISOString(),
      });

      await queueForOcr(ticketId as number);

      // Mock successful OCR with new Z-ticket format
      vi.mocked(processOcr).mockResolvedValueOnce(createMockOcrResult());

      const successCount = await processOcrQueue();
      expect(successCount).toBe(1);

      // Check ticket was updated with new fields
      const ticket = await db.tickets.get(ticketId as number);
      expect(ticket?.ocrStatus).toBe('ocr_complete');
      expect(ticket?.total).toBe(4250);
      expect(ticket?.ticketNumber).toBe(123);
      expect(ticket?.payments).toHaveLength(2);
    });

    it('should increment retry count on failure', async () => {
      // Setup ticket and photo
      const ticketId = await createTestTicket();

      await db.photos.add({
        ticketId: ticketId as number,
        blob: new Blob(['test'], { type: 'image/webp' }),
        thumbnail: new Blob(['thumb'], { type: 'image/webp' }),
        createdAt: new Date().toISOString(),
      });

      await queueForOcr(ticketId as number);

      // Mock failed OCR
      vi.mocked(processOcr).mockRejectedValueOnce({
        type: 'api_error',
        message: 'Test error',
      });

      await processOcrQueue();

      // Check queue item was updated
      const queueItems = await db.syncQueue.toArray();
      expect(queueItems[0].retries).toBe(1);
      expect(queueItems[0].status).toBe('pending');
    });

    it('should mark as failed after max retries', async () => {
      // Add ticket and photo
      const ticketId = await createTestTicket();

      await db.photos.add({
        ticketId: ticketId as number,
        blob: new Blob(['test'], { type: 'image/webp' }),
        thumbnail: new Blob(['thumb'], { type: 'image/webp' }),
        createdAt: new Date().toISOString(),
      });

      // Add queue item with 4 retries already (one more failure = 5 = max)
      await db.syncQueue.add({
        action: 'ocr',
        entityType: 'ticket',
        entityId: ticketId as number,
        payload: '{}',
        status: 'pending',
        retries: 4,
        createdAt: new Date().toISOString(),
      });

      // Mock failed OCR
      vi.mocked(processOcr).mockRejectedValueOnce({
        type: 'api_error',
        message: 'Max retries test error',
      });

      await processOcrQueue();

      // Check queue item was marked as failed
      const queueItems = await db.syncQueue.toArray();
      expect(queueItems[0].status).toBe('failed');

      // Check ticket was marked as failed
      const ticket = await db.tickets.get(ticketId as number);
      expect(ticket?.ocrStatus).toBe('ocr_failed');
    });
  });

  describe('clearCompletedOcrItems', () => {
    it('should remove completed OCR items', async () => {
      await db.syncQueue.add({
        action: 'ocr',
        entityType: 'ticket',
        entityId: 1,
        payload: '{}',
        status: 'completed',
        retries: 0,
        createdAt: new Date().toISOString(),
      });
      await db.syncQueue.add({
        action: 'ocr',
        entityType: 'ticket',
        entityId: 2,
        payload: '{}',
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
      });

      const cleared = await clearCompletedOcrItems();
      expect(cleared).toBe(1);

      const remaining = await db.syncQueue.toArray();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].status).toBe('pending');
    });
  });
});
