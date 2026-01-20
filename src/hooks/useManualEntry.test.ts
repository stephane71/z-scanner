/**
 * Unit tests for useManualEntry hook
 * Story 3.5: Manual Entry Fallback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useManualEntry } from './useManualEntry';

// Mock Dexie
const mockTicketsAdd = vi.fn();
vi.mock('@/lib/db', () => ({
  db: {
    tickets: {
      add: (data: unknown) => mockTicketsAdd(data),
    },
  },
}));

describe('useManualEntry', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockTicketsAdd.mockResolvedValue(42); // ticket ID
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize form with default values', () => {
      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      const formValues = result.current.form.getValues();

      expect(formValues.type).toBe('STATISTIQUES');
      expect(formValues.resetNumber).toBe(0);
      expect(formValues.ticketNumber).toBe(1);
      expect(formValues.discountValue).toBe(0);
      expect(formValues.cancelValue).toBe(0);
      expect(formValues.cancelNumber).toBe(0);
      expect(formValues.total).toBe(0);
      expect(formValues.payments).toHaveLength(1);
      expect(formValues.payments[0].mode).toBe('CB');
      expect(formValues.payments[0].value).toBe(0);
    });

    it('should set impressionDate to today', () => {
      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      const today = new Date().toISOString().split('T')[0];
      const formValues = result.current.form.getValues();

      expect(formValues.impressionDate).toBe(today);
      expect(formValues.lastResetDate).toBe(today);
    });

    it('should not be dirty initially', () => {
      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      expect(result.current.isDirty).toBe(false);
    });

    it('should not be saving initially', () => {
      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      expect(result.current.isSaving).toBe(false);
    });

    it('should have no error initially', () => {
      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      expect(result.current.saveError).toBeNull();
    });
  });

  describe('createTicket', () => {
    it('should create ticket in Dexie', async () => {
      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      // Fill in required fields for validation
      await act(async () => {
        result.current.form.setValue('ticketNumber', 1);
        result.current.form.setValue('total', 1000);
        result.current.form.setValue('payments', [{ mode: 'CB', value: 1000 }]);
      });

      let ticketId: number | undefined;
      await act(async () => {
        ticketId = await result.current.createTicket();
      });

      expect(ticketId).toBe(42);
      expect(mockTicketsAdd).toHaveBeenCalledTimes(1);
    });

    it('should create ticket with manual_entry ocrStatus', async () => {
      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      await act(async () => {
        await result.current.createTicket();
      });

      const ticketData = mockTicketsAdd.mock.calls[0][0];
      expect(ticketData.ocrStatus).toBe('manual_entry');
    });

    it('should create ticket with draft status', async () => {
      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      await act(async () => {
        await result.current.createTicket();
      });

      const ticketData = mockTicketsAdd.mock.calls[0][0];
      expect(ticketData.status).toBe('draft');
    });

    it('should include dataHash for NF525 compliance', async () => {
      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      await act(async () => {
        await result.current.createTicket();
      });

      const ticketData = mockTicketsAdd.mock.calls[0][0];
      expect(ticketData.dataHash).toBeDefined();
      expect(ticketData.dataHash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should throw error when userId is null', async () => {
      const { result } = renderHook(() => useManualEntry({ userId: null }));

      await expect(async () => {
        await act(async () => {
          await result.current.createTicket();
        });
      }).rejects.toThrow('Utilisateur non authentifié');
    });

    it('should set isSaving during creation', async () => {
      mockTicketsAdd.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(42), 100))
      );

      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      let createPromise: Promise<number>;
      act(() => {
        createPromise = result.current.createTicket();
      });

      // Should be saving
      expect(result.current.isSaving).toBe(true);

      await act(async () => {
        await createPromise;
      });

      // Should not be saving after completion
      expect(result.current.isSaving).toBe(false);
    });

    it('should throw error and set saveError on failure', async () => {
      mockTicketsAdd.mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      // Should throw and update saveError state
      let errorThrown = false;
      await act(async () => {
        try {
          await result.current.createTicket();
        } catch (error) {
          errorThrown = true;
          expect((error as Error).message).toBe('Database error');
        }
      });

      expect(errorThrown).toBe(true);
    });
  });

  describe('clearError', () => {
    it('should clear any error state', () => {
      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      // clearError should work even if no error exists
      act(() => {
        result.current.clearError();
      });

      expect(result.current.saveError).toBeNull();
    });
  });

  describe('form dirty state', () => {
    it('should become dirty when field is changed', async () => {
      const { result } = renderHook(() =>
        useManualEntry({ userId: mockUserId })
      );

      expect(result.current.isDirty).toBe(false);

      await act(async () => {
        result.current.form.setValue('ticketNumber', 5, { shouldDirty: true });
      });

      await waitFor(() => {
        expect(result.current.isDirty).toBe(true);
      });
    });
  });
});
