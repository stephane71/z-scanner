/**
 * Unit tests for useTickets hooks
 * Uses fake-indexeddb for in-memory IndexedDB testing
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import {
  addTicket,
  getTicket,
  validateTicket,
  cancelTicket,
} from './useTickets';
import type { Ticket } from '@/types';

describe('useTickets CRUD Operations', () => {
  const createTestTicket = (overrides = {}): Omit<Ticket, 'id'> => ({
    dataHash: 'sha256-test-hash-123',
    type: 'STATISTIQUES',
    impressionDate: '2026-01-17',
    lastResetDate: '2026-01-15',
    resetNumber: 42,
    ticketNumber: 1,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: [{ mode: 'CB', value: 1250 }],
    total: 1250,
    userId: 'user-123',
    status: 'draft',
    createdAt: new Date().toISOString(),
    clientTimestamp: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(async () => {
    await db.tickets.clear();
  });

  afterEach(async () => {
    await db.tickets.clear();
  });

  describe('addTicket', () => {
    it('should add a ticket and return its id', async () => {
      const ticket = createTestTicket();
      const id = await addTicket(ticket);

      expect(id).toBeGreaterThan(0);
      expect(typeof id).toBe('number');
    });

    it('should store all ticket fields correctly', async () => {
      const ticket = createTestTicket({
        total: 9999,
        payments: [{ mode: 'ESPECES', value: 9999 }],
        marketId: 42,
      });
      const id = await addTicket(ticket);

      const stored = await db.tickets.get(id);

      expect(stored?.total).toBe(9999);
      expect(stored?.payments[0].mode).toBe('ESPECES');
      expect(stored?.marketId).toBe(42);
    });
  });

  describe('getTicket', () => {
    it('should retrieve a ticket by id', async () => {
      const ticket = createTestTicket();
      const id = await addTicket(ticket);

      const retrieved = await getTicket(id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(id);
      expect(retrieved?.ticketNumber).toBe(1);
    });

    it('should return undefined for non-existent id', async () => {
      const retrieved = await getTicket(99999);

      expect(retrieved).toBeUndefined();
    });
  });

  describe('validateTicket', () => {
    it('should change status from draft to validated', async () => {
      const ticket = createTestTicket({ status: 'draft' });
      const id = await addTicket(ticket);

      await validateTicket(id);

      const validated = await getTicket(id);
      expect(validated?.status).toBe('validated');
    });

    it('should set validatedAt timestamp', async () => {
      const ticket = createTestTicket({ status: 'draft' });
      const id = await addTicket(ticket);

      await validateTicket(id);

      const validated = await getTicket(id);
      expect(validated?.validatedAt).toBeDefined();
      expect(new Date(validated!.validatedAt!).getTime()).toBeGreaterThan(0);
    });

    it('should throw error for non-existent ticket', async () => {
      await expect(validateTicket(99999)).rejects.toThrow('Ticket 99999 not found');
    });

    it('should throw error for already validated ticket', async () => {
      const ticket = createTestTicket({ status: 'validated' });
      const id = await addTicket(ticket);

      await expect(validateTicket(id)).rejects.toThrow(
        'Cannot validate ticket with status: validated'
      );
    });

    it('should throw error for cancelled ticket', async () => {
      const ticket = createTestTicket({ status: 'cancelled' });
      const id = await addTicket(ticket);

      await expect(validateTicket(id)).rejects.toThrow(
        'Cannot validate ticket with status: cancelled'
      );
    });
  });

  describe('cancelTicket', () => {
    it('should change status to cancelled', async () => {
      const ticket = createTestTicket({ status: 'draft' });
      const id = await addTicket(ticket);

      await cancelTicket(id, 'Test cancellation reason');

      const cancelled = await getTicket(id);
      expect(cancelled?.status).toBe('cancelled');
    });

    it('should set cancelledAt timestamp', async () => {
      const ticket = createTestTicket({ status: 'draft' });
      const id = await addTicket(ticket);

      await cancelTicket(id, 'Test reason');

      const cancelled = await getTicket(id);
      expect(cancelled?.cancelledAt).toBeDefined();
    });

    it('should store cancellation reason (NF525 compliance)', async () => {
      const reason = 'Client requested refund due to damaged goods';
      const ticket = createTestTicket({ status: 'draft' });
      const id = await addTicket(ticket);

      await cancelTicket(id, reason);

      const cancelled = await getTicket(id);
      expect(cancelled?.cancellationReason).toBe(reason);
    });

    it('should allow cancelling validated ticket', async () => {
      const ticket = createTestTicket({ status: 'validated' });
      const id = await addTicket(ticket);

      await cancelTicket(id, 'Post-validation cancellation');

      const cancelled = await getTicket(id);
      expect(cancelled?.status).toBe('cancelled');
    });

    it('should throw error for empty reason (NF525 compliance)', async () => {
      const ticket = createTestTicket({ status: 'draft' });
      const id = await addTicket(ticket);

      await expect(cancelTicket(id, '')).rejects.toThrow(
        'Cancellation reason is required (NF525 compliance)'
      );
    });

    it('should throw error for whitespace-only reason', async () => {
      const ticket = createTestTicket({ status: 'draft' });
      const id = await addTicket(ticket);

      await expect(cancelTicket(id, '   ')).rejects.toThrow(
        'Cancellation reason is required (NF525 compliance)'
      );
    });

    it('should throw error for already cancelled ticket', async () => {
      const ticket = createTestTicket({ status: 'cancelled' });
      const id = await addTicket(ticket);

      await expect(cancelTicket(id, 'Double cancel')).rejects.toThrow(
        'Ticket is already cancelled'
      );
    });

    it('should throw error for non-existent ticket', async () => {
      await expect(cancelTicket(99999, 'Reason')).rejects.toThrow(
        'Ticket 99999 not found'
      );
    });
  });

  describe('NF525 Compliance', () => {
    it('should store data as integer centimes', async () => {
      const ticket = createTestTicket({ total: 12345 }); // 123,45€
      const id = await addTicket(ticket);

      const stored = await getTicket(id);

      expect(stored?.total).toBe(12345);
      expect(Number.isInteger(stored?.total)).toBe(true);
    });

    it('should store dates in ISO 8601 format', async () => {
      const ticket = createTestTicket();
      const id = await addTicket(ticket);

      const stored = await getTicket(id);

      // Verify ISO 8601 format
      expect(stored?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(stored?.clientTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should preserve dataHash for integrity verification', async () => {
      const hash = 'sha256-abc123def456';
      const ticket = createTestTicket({ dataHash: hash });
      const id = await addTicket(ticket);

      const stored = await getTicket(id);

      expect(stored?.dataHash).toBe(hash);
    });
  });
});
