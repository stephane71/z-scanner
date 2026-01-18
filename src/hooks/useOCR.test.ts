/**
 * Unit tests for useOCR hook
 * Story 3.3: OCR Processing (Claude Haiku 4.5 API)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock modules
const mockProcessOcr = vi.fn();
const mockQueueForOcr = vi.fn();
const mockIsOcrError = vi.fn();

vi.mock('@/lib/ocr', () => ({
  processOcr: (...args: unknown[]) => mockProcessOcr(...args),
  queueForOcr: (...args: unknown[]) => mockQueueForOcr(...args),
  isOcrError: (err: unknown) => mockIsOcrError(err),
}));

const mockDbTicketsUpdate = vi.fn();
vi.mock('@/lib/db', () => ({
  db: {
    tickets: {
      update: (id: number, data: unknown) => mockDbTicketsUpdate(id, data),
    },
  },
}));

import { useOCR } from './useOCR';

describe('useOCR', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDbTicketsUpdate.mockResolvedValue(undefined);
    mockQueueForOcr.mockResolvedValue(undefined);
    mockIsOcrError.mockImplementation(
      (err: unknown) =>
        typeof err === 'object' && err !== null && 'type' in err && 'message' in err
    );

    // Mock navigator.onLine as true by default
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useOCR());

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.status).toBeNull();
      expect(typeof result.current.processImage).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('processImage - online', () => {
    // Helper to create Z-ticket mock OCR result
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

    it('should process image and return result when online', async () => {
      const mockResult = createMockOcrResult();

      mockProcessOcr.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useOCR());
      const blob = new Blob(['test'], { type: 'image/webp' });

      let ocrResult;
      await act(async () => {
        ocrResult = await result.current.processImage(1, blob);
      });

      expect(ocrResult).toEqual(mockResult);
      expect(result.current.status).toBe('ocr_complete');
      expect(result.current.error).toBeNull();
      expect(mockDbTicketsUpdate).toHaveBeenCalled();
    });

    it('should call processOcr when online', async () => {
      mockProcessOcr.mockResolvedValueOnce(createMockOcrResult());

      const { result } = renderHook(() => useOCR());
      const blob = new Blob(['test'], { type: 'image/webp' });

      await act(async () => {
        await result.current.processImage(1, blob);
      });

      expect(mockProcessOcr).toHaveBeenCalledWith(blob);
    });
  });

  describe('processImage - offline', () => {
    it('should queue for OCR when offline', async () => {
      Object.defineProperty(global, 'navigator', {
        value: { onLine: false },
        writable: true,
      });

      const { result } = renderHook(() => useOCR());
      const blob = new Blob(['test'], { type: 'image/webp' });

      let ocrResult;
      await act(async () => {
        ocrResult = await result.current.processImage(1, blob);
      });

      expect(ocrResult).toBeNull();
      expect(result.current.status).toBe('pending_ocr');
      expect(mockQueueForOcr).toHaveBeenCalledWith(1);
      expect(mockProcessOcr).not.toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('should be a function', () => {
      const { result } = renderHook(() => useOCR());
      expect(typeof result.current.clearError).toBe('function');
    });

    it('should reset error to null when called', () => {
      const { result } = renderHook(() => useOCR());

      // Initially error is null
      expect(result.current.error).toBeNull();

      // Call clearError (should not throw)
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
