/**
 * Tests for date-ranges utilities
 * Story 5.1: Export Page & Period Selection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getThisMonth,
  getLastMonth,
  getThisQuarter,
  getLastQuarter,
  getThisYear,
  getExportPresets,
} from './date-ranges';

describe('date-ranges utilities', () => {
  beforeEach(() => {
    // Mock current date to 2026-01-26 for predictable tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-26T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getThisMonth', () => {
    it('returns first and last day of January 2026', () => {
      const result = getThisMonth();
      expect(result.start).toBe('2026-01-01');
      expect(result.end).toBe('2026-01-31');
    });

    it('handles February correctly', () => {
      vi.setSystemTime(new Date('2026-02-15T12:00:00.000Z'));
      const result = getThisMonth();
      expect(result.start).toBe('2026-02-01');
      expect(result.end).toBe('2026-02-28'); // Non-leap year
    });

    it('handles leap year February', () => {
      vi.setSystemTime(new Date('2024-02-15T12:00:00.000Z'));
      const result = getThisMonth();
      expect(result.start).toBe('2024-02-01');
      expect(result.end).toBe('2024-02-29'); // Leap year
    });
  });

  describe('getLastMonth', () => {
    it('returns December 2025 when current month is January 2026', () => {
      const result = getLastMonth();
      expect(result.start).toBe('2025-12-01');
      expect(result.end).toBe('2025-12-31');
    });

    it('returns previous month when not January', () => {
      vi.setSystemTime(new Date('2026-05-15T12:00:00.000Z'));
      const result = getLastMonth();
      expect(result.start).toBe('2026-04-01');
      expect(result.end).toBe('2026-04-30');
    });
  });

  describe('getThisQuarter', () => {
    it('returns Q1 2026 (Jan-Mar) when in January', () => {
      const result = getThisQuarter();
      expect(result.start).toBe('2026-01-01');
      expect(result.end).toBe('2026-03-31');
    });

    it('returns Q2 when in April', () => {
      vi.setSystemTime(new Date('2026-05-15T12:00:00.000Z'));
      const result = getThisQuarter();
      expect(result.start).toBe('2026-04-01');
      expect(result.end).toBe('2026-06-30');
    });

    it('returns Q4 when in December', () => {
      vi.setSystemTime(new Date('2026-12-01T12:00:00.000Z'));
      const result = getThisQuarter();
      expect(result.start).toBe('2026-10-01');
      expect(result.end).toBe('2026-12-31');
    });
  });

  describe('getLastQuarter', () => {
    it('returns Q4 2025 when current quarter is Q1 2026', () => {
      const result = getLastQuarter();
      expect(result.start).toBe('2025-10-01');
      expect(result.end).toBe('2025-12-31');
    });

    it('returns Q1 when current quarter is Q2', () => {
      vi.setSystemTime(new Date('2026-05-15T12:00:00.000Z'));
      const result = getLastQuarter();
      expect(result.start).toBe('2026-01-01');
      expect(result.end).toBe('2026-03-31');
    });
  });

  describe('getThisYear', () => {
    it('returns full year 2026', () => {
      const result = getThisYear();
      expect(result.start).toBe('2026-01-01');
      expect(result.end).toBe('2026-12-31');
    });
  });

  describe('getExportPresets', () => {
    it('returns all 5 presets', () => {
      const presets = getExportPresets();
      expect(presets).toHaveLength(5);
    });

    it('has correct preset IDs', () => {
      const presets = getExportPresets();
      const ids = presets.map((p) => p.id);
      expect(ids).toEqual([
        'this-month',
        'last-month',
        'this-quarter',
        'last-quarter',
        'this-year',
      ]);
    });

    it('has French labels', () => {
      const presets = getExportPresets();
      const labels = presets.map((p) => p.label);
      expect(labels).toEqual([
        'Ce mois',
        'Mois dernier',
        'Ce trimestre',
        'Trim. dernier',
        'Cette année',
      ]);
    });

    it('getRange functions return valid date ranges', () => {
      const presets = getExportPresets();
      presets.forEach((preset) => {
        const range = preset.getRange();
        expect(range).toHaveProperty('start');
        expect(range).toHaveProperty('end');
        expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(range.start <= range.end).toBe(true);
      });
    });
  });
});
