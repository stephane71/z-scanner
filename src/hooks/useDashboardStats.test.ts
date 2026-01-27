/**
 * Tests for useDashboardStats hook
 * Story 6.1: Activity Dashboard
 *
 * Tests cover:
 * - Returns correct counts for validated tickets in current month
 * - Handles empty data (no tickets)
 * - Filters by month and status (excludes draft/cancelled)
 * - Aggregates unique marketIds for markets visited
 * - Loading state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useDashboardStats,
  aggregateDashboardStats,
  filterTicketsForDashboard,
} from './useDashboardStats';

// Mock date-ranges to return predictable values
vi.mock('@/lib/utils/date-ranges', () => ({
  getThisMonth: vi.fn(() => ({ start: '2026-01-01', end: '2026-01-31' })),
}));

// Mock useLiveQuery
const mockUseLiveQuery = vi.fn();
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (fn: () => Promise<unknown>, deps: unknown[]) => mockUseLiveQuery(fn, deps),
}));

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hook behavior', () => {
    it('returns loading state when data is undefined', () => {
      mockUseLiveQuery.mockReturnValue(undefined);

      const { result } = renderHook(() => useDashboardStats('user-123'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.ticketsThisMonth).toBe(0);
      expect(result.current.revenueThisMonth).toBe(0);
      expect(result.current.marketsVisited).toBe(0);
    });

    it('returns zeros when no tickets exist', () => {
      mockUseLiveQuery.mockReturnValue({ tickets: 0, revenue: 0, markets: 0 });

      const { result } = renderHook(() => useDashboardStats('user-123'));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.ticketsThisMonth).toBe(0);
      expect(result.current.revenueThisMonth).toBe(0);
      expect(result.current.marketsVisited).toBe(0);
    });

    it('returns correct counts for validated tickets', () => {
      mockUseLiveQuery.mockReturnValue({ tickets: 15, revenue: 123450, markets: 3 });

      const { result } = renderHook(() => useDashboardStats('user-123'));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.ticketsThisMonth).toBe(15);
      expect(result.current.revenueThisMonth).toBe(123450);
      expect(result.current.marketsVisited).toBe(3);
    });

    it('returns zeros when userId is empty', () => {
      mockUseLiveQuery.mockReturnValue({ tickets: 0, revenue: 0, markets: 0 });

      const { result } = renderHook(() => useDashboardStats(''));

      expect(result.current.ticketsThisMonth).toBe(0);
      expect(result.current.revenueThisMonth).toBe(0);
      expect(result.current.marketsVisited).toBe(0);
    });

    it('calls useLiveQuery with correct dependencies', () => {
      mockUseLiveQuery.mockReturnValue({ tickets: 0, revenue: 0, markets: 0 });

      renderHook(() => useDashboardStats('user-456'));

      expect(mockUseLiveQuery).toHaveBeenCalledTimes(1);
      // First argument is the query function, second is dependencies array
      const [, deps] = mockUseLiveQuery.mock.calls[0];
      expect(deps).toContain('user-456');
      expect(deps).toContain('2026-01-01');
      expect(deps).toContain('2026-01-31');
    });
  });

  describe('aggregateDashboardStats (pure function)', () => {
    it('aggregates empty array correctly', () => {
      const result = aggregateDashboardStats([]);

      expect(result).toEqual({
        tickets: 0,
        revenue: 0,
        markets: 0,
      });
    });

    it('aggregates tickets with revenue and markets', () => {
      const tickets = [
        { total: 1000, marketId: 1 },
        { total: 2000, marketId: 2 },
        { total: 3000, marketId: 1 }, // same market as first
      ];

      const result = aggregateDashboardStats(tickets);

      expect(result).toEqual({
        tickets: 3,
        revenue: 6000,
        markets: 2, // unique markets: 1, 2
      });
    });

    it('handles tickets with null/undefined total', () => {
      const tickets = [
        { total: 1000, marketId: 1 },
        { total: null, marketId: 2 },
        { total: undefined, marketId: 3 },
      ];

      const result = aggregateDashboardStats(tickets);

      expect(result).toEqual({
        tickets: 3,
        revenue: 1000, // only first ticket has valid total
        markets: 3,
      });
    });

    it('handles tickets with null/undefined marketId', () => {
      const tickets = [
        { total: 1000, marketId: 1 },
        { total: 2000, marketId: null },
        { total: 3000, marketId: undefined },
      ];

      const result = aggregateDashboardStats(tickets);

      expect(result).toEqual({
        tickets: 3,
        revenue: 6000,
        markets: 1, // only first ticket has valid marketId
      });
    });

    it('deduplicates markets correctly', () => {
      const tickets = [
        { total: 100, marketId: 1 },
        { total: 200, marketId: 1 },
        { total: 300, marketId: 1 },
        { total: 400, marketId: 2 },
        { total: 500, marketId: 2 },
      ];

      const result = aggregateDashboardStats(tickets);

      expect(result).toEqual({
        tickets: 5,
        revenue: 1500,
        markets: 2,
      });
    });
  });

  describe('filterTicketsForDashboard (pure function)', () => {
    const JAN_START = '2026-01-01';
    const JAN_END = '2026-01-31';

    it('includes validated tickets in date range', () => {
      const ticket = { impressionDate: '2026-01-15', status: 'validated' };
      expect(filterTicketsForDashboard(ticket, JAN_START, JAN_END)).toBe(true);
    });

    it('excludes draft tickets', () => {
      const ticket = { impressionDate: '2026-01-15', status: 'draft' };
      expect(filterTicketsForDashboard(ticket, JAN_START, JAN_END)).toBe(false);
    });

    it('excludes cancelled tickets', () => {
      const ticket = { impressionDate: '2026-01-15', status: 'cancelled' };
      expect(filterTicketsForDashboard(ticket, JAN_START, JAN_END)).toBe(false);
    });

    it('excludes tickets before date range', () => {
      const ticket = { impressionDate: '2025-12-31', status: 'validated' };
      expect(filterTicketsForDashboard(ticket, JAN_START, JAN_END)).toBe(false);
    });

    it('excludes tickets after date range', () => {
      const ticket = { impressionDate: '2026-02-01', status: 'validated' };
      expect(filterTicketsForDashboard(ticket, JAN_START, JAN_END)).toBe(false);
    });

    it('includes tickets on range boundaries', () => {
      const ticketStart = { impressionDate: '2026-01-01', status: 'validated' };
      const ticketEnd = { impressionDate: '2026-01-31', status: 'validated' };

      expect(filterTicketsForDashboard(ticketStart, JAN_START, JAN_END)).toBe(true);
      expect(filterTicketsForDashboard(ticketEnd, JAN_START, JAN_END)).toBe(true);
    });

    it('excludes tickets with null impressionDate', () => {
      const ticket = { impressionDate: null, status: 'validated' };
      expect(filterTicketsForDashboard(ticket, JAN_START, JAN_END)).toBe(false);
    });

    it('excludes tickets with undefined impressionDate', () => {
      const ticket = { impressionDate: undefined, status: 'validated' };
      expect(filterTicketsForDashboard(ticket, JAN_START, JAN_END)).toBe(false);
    });

    it('handles impressionDate with time component', () => {
      // impressionDate might include time, we slice to get YYYY-MM-DD
      const ticket = { impressionDate: '2026-01-15T10:30:00Z', status: 'validated' };
      expect(filterTicketsForDashboard(ticket, JAN_START, JAN_END)).toBe(true);
    });
  });
});
