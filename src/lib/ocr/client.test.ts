/**
 * Unit tests for OCR client
 * Story 3.3: OCR Processing (Claude Haiku 4.5 API)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processOcr, isOcrError } from './client';
import type { OcrResponse } from './types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OCR Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('processOcr', () => {
    const createMockBlob = (size = 100) => {
      return new Blob(['x'.repeat(size)], { type: 'image/webp' });
    };

    it('should send image to OCR API and return result', async () => {
      vi.useRealTimers(); // Use real timers for this test

      const mockResult: OcrResponse = {
        success: true,
        data: {
          type: 'STATISTIQUES',
          impressionDate: '2026-01-18',
          lastResetDate: '2026-01-15',
          resetNumber: 42,
          ticketNumber: 123,
          discountValue: 500,
          cancelValue: 250,
          cancelNumber: 2,
          payments: [
            { mode: 'CB', value: 3500 },
            { mode: 'ESPECES', value: 750 },
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
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const blob = createMockBlob();
      const result = await processOcr(blob);

      expect(mockFetch).toHaveBeenCalledWith('/api/ocr', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));

      expect(result.type).toBe('STATISTIQUES');
      expect(result.impressionDate).toBe('2026-01-18');
      expect(result.total).toBe(4250);
      expect(result.ticketNumber).toBe(123);
      expect(result.payments).toHaveLength(2);

      vi.useFakeTimers(); // Restore fake timers
    });

    it('should throw error for empty blob', async () => {
      const emptyBlob = new Blob([], { type: 'image/webp' });

      await expect(processOcr(emptyBlob)).rejects.toMatchObject({
        type: 'invalid_image',
        message: expect.stringContaining('invalide'),
      });
    });

    it('should throw error for oversized blob', async () => {
      // Create a blob larger than 20MB
      const largeBlob = new Blob(['x'.repeat(21 * 1024 * 1024)], {
        type: 'image/webp',
      });

      await expect(processOcr(largeBlob)).rejects.toMatchObject({
        type: 'invalid_image',
        message: expect.stringContaining('20MB'),
      });
    });

    it('should handle network errors', async () => {
      vi.useRealTimers();

      // Mock fetch that throws TypeError (network error)
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      const blob = createMockBlob();

      try {
        await processOcr(blob);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toMatchObject({
          type: 'network_error',
        });
      }

      vi.useFakeTimers();
    });

    it('should throw error for 429 rate limit response', async () => {
      vi.useRealTimers(); // Use real timers for this test

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const blob = createMockBlob();

      try {
        await processOcr(blob);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toMatchObject({
          type: 'api_error',
          message: expect.stringContaining('Trop de requêtes'),
        });
      }

      vi.useFakeTimers(); // Restore fake timers
    });

    it('should throw error for 413 payload too large response', async () => {
      vi.useRealTimers(); // Use real timers for this test

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
      });

      const blob = createMockBlob();

      try {
        await processOcr(blob);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toMatchObject({
          type: 'invalid_image',
          message: expect.stringContaining('volumineuse'),
        });
      }

      vi.useFakeTimers(); // Restore fake timers
    });

    it('should throw error when API returns success: false', async () => {
      vi.useRealTimers(); // Use real timers for this test

      const mockResult: OcrResponse = {
        success: false,
        error: 'Test error message',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const blob = createMockBlob();

      try {
        await processOcr(blob);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toMatchObject({
          type: 'api_error',
          message: 'Test error message',
        });
      }

      vi.useFakeTimers(); // Restore fake timers
    });
  });

  describe('isOcrError', () => {
    it('should return true for valid OcrError object', () => {
      const error = {
        type: 'api_error',
        message: 'Test error',
      };

      expect(isOcrError(error)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isOcrError(null)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isOcrError('string')).toBe(false);
      expect(isOcrError(123)).toBe(false);
    });

    it('should return false for object without type', () => {
      expect(isOcrError({ message: 'test' })).toBe(false);
    });

    it('should return false for object without message', () => {
      expect(isOcrError({ type: 'api_error' })).toBe(false);
    });

    it('should return false for Error instance', () => {
      const error = new Error('test');
      expect(isOcrError(error)).toBe(false);
    });
  });
});
