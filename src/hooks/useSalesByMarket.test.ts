/**
 * Tests for useSalesByMarket hook
 * Story 6.3: Sales by Market
 *
 * Follows TDD pattern established in Story 6.1 and 6.2:
 * - Pure functions tested directly (no mocking)
 * - Hook integration tests mock useLiveQuery
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useSalesByMarket,
  aggregateMarketStats,
  sortByRevenue,
  filterTicketsForMarket,
  type MarketStats,
} from './useSalesByMarket';

// Mock date-ranges
vi.mock('@/lib/utils/date-ranges', () => ({
  getThisMonth: vi.fn(() => ({ start: '2026-01-01', end: '2026-01-31' })),
}));

// Mock useLiveQuery
const mockUseLiveQuery = vi.fn();
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (...args: unknown[]) => mockUseLiveQuery(...args),
}));

describe('useSalesByMarket', () => {
  // ============================================================
  // PURE FUNCTION TESTS (no mocking needed)
  // ============================================================

  describe('filterTicketsForMarket', () => {
    const start = '2026-01-01';
    const end = '2026-01-31';

    it('returns true for validated ticket within date range', () => {
      const ticket = { impressionDate: '2026-01-15', status: 'validated' };
      expect(filterTicketsForMarket(ticket, start, end)).toBe(true);
    });

    it('returns false for draft ticket', () => {
      const ticket = { impressionDate: '2026-01-15', status: 'draft' };
      expect(filterTicketsForMarket(ticket, start, end)).toBe(false);
    });

    it('returns false for cancelled ticket', () => {
      const ticket = { impressionDate: '2026-01-15', status: 'cancelled' };
      expect(filterTicketsForMarket(ticket, start, end)).toBe(false);
    });

    it('returns false for ticket before date range', () => {
      const ticket = { impressionDate: '2025-12-31', status: 'validated' };
      expect(filterTicketsForMarket(ticket, start, end)).toBe(false);
    });

    it('returns false for ticket after date range', () => {
      const ticket = { impressionDate: '2026-02-01', status: 'validated' };
      expect(filterTicketsForMarket(ticket, start, end)).toBe(false);
    });

    it('returns true for ticket on start date boundary', () => {
      const ticket = { impressionDate: '2026-01-01', status: 'validated' };
      expect(filterTicketsForMarket(ticket, start, end)).toBe(true);
    });

    it('returns true for ticket on end date boundary', () => {
      const ticket = { impressionDate: '2026-01-31', status: 'validated' };
      expect(filterTicketsForMarket(ticket, start, end)).toBe(true);
    });

    it('returns false for null impressionDate', () => {
      const ticket = { impressionDate: null, status: 'validated' };
      expect(filterTicketsForMarket(ticket, start, end)).toBe(false);
    });
  });

  describe('aggregateMarketStats', () => {
    it('returns empty map for empty tickets array', () => {
      const marketNames = new Map<number, string>();
      const { markets, unassigned } = aggregateMarketStats([], marketNames);

      expect(markets.size).toBe(0);
      expect(unassigned.ticketCount).toBe(0);
      expect(unassigned.revenue).toBe(0);
    });

    it('aggregates tickets by marketId', () => {
      const tickets = [
        { marketId: 1, total: 1000 },
        { marketId: 1, total: 2000 },
        { marketId: 2, total: 500 },
      ];
      const marketNames = new Map<number, string>([
        [1, 'Market A'],
        [2, 'Market B'],
      ]);

      const { markets } = aggregateMarketStats(tickets, marketNames);

      expect(markets.size).toBe(2);
      expect(markets.get(1)?.ticketCount).toBe(2);
      expect(markets.get(1)?.revenue).toBe(3000);
      expect(markets.get(2)?.ticketCount).toBe(1);
      expect(markets.get(2)?.revenue).toBe(500);
    });

    it('uses market name from map', () => {
      const tickets = [{ marketId: 1, total: 1000 }];
      const marketNames = new Map<number, string>([[1, 'Marché de Paris']]);

      const { markets } = aggregateMarketStats(tickets, marketNames);

      expect(markets.get(1)?.marketName).toBe('Marché de Paris');
    });

    it('uses fallback name when market not in map', () => {
      const tickets = [{ marketId: 99, total: 1000 }];
      const marketNames = new Map<number, string>();

      const { markets } = aggregateMarketStats(tickets, marketNames);

      expect(markets.get(99)?.marketName).toBe('Marché 99');
    });

    it('aggregates unassigned tickets (marketId = null)', () => {
      const tickets = [
        { marketId: null, total: 1000 },
        { marketId: null, total: 2000 },
      ];
      const marketNames = new Map<number, string>();

      const { unassigned } = aggregateMarketStats(tickets, marketNames);

      expect(unassigned.ticketCount).toBe(2);
      expect(unassigned.revenue).toBe(3000);
      expect(unassigned.marketName).toBe('Non assigné');
    });

    it('aggregates unassigned tickets (marketId = undefined)', () => {
      const tickets = [
        { total: 1000 },
        { total: 2000 },
      ] as { marketId?: number | null; total?: number | null }[];
      const marketNames = new Map<number, string>();

      const { unassigned } = aggregateMarketStats(tickets, marketNames);

      expect(unassigned.ticketCount).toBe(2);
      expect(unassigned.revenue).toBe(3000);
    });

    it('handles null total as 0', () => {
      const tickets = [{ marketId: 1, total: null }];
      const marketNames = new Map<number, string>([[1, 'Market A']]);

      const { markets } = aggregateMarketStats(tickets, marketNames);

      expect(markets.get(1)?.revenue).toBe(0);
      expect(markets.get(1)?.ticketCount).toBe(1);
    });

    it('handles mixed assigned and unassigned tickets', () => {
      const tickets = [
        { marketId: 1, total: 1000 },
        { marketId: null, total: 2000 },
        { marketId: 2, total: 500 },
        { total: 300 },
      ] as { marketId?: number | null; total?: number | null }[];
      const marketNames = new Map<number, string>([
        [1, 'Market A'],
        [2, 'Market B'],
      ]);

      const { markets, unassigned } = aggregateMarketStats(tickets, marketNames);

      expect(markets.size).toBe(2);
      expect(unassigned.ticketCount).toBe(2);
      expect(unassigned.revenue).toBe(2300);
    });
  });

  describe('sortByRevenue', () => {
    it('sorts markets by revenue in descending order', () => {
      const markets: MarketStats[] = [
        { marketId: 1, marketName: 'Low', ticketCount: 1, revenue: 100 },
        { marketId: 2, marketName: 'High', ticketCount: 1, revenue: 1000 },
        { marketId: 3, marketName: 'Medium', ticketCount: 1, revenue: 500 },
      ];

      const sorted = sortByRevenue(markets);

      expect(sorted[0].marketName).toBe('High');
      expect(sorted[1].marketName).toBe('Medium');
      expect(sorted[2].marketName).toBe('Low');
    });

    it('returns empty array for empty input', () => {
      const sorted = sortByRevenue([]);
      expect(sorted).toEqual([]);
    });

    it('does not mutate original array', () => {
      const markets: MarketStats[] = [
        { marketId: 1, marketName: 'A', ticketCount: 1, revenue: 100 },
        { marketId: 2, marketName: 'B', ticketCount: 1, revenue: 200 },
      ];
      const original = [...markets];

      sortByRevenue(markets);

      expect(markets).toEqual(original);
    });

    it('handles equal revenues (stable sort)', () => {
      const markets: MarketStats[] = [
        { marketId: 1, marketName: 'A', ticketCount: 1, revenue: 100 },
        { marketId: 2, marketName: 'B', ticketCount: 1, revenue: 100 },
      ];

      const sorted = sortByRevenue(markets);

      expect(sorted.length).toBe(2);
      // Both have same revenue, order preserved
    });
  });

  // ============================================================
  // HOOK INTEGRATION TESTS (mock useLiveQuery)
  // ============================================================

  describe('useSalesByMarket hook', () => {
    beforeEach(() => {
      mockUseLiveQuery.mockReset();
    });

    it('returns loading state initially', () => {
      mockUseLiveQuery.mockReturnValue(undefined);

      const { result } = renderHook(() => useSalesByMarket('user-123'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.markets).toEqual([]);
      expect(result.current.unassigned.ticketCount).toBe(0);
    });

    it('returns zeros for empty userId', () => {
      mockUseLiveQuery.mockReturnValue({
        markets: [],
        unassigned: { marketId: null, marketName: 'Non assigné', ticketCount: 0, revenue: 0 },
      });

      const { result } = renderHook(() => useSalesByMarket(''));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.markets).toEqual([]);
    });

    it('returns market stats when data is loaded', () => {
      mockUseLiveQuery.mockReturnValue({
        markets: [
          { marketId: 1, marketName: 'Market A', ticketCount: 5, revenue: 25000 },
          { marketId: 2, marketName: 'Market B', ticketCount: 3, revenue: 15000 },
        ],
        unassigned: { marketId: null, marketName: 'Non assigné', ticketCount: 2, revenue: 5000 },
      });

      const { result } = renderHook(() => useSalesByMarket('user-123'));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.markets.length).toBe(2);
      expect(result.current.markets[0].marketName).toBe('Market A');
      expect(result.current.markets[0].ticketCount).toBe(5);
      expect(result.current.markets[0].revenue).toBe(25000);
      expect(result.current.unassigned.ticketCount).toBe(2);
    });

    it('handles no markets with only unassigned tickets', () => {
      mockUseLiveQuery.mockReturnValue({
        markets: [],
        unassigned: { marketId: null, marketName: 'Non assigné', ticketCount: 10, revenue: 50000 },
      });

      const { result } = renderHook(() => useSalesByMarket('user-123'));

      expect(result.current.markets).toEqual([]);
      expect(result.current.unassigned.ticketCount).toBe(10);
      expect(result.current.unassigned.revenue).toBe(50000);
    });
  });
});
