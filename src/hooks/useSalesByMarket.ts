/**
 * Sales by Market Hook
 * Story 6.3: Sales by Market
 *
 * Provides reactive market-based sales aggregations using useLiveQuery.
 * Returns stats for each market with ticket counts and revenue, sorted by revenue.
 *
 * Pure functions are exported for testability (following Story 6.1/6.2 pattern).
 */

'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getThisMonth } from '@/lib/utils/date-ranges';

/** Stats for a single market */
export interface MarketStats {
  /** Market ID or null for unassigned */
  marketId: number | null;
  /** Market name or "Non assigné" */
  marketName: string;
  /** Number of validated tickets */
  ticketCount: number;
  /** Revenue in centimes */
  revenue: number;
}

/** Result from useSalesByMarket hook */
export interface SalesByMarketResult {
  /** Markets sorted by revenue (highest first) */
  markets: MarketStats[];
  /** Unassigned tickets stats */
  unassigned: MarketStats;
  /** Loading state */
  isLoading: boolean;
}

/** Ticket type for filtering */
interface TicketForFilter {
  impressionDate?: string | null;
  status?: string;
}

/** Ticket type for aggregation */
interface TicketForAggregation {
  marketId?: number | null;
  total?: number | null;
}

/** Default unassigned stats */
const defaultUnassigned: MarketStats = {
  marketId: null,
  marketName: 'Non assigné',
  ticketCount: 0,
  revenue: 0,
};

/**
 * Filter tickets by date range and validated status.
 * Pure function for testability.
 */
export function filterTicketsForMarket(
  ticket: TicketForFilter,
  start: string,
  end: string
): boolean {
  const ticketDate = ticket.impressionDate?.slice(0, 10);
  if (!ticketDate) return false;
  return ticketDate >= start && ticketDate <= end && ticket.status === 'validated';
}

/**
 * Aggregate tickets by market.
 * Pure function for testability.
 *
 * @param tickets - Array of tickets with marketId and total
 * @param marketNames - Map of marketId to market name
 * @returns Object with markets map and unassigned stats
 */
export function aggregateMarketStats(
  tickets: TicketForAggregation[],
  marketNames: Map<number, string>
): { markets: Map<number, MarketStats>; unassigned: MarketStats } {
  const markets = new Map<number, MarketStats>();
  const unassigned: MarketStats = {
    marketId: null,
    marketName: 'Non assigné',
    ticketCount: 0,
    revenue: 0,
  };

  for (const ticket of tickets) {
    const revenue = ticket.total ?? 0;

    if (ticket.marketId) {
      const existing = markets.get(ticket.marketId);
      if (existing) {
        existing.ticketCount++;
        existing.revenue += revenue;
      } else {
        markets.set(ticket.marketId, {
          marketId: ticket.marketId,
          marketName: marketNames.get(ticket.marketId) ?? `Marché ${ticket.marketId}`,
          ticketCount: 1,
          revenue,
        });
      }
    } else {
      unassigned.ticketCount++;
      unassigned.revenue += revenue;
    }
  }

  return { markets, unassigned };
}

/**
 * Sort markets by revenue (highest first).
 * Pure function for testability.
 *
 * @param markets - Array of market stats
 * @returns New sorted array (does not mutate original)
 */
export function sortByRevenue(markets: MarketStats[]): MarketStats[] {
  return [...markets].sort((a, b) => b.revenue - a.revenue);
}

/**
 * Hook for reactive sales by market statistics.
 * Uses useLiveQuery for real-time updates from IndexedDB.
 *
 * @param userId - User ID to filter tickets
 * @param startDate - Optional start date filter (YYYY-MM-DD), defaults to current month start
 * @param endDate - Optional end date filter (YYYY-MM-DD), defaults to current month end
 * @returns Market stats with loading state
 */
export function useSalesByMarket(
  userId: string,
  startDate?: string | null,
  endDate?: string | null
): SalesByMarketResult {
  const thisMonth = getThisMonth();
  // Use provided dates or default to current month
  const start = startDate ?? thisMonth.start;
  const end = endDate ?? thisMonth.end;

  const result = useLiveQuery(
    async () => {
      if (!userId) {
        return { markets: [], unassigned: defaultUnassigned };
      }

      // Fetch markets for name lookup
      const allMarkets = await db.markets
        .where('userId')
        .equals(userId)
        .filter((m) => !m.deletedAt)
        .toArray();

      const marketNames = new Map<number, string>();
      for (const market of allMarkets) {
        if (market.id) marketNames.set(market.id, market.name);
      }

      // Fetch validated tickets for current month
      const tickets = await db.tickets
        .where('userId')
        .equals(userId)
        .filter((ticket) => filterTicketsForMarket(ticket, start, end))
        .toArray();

      // Aggregate by market
      const { markets, unassigned } = aggregateMarketStats(tickets, marketNames);

      // Sort by revenue and convert to array
      const sortedMarkets = sortByRevenue(Array.from(markets.values()));

      return { markets: sortedMarkets, unassigned };
    },
    [userId, start, end]
  );

  return {
    markets: result?.markets ?? [],
    unassigned: result?.unassigned ?? defaultUnassigned,
    isLoading: result === undefined,
  };
}
