/**
 * Tests for useSalesByPeriod hook
 * Story 6.2: Sales by Period
 *
 * Follows TDD pattern established in Story 6.1:
 * - Pure functions tested directly (no mocking)
 * - Hook integration tests mock useLiveQuery
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useSalesByPeriod,
  calculateTrend,
  filterTicketsForPeriod,
  aggregatePeriodStats,
  computeWeeklyBreakdown,
  computeMonthlyBreakdown,
  computeQuarterlyBreakdown,
} from './useSalesByPeriod';

// Mock date-ranges
vi.mock('@/lib/utils/date-ranges', () => ({
  getThisWeek: vi.fn(() => ({ start: '2026-01-26', end: '2026-02-01' })),
  getLastWeek: vi.fn(() => ({ start: '2026-01-19', end: '2026-01-25' })),
  getThisMonth: vi.fn(() => ({ start: '2026-01-01', end: '2026-01-31' })),
  getLastMonth: vi.fn(() => ({ start: '2025-12-01', end: '2025-12-31' })),
  getThisQuarter: vi.fn(() => ({ start: '2026-01-01', end: '2026-03-31' })),
  getLastQuarter: vi.fn(() => ({ start: '2025-10-01', end: '2025-12-31' })),
}));

// Mock useLiveQuery
const mockUseLiveQuery = vi.fn();
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (...args: unknown[]) => mockUseLiveQuery(...args),
}));

describe('useSalesByPeriod', () => {
  // ============================================================
  // PURE FUNCTION TESTS (no mocking needed)
  // ============================================================

  describe('calculateTrend', () => {
    it('returns 0 when both values are 0', () => {
      expect(calculateTrend(0, 0)).toBe(0);
    });

    it('returns 100 when previous is 0 and current is positive', () => {
      expect(calculateTrend(1000, 0)).toBe(100);
    });

    it('returns positive percentage for increase', () => {
      expect(calculateTrend(115, 100)).toBe(15);
    });

    it('returns negative percentage for decrease', () => {
      expect(calculateTrend(85, 100)).toBe(-15);
    });

    it('rounds percentage to nearest integer', () => {
      expect(calculateTrend(133, 100)).toBe(33);
      expect(calculateTrend(134, 100)).toBe(34);
    });

    it('handles large increases correctly', () => {
      expect(calculateTrend(300, 100)).toBe(200);
    });

    it('handles small decreases correctly', () => {
      expect(calculateTrend(99, 100)).toBe(-1);
    });
  });

  describe('filterTicketsForPeriod', () => {
    const start = '2026-01-01';
    const end = '2026-01-31';

    it('returns true for validated ticket within date range', () => {
      const ticket = { impressionDate: '2026-01-15', status: 'validated' };
      expect(filterTicketsForPeriod(ticket, start, end)).toBe(true);
    });

    it('returns false for draft ticket', () => {
      const ticket = { impressionDate: '2026-01-15', status: 'draft' };
      expect(filterTicketsForPeriod(ticket, start, end)).toBe(false);
    });

    it('returns false for cancelled ticket', () => {
      const ticket = { impressionDate: '2026-01-15', status: 'cancelled' };
      expect(filterTicketsForPeriod(ticket, start, end)).toBe(false);
    });

    it('returns false for ticket before date range', () => {
      const ticket = { impressionDate: '2025-12-31', status: 'validated' };
      expect(filterTicketsForPeriod(ticket, start, end)).toBe(false);
    });

    it('returns false for ticket after date range', () => {
      const ticket = { impressionDate: '2026-02-01', status: 'validated' };
      expect(filterTicketsForPeriod(ticket, start, end)).toBe(false);
    });

    it('returns true for ticket on start date boundary', () => {
      const ticket = { impressionDate: '2026-01-01', status: 'validated' };
      expect(filterTicketsForPeriod(ticket, start, end)).toBe(true);
    });

    it('returns true for ticket on end date boundary', () => {
      const ticket = { impressionDate: '2026-01-31', status: 'validated' };
      expect(filterTicketsForPeriod(ticket, start, end)).toBe(true);
    });

    it('returns false for null impressionDate', () => {
      const ticket = { impressionDate: null, status: 'validated' };
      expect(filterTicketsForPeriod(ticket, start, end)).toBe(false);
    });

    it('returns false for undefined impressionDate', () => {
      const ticket = { status: 'validated' } as { impressionDate?: string; status: string };
      expect(filterTicketsForPeriod(ticket, start, end)).toBe(false);
    });

    it('handles impressionDate with time component', () => {
      const ticket = { impressionDate: '2026-01-15T14:30:00.000Z', status: 'validated' };
      expect(filterTicketsForPeriod(ticket, start, end)).toBe(true);
    });
  });

  describe('aggregatePeriodStats', () => {
    it('returns zeros for empty array', () => {
      expect(aggregatePeriodStats([])).toEqual({ count: 0, revenue: 0 });
    });

    it('counts tickets correctly', () => {
      const tickets = [{ total: 1000 }, { total: 2000 }, { total: 500 }];
      expect(aggregatePeriodStats(tickets).count).toBe(3);
    });

    it('sums revenue correctly', () => {
      const tickets = [{ total: 1000 }, { total: 2000 }, { total: 500 }];
      expect(aggregatePeriodStats(tickets).revenue).toBe(3500);
    });

    it('handles null total as 0', () => {
      const tickets = [{ total: 1000 }, { total: null }, { total: 500 }];
      expect(aggregatePeriodStats(tickets).revenue).toBe(1500);
    });

    it('handles undefined total as 0', () => {
      const tickets = [{ total: 1000 }, {}, { total: 500 }] as { total?: number | null }[];
      expect(aggregatePeriodStats(tickets).revenue).toBe(1500);
    });

    it('handles single ticket', () => {
      const tickets = [{ total: 12345 }];
      expect(aggregatePeriodStats(tickets)).toEqual({ count: 1, revenue: 12345 });
    });
  });

  describe('computeWeeklyBreakdown', () => {
    it('returns 7 days breakdown with French day names', () => {
      const tickets: { impressionDate: string; status: string; total: number }[] = [];
      const breakdown = computeWeeklyBreakdown(tickets, '2026-01-26');

      expect(breakdown).toHaveLength(7);
      expect(breakdown[0].label).toBe('Lundi');
      expect(breakdown[6].label).toBe('Dimanche');
    });

    it('aggregates tickets by day', () => {
      const tickets = [
        { impressionDate: '2026-01-26', status: 'validated', total: 1000 },
        { impressionDate: '2026-01-26', status: 'validated', total: 2000 },
        { impressionDate: '2026-01-27', status: 'validated', total: 500 },
      ];
      const breakdown = computeWeeklyBreakdown(tickets, '2026-01-26');

      expect(breakdown[0].ticketCount).toBe(2);
      expect(breakdown[0].revenue).toBe(3000);
      expect(breakdown[1].ticketCount).toBe(1);
      expect(breakdown[1].revenue).toBe(500);
    });

    it('excludes non-validated tickets', () => {
      const tickets = [
        { impressionDate: '2026-01-26', status: 'validated', total: 1000 },
        { impressionDate: '2026-01-26', status: 'draft', total: 2000 },
        { impressionDate: '2026-01-26', status: 'cancelled', total: 3000 },
      ];
      const breakdown = computeWeeklyBreakdown(tickets, '2026-01-26');

      expect(breakdown[0].ticketCount).toBe(1);
      expect(breakdown[0].revenue).toBe(1000);
    });

    it('returns zeros for days with no tickets', () => {
      const tickets: { impressionDate: string; status: string; total: number }[] = [];
      const breakdown = computeWeeklyBreakdown(tickets, '2026-01-26');

      expect(breakdown[3].ticketCount).toBe(0);
      expect(breakdown[3].revenue).toBe(0);
    });
  });

  describe('computeMonthlyBreakdown', () => {
    it('returns weekly breakdown with week labels', () => {
      const tickets: { impressionDate: string; status: string; total: number }[] = [];
      const breakdown = computeMonthlyBreakdown(tickets, '2026-01-01', '2026-01-31');

      expect(breakdown.length).toBeGreaterThan(0);
      expect(breakdown[0].label).toBe('Semaine 1');
    });

    it('aggregates tickets by week', () => {
      const tickets = [
        { impressionDate: '2026-01-02', status: 'validated', total: 1000 },
        { impressionDate: '2026-01-05', status: 'validated', total: 2000 },
        { impressionDate: '2026-01-10', status: 'validated', total: 500 },
      ];
      const breakdown = computeMonthlyBreakdown(tickets, '2026-01-01', '2026-01-31');

      // First week contains Jan 2 and 5
      expect(breakdown[0].ticketCount).toBe(2);
      expect(breakdown[0].revenue).toBe(3000);
    });

    it('excludes non-validated tickets', () => {
      const tickets = [
        { impressionDate: '2026-01-02', status: 'validated', total: 1000 },
        { impressionDate: '2026-01-02', status: 'draft', total: 5000 },
      ];
      const breakdown = computeMonthlyBreakdown(tickets, '2026-01-01', '2026-01-31');

      expect(breakdown[0].ticketCount).toBe(1);
      expect(breakdown[0].revenue).toBe(1000);
    });
  });

  describe('computeQuarterlyBreakdown', () => {
    it('returns 3 months with French month names', () => {
      const tickets: { impressionDate: string; status: string; total: number }[] = [];
      const breakdown = computeQuarterlyBreakdown(tickets, '2026-01-01');

      expect(breakdown).toHaveLength(3);
      expect(breakdown[0].label).toBe('Janvier');
      expect(breakdown[1].label).toBe('Février');
      expect(breakdown[2].label).toBe('Mars');
    });

    it('aggregates tickets by month', () => {
      const tickets = [
        { impressionDate: '2026-01-15', status: 'validated', total: 1000 },
        { impressionDate: '2026-01-20', status: 'validated', total: 2000 },
        { impressionDate: '2026-02-10', status: 'validated', total: 500 },
      ];
      const breakdown = computeQuarterlyBreakdown(tickets, '2026-01-01');

      expect(breakdown[0].ticketCount).toBe(2);
      expect(breakdown[0].revenue).toBe(3000);
      expect(breakdown[1].ticketCount).toBe(1);
      expect(breakdown[1].revenue).toBe(500);
      expect(breakdown[2].ticketCount).toBe(0);
    });

    it('handles Q2 with correct month names', () => {
      const tickets: { impressionDate: string; status: string; total: number }[] = [];
      const breakdown = computeQuarterlyBreakdown(tickets, '2026-04-01');

      expect(breakdown[0].label).toBe('Avril');
      expect(breakdown[1].label).toBe('Mai');
      expect(breakdown[2].label).toBe('Juin');
    });

    it('excludes non-validated tickets', () => {
      const tickets = [
        { impressionDate: '2026-01-15', status: 'validated', total: 1000 },
        { impressionDate: '2026-01-15', status: 'cancelled', total: 5000 },
      ];
      const breakdown = computeQuarterlyBreakdown(tickets, '2026-01-01');

      expect(breakdown[0].ticketCount).toBe(1);
      expect(breakdown[0].revenue).toBe(1000);
    });
  });

  // ============================================================
  // HOOK INTEGRATION TESTS (mock useLiveQuery)
  // ============================================================

  describe('useSalesByPeriod hook', () => {
    beforeEach(() => {
      mockUseLiveQuery.mockReset();
    });

    it('returns loading state initially', () => {
      mockUseLiveQuery.mockReturnValue(undefined);

      const { result } = renderHook(() => useSalesByPeriod('user-123'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.thisWeek.ticketCount).toBe(0);
      expect(result.current.thisMonth.ticketCount).toBe(0);
      expect(result.current.thisQuarter.ticketCount).toBe(0);
    });

    it('returns zeros for empty userId', () => {
      mockUseLiveQuery.mockReturnValue({
        thisWeek: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
        thisMonth: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
        thisQuarter: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
      });

      const { result } = renderHook(() => useSalesByPeriod(''));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.thisWeek.ticketCount).toBe(0);
    });

    it('returns period stats when data is loaded', () => {
      mockUseLiveQuery.mockReturnValue({
        thisWeek: { ticketCount: 5, revenue: 25000, previousRevenue: 20000, trend: 25 },
        thisMonth: { ticketCount: 15, revenue: 75000, previousRevenue: 65000, trend: 15 },
        thisQuarter: { ticketCount: 42, revenue: 210000, previousRevenue: 220000, trend: -5 },
      });

      const { result } = renderHook(() => useSalesByPeriod('user-123'));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.thisWeek.ticketCount).toBe(5);
      expect(result.current.thisWeek.revenue).toBe(25000);
      expect(result.current.thisWeek.trend).toBe(25);
      expect(result.current.thisMonth.ticketCount).toBe(15);
      expect(result.current.thisQuarter.trend).toBe(-5);
    });

    it('handles negative trends correctly', () => {
      mockUseLiveQuery.mockReturnValue({
        thisWeek: { ticketCount: 3, revenue: 10000, previousRevenue: 20000, trend: -50 },
        thisMonth: { ticketCount: 8, revenue: 40000, previousRevenue: 50000, trend: -20 },
        thisQuarter: { ticketCount: 20, revenue: 100000, previousRevenue: 150000, trend: -33 },
      });

      const { result } = renderHook(() => useSalesByPeriod('user-123'));

      expect(result.current.thisWeek.trend).toBe(-50);
      expect(result.current.thisMonth.trend).toBe(-20);
      expect(result.current.thisQuarter.trend).toBe(-33);
    });
  });
});
