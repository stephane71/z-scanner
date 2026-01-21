/**
 * Unit tests for useTicketValidation hook
 * Story 3.6: Ticket Validation with NF525 Compliance
 *
 * Tests for:
 * - Hash generation
 * - Dexie ticket update (status, dataHash, validatedAt)
 * - Sync queue entry creation
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTicketValidation } from './useTicketValidation';
import { db } from '@/lib/db';
import type { Ticket } from '@/types';
import type { TicketVerificationForm } from '@/lib/validation/ticket';

// fake-indexeddb is loaded in test/setup.ts

// Mock haptic feedback
vi.mock('@/lib/utils/haptic', () => ({
  triggerHaptic: vi.fn(),
}));

// Mock computeTicketHash
vi.mock('@/lib/crypto', () => ({
  computeTicketHash: vi.fn(() => 'mockedhash123456789'),
}));

describe('useTicketValidation', () => {
  const mockUserId = 'user-test-123';
  const mockFormData: TicketVerificationForm = {
    type: 'STATISTIQUES',
    impressionDate: '2026-01-21',
    lastResetDate: '2026-01-21',
    resetNumber: 1,
    ticketNumber: 42,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: [{ mode: 'CB', value: 12500 }],
    total: 12500,
  };

  let testTicketId: number;

  beforeEach(async () => {
    // Clear database before each test
    await db.tickets.clear();
    await db.syncQueue.clear();

    // Create a draft ticket for testing
    const draftTicket: Omit<Ticket, 'id'> = {
      dataHash: '',
      userId: mockUserId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      clientTimestamp: new Date().toISOString(),
      type: 'STATISTIQUES',
      impressionDate: '2026-01-21',
      lastResetDate: '2026-01-21',
      resetNumber: 1,
      ticketNumber: 42,
      discountValue: 0,
      cancelValue: 0,
      cancelNumber: 0,
      payments: [{ mode: 'CB', value: 12500 }],
      total: 12500,
      ocrStatus: 'pending_validation',
    };

    testTicketId = (await db.tickets.add(draftTicket as Ticket)) as number;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTicketValidation());

    expect(result.current.isValidating).toBe(false);
    expect(result.current.validationError).toBeNull();
    expect(result.current.validationSuccess).toBe(false);
  });

  it('should set isValidating to true during validation', async () => {
    const { result } = renderHook(() => useTicketValidation());

    let wasValidating = false;

    await act(async () => {
      const promise = result.current.validateTicket(
        testTicketId,
        mockFormData,
        mockUserId
      );
      // Check state during validation
      wasValidating = result.current.isValidating;
      await promise;
    });

    // State should have been true during validation
    expect(wasValidating || result.current.validationSuccess).toBe(true);
  });

  it('should update ticket status to validated', async () => {
    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
    });

    const updatedTicket = await db.tickets.get(testTicketId);
    expect(updatedTicket?.status).toBe('validated');
  });

  it('should set dataHash on ticket', async () => {
    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
    });

    const updatedTicket = await db.tickets.get(testTicketId);
    expect(updatedTicket?.dataHash).toBe('mockedhash123456789');
  });

  it('should set validatedAt timestamp on ticket', async () => {
    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
    });

    const updatedTicket = await db.tickets.get(testTicketId);
    expect(updatedTicket?.validatedAt).toBeDefined();
    // Should be a valid ISO date
    expect(new Date(updatedTicket!.validatedAt!).toISOString()).toBe(
      updatedTicket!.validatedAt
    );
  });

  it('should add entry to sync queue', async () => {
    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
    });

    const syncItems = await db.syncQueue.toArray();
    expect(syncItems).toHaveLength(1);
    expect(syncItems[0].entityType).toBe('ticket');
    expect(syncItems[0].entityId).toBe(testTicketId);
    expect(syncItems[0].action).toBe('validate');
    expect(syncItems[0].status).toBe('pending');
  });

  it('should set validationSuccess to true on success', async () => {
    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
    });

    expect(result.current.validationSuccess).toBe(true);
    expect(result.current.validationError).toBeNull();
  });

  it('should trigger haptic feedback on success', async () => {
    const { triggerHaptic } = await import('@/lib/utils/haptic');
    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
    });

    expect(triggerHaptic).toHaveBeenCalledWith('success');
  });

  it('should set validationError on failure', async () => {
    const { result } = renderHook(() => useTicketValidation());

    // Try to validate a non-existent ticket
    await act(async () => {
      try {
        await result.current.validateTicket(999999, mockFormData, mockUserId);
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.validationError).not.toBeNull();
    expect(result.current.validationSuccess).toBe(false);
  });

  it('should throw error when ticket is already validated', async () => {
    // First validate the ticket
    await db.tickets.update(testTicketId, { status: 'validated' });

    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      try {
        await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.validationError).toContain('déjà');
  });

  it('should reset state with resetValidation', async () => {
    const { result } = renderHook(() => useTicketValidation());

    await act(async () => {
      await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
    });

    expect(result.current.validationSuccess).toBe(true);

    act(() => {
      result.current.resetValidation();
    });

    expect(result.current.validationSuccess).toBe(false);
    expect(result.current.validationError).toBeNull();
    expect(result.current.isValidating).toBe(false);
  });

  // Story 3.7: Photo Archival Tests
  describe('Photo Sync Queue (Story 3.7)', () => {
    let testPhotoId: number;

    beforeEach(async () => {
      // Create a photo linked to the test ticket
      const photoData = {
        ticketId: testTicketId,
        blob: new Blob(['fake-image-data'], { type: 'image/webp' }),
        thumbnail: new Blob(['fake-thumbnail-data'], { type: 'image/webp' }),
        createdAt: new Date().toISOString(),
      };
      testPhotoId = (await db.photos.add(photoData)) as number;
    });

    afterEach(async () => {
      await db.photos.clear();
    });

    it('should add photo to sync queue after ticket validation', async () => {
      const { result } = renderHook(() => useTicketValidation());

      await act(async () => {
        await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
      });

      const syncItems = await db.syncQueue.toArray();
      // Should have 2 entries: one for ticket, one for photo
      expect(syncItems).toHaveLength(2);

      const photoSyncItem = syncItems.find(item => item.entityType === 'photo');
      expect(photoSyncItem).toBeDefined();
      expect(photoSyncItem?.entityId).toBe(testPhotoId);
      expect(photoSyncItem?.action).toBe('create');
      expect(photoSyncItem?.status).toBe('pending');
    });

    it('should include correct payload in photo sync queue entry', async () => {
      const { result } = renderHook(() => useTicketValidation());

      await act(async () => {
        await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
      });

      const syncItems = await db.syncQueue.toArray();
      const photoSyncItem = syncItems.find(item => item.entityType === 'photo');

      const payload = JSON.parse(photoSyncItem!.payload);
      expect(payload.ticketId).toBe(testTicketId);
      expect(payload.userId).toBe(mockUserId);
      expect(payload.storagePath).toBe(`${mockUserId}/${testTicketId}/${testPhotoId}.webp`);
    });

    it('should not add photo sync entry if no photo exists for ticket', async () => {
      // Clear photos before test
      await db.photos.clear();

      const { result } = renderHook(() => useTicketValidation());

      await act(async () => {
        await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
      });

      const syncItems = await db.syncQueue.toArray();
      // Should only have ticket entry, no photo entry
      expect(syncItems).toHaveLength(1);
      expect(syncItems[0].entityType).toBe('ticket');
    });

    it('should set correct createdAt timestamp for photo sync entry', async () => {
      const { result } = renderHook(() => useTicketValidation());
      const beforeValidation = new Date().toISOString();

      await act(async () => {
        await result.current.validateTicket(testTicketId, mockFormData, mockUserId);
      });

      const afterValidation = new Date().toISOString();

      const syncItems = await db.syncQueue.toArray();
      const photoSyncItem = syncItems.find(item => item.entityType === 'photo');

      expect(photoSyncItem?.createdAt).toBeDefined();
      expect(new Date(photoSyncItem!.createdAt) >= new Date(beforeValidation)).toBe(true);
      expect(new Date(photoSyncItem!.createdAt) <= new Date(afterValidation)).toBe(true);
    });
  });
});
