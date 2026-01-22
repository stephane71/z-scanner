/**
 * Tests for Retry Logic - Story 3.9
 * Exponential backoff utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateBackoff,
  shouldRetry,
  getBackoffDelays,
  scheduleRetry,
  cancelRetry,
  cancelAllRetries,
  MAX_RETRIES,
  BASE_DELAY,
} from './retry';

describe('Retry Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cancelAllRetries();
  });

  describe('calculateBackoff', () => {
    it('returns 1000ms for retry 0', () => {
      expect(calculateBackoff(0)).toBe(1000);
    });

    it('returns 2000ms for retry 1', () => {
      expect(calculateBackoff(1)).toBe(2000);
    });

    it('returns 4000ms for retry 2', () => {
      expect(calculateBackoff(2)).toBe(4000);
    });

    it('returns 8000ms for retry 3', () => {
      expect(calculateBackoff(3)).toBe(8000);
    });

    it('returns 16000ms for retry 4', () => {
      expect(calculateBackoff(4)).toBe(16000);
    });

    it('follows exponential formula: BASE_DELAY * 2^retries', () => {
      for (let i = 0; i < 5; i++) {
        expect(calculateBackoff(i)).toBe(BASE_DELAY * Math.pow(2, i));
      }
    });
  });

  describe('shouldRetry', () => {
    it('returns true for retries 0-4', () => {
      expect(shouldRetry(0)).toBe(true);
      expect(shouldRetry(1)).toBe(true);
      expect(shouldRetry(2)).toBe(true);
      expect(shouldRetry(3)).toBe(true);
      expect(shouldRetry(4)).toBe(true);
    });

    it('returns false for retry 5 (max retries reached)', () => {
      expect(shouldRetry(5)).toBe(false);
    });

    it('returns false for retries > MAX_RETRIES', () => {
      expect(shouldRetry(6)).toBe(false);
      expect(shouldRetry(10)).toBe(false);
    });
  });

  describe('getBackoffDelays', () => {
    it('returns array of all backoff delays', () => {
      const delays = getBackoffDelays();
      expect(delays).toEqual([1000, 2000, 4000, 8000, 16000]);
    });

    it('has length equal to MAX_RETRIES', () => {
      const delays = getBackoffDelays();
      expect(delays.length).toBe(MAX_RETRIES);
    });
  });

  describe('scheduleRetry', () => {
    it('calls callback after calculated delay', () => {
      const callback = vi.fn();

      scheduleRetry(1, 0, callback);

      // Before delay
      expect(callback).not.toHaveBeenCalled();

      // After delay
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('uses correct delay based on retry count', () => {
      const callback = vi.fn();

      scheduleRetry(1, 2, callback); // Should wait 4000ms

      vi.advanceTimersByTime(3999);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('returns cleanup function that cancels retry', () => {
      const callback = vi.fn();

      const cleanup = scheduleRetry(1, 0, callback);
      cleanup();

      vi.advanceTimersByTime(2000);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('cancelRetry', () => {
    it('cancels scheduled retry for specific id', () => {
      const callback = vi.fn();

      scheduleRetry(1, 0, callback);
      cancelRetry(1);

      vi.advanceTimersByTime(2000);
      expect(callback).not.toHaveBeenCalled();
    });

    it('does not affect other scheduled retries', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      scheduleRetry(1, 0, callback1);
      scheduleRetry(2, 0, callback2);

      cancelRetry(1);

      vi.advanceTimersByTime(1000);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancelAllRetries', () => {
    it('cancels all scheduled retries', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      scheduleRetry(1, 0, callback1);
      scheduleRetry(2, 1, callback2);
      scheduleRetry(3, 2, callback3);

      cancelAllRetries();

      vi.advanceTimersByTime(10000);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).not.toHaveBeenCalled();
    });
  });
});
