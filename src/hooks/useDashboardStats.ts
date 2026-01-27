'use client';

/**
 * useDashboardStats - Hook for dashboard activity summary
 * Story 6.1: Activity Dashboard
 *
 * Uses useLiveQuery to reactively aggregate tickets for the current month.
 * Returns counts for validated tickets, total revenue, and unique markets visited.
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getThisMonth } from '@/lib/utils/date-ranges';

export interface DashboardStats {
  /** Number of validated tickets this month */
  ticketsThisMonth: number;
  /** Total revenue in centimes */
  revenueThisMonth: number;
  /** Number of unique markets visited */
  marketsVisited: number;
  /** Whether the data is still loading */
  isLoading: boolean;
}

/** Internal result from aggregation */
interface AggregatedStats {
  tickets: number;
  revenue: number;
  markets: number;
}

/** Ticket shape for aggregation (minimal interface for testability) */
interface TicketForAggregation {
  total?: number | null;
  marketId?: number | null;
}

/**
 * Pure function to aggregate dashboard statistics from tickets
 * Exported for testing purposes
 */
export function aggregateDashboardStats(tickets: TicketForAggregation[]): AggregatedStats {
  const marketIds = new Set<number>();
  let revenue = 0;

  for (const ticket of tickets) {
    revenue += ticket.total ?? 0;
    if (ticket.marketId) {
      marketIds.add(ticket.marketId);
    }
  }

  return {
    tickets: tickets.length,
    revenue,
    markets: marketIds.size,
  };
}

/**
 * Pure function to filter tickets for dashboard stats
 * Exported for testing purposes
 */
export function filterTicketsForDashboard(
  ticket: { impressionDate?: string | null; status?: string },
  start: string,
  end: string
): boolean {
  const ticketDate = ticket.impressionDate?.slice(0, 10);
  if (!ticketDate) return false;
  return (
    ticketDate >= start &&
    ticketDate <= end &&
    ticket.status === 'validated'
  );
}

/**
 * Hook to get dashboard statistics for the current month
 * @param userId - Supabase auth.uid() of the user
 * @returns Dashboard statistics with loading state
 */
export function useDashboardStats(userId: string): DashboardStats {
  const { start, end } = getThisMonth();

  const result = useLiveQuery(
    async () => {
      if (!userId) {
        return { tickets: 0, revenue: 0, markets: 0 };
      }

      // Query tickets for the current month
      const tickets = await db.tickets
        .where('userId')
        .equals(userId)
        .filter((ticket) => filterTicketsForDashboard(ticket, start, end))
        .toArray();

      // Aggregate statistics using pure function
      return aggregateDashboardStats(tickets);
    },
    [userId, start, end]
  );

  return {
    ticketsThisMonth: result?.tickets ?? 0,
    revenueThisMonth: result?.revenue ?? 0,
    marketsVisited: result?.markets ?? 0,
    isLoading: result === undefined,
  };
}
