/**
 * Unit tests for useVerification hook
 * Story 3.4: Verification Screen - Task 9
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useVerification } from './useVerification';
import { db } from '@/lib/db';
import type { Ticket, Photo } from '@/types';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    tickets: {
      get: vi.fn(),
      update: vi.fn(),
    },
    photos: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(),
        })),
      })),
    },
  },
}));

// Mock useLiveQuery to return direct values
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((queryFn) => {
    // Execute the query function synchronously for testing
    const result = queryFn();
    // Return the promise result or undefined
    if (result instanceof Promise) {
      return undefined; // Loading state
    }
    return result;
  }),
}));

describe('useVerification', () => {
  const mockTicket: Ticket = {
    id: 1,
    userId: 'user-123',
    dataHash: 'sha256-test-hash',
    status: 'draft',
    createdAt: '2026-01-18T10:00:00Z',
    clientTimestamp: '2026-01-18T10:00:00Z',
    type: 'STATISTIQUES',
    impressionDate: '2026-01-18',
    lastResetDate: '2026-01-15',
    resetNumber: 42,
    ticketNumber: 1,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: [{ mode: 'CB', value: 1250 }],
    total: 1250,
    ocrConfidence: {
      type: 0.95,
      impressionDate: 0.95,
      lastResetDate: 0.85,
      resetNumber: 0.90,
      ticketNumber: 0.88,
      discountValue: 0.90,
      cancelValue: 0.90,
      cancelNumber: 0.90,
      total: 0.75,
      payments: 0.60,
    },
  };

  const mockPhoto: Photo = {
    id: 1,
    ticketId: 1,
    blob: new Blob(['test'], { type: 'image/webp' }),
    thumbnail: new Blob(['thumb'], { type: 'image/webp' }),
    createdAt: '2026-01-18T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should return loading state initially', () => {
      const { result } = renderHook(() => useVerification({ ticketId: 1 }));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.ticket).toBeUndefined();
      expect(result.current.photo).toBeUndefined();
    });

    it('should return notFound for invalid ticketId', () => {
      const { result } = renderHook(() => useVerification({ ticketId: -1 }));

      expect(result.current.notFound).toBe(true);
    });

    it('should return notFound for zero ticketId', () => {
      const { result } = renderHook(() => useVerification({ ticketId: 0 }));

      expect(result.current.notFound).toBe(true);
    });
  });

  describe('Form Initialization', () => {
    it('should provide form instance', () => {
      const { result } = renderHook(() => useVerification({ ticketId: 1 }));

      expect(result.current.form).toBeDefined();
      expect(result.current.form.register).toBeDefined();
      expect(result.current.form.handleSubmit).toBeDefined();
    });

    it('should initialize form with default values', () => {
      const { result } = renderHook(() => useVerification({ ticketId: 1 }));

      const values = result.current.form.getValues();
      expect(values.type).toBe('STATISTIQUES');
      expect(values.ticketNumber).toBe(1);
      expect(values.payments).toHaveLength(1);
    });

    it('should not be dirty initially', () => {
      const { result } = renderHook(() => useVerification({ ticketId: 1 }));

      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('Saving', () => {
    it('should not be saving initially', () => {
      const { result } = renderHook(() => useVerification({ ticketId: 1 }));

      expect(result.current.isSaving).toBe(false);
    });

    it('should have no save error initially', () => {
      const { result } = renderHook(() => useVerification({ ticketId: 1 }));

      expect(result.current.saveError).toBeNull();
    });

    it('should provide updateTicket function', () => {
      const { result } = renderHook(() => useVerification({ ticketId: 1 }));

      expect(typeof result.current.updateTicket).toBe('function');
    });
  });

  describe('Confidence Scores', () => {
    it('should return null confidence when ticket not loaded', () => {
      const { result } = renderHook(() => useVerification({ ticketId: 1 }));

      expect(result.current.confidence).toBeNull();
    });
  });
});
