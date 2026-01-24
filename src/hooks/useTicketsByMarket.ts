/**
 * React hook for filtering tickets by market and date range
 * Story 4.4: Filter by Market
 *
 * Extends useTicketsByDateRange pattern to include market filtering
 * @see https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

/**
 * Hook to get tickets filtered by date range and markets with reactive updates
 *
 * @param userId - Supabase auth.uid() of the user
 * @param startDate - Start date filter (YYYY-MM-DD or ISO string), null for no filter
 * @param endDate - End date filter (YYYY-MM-DD or ISO string), null for no filter
 * @param marketIds - Array of market IDs to filter by, empty array for no filter
 * @returns Object with filtered tickets array and loading state
 */
export function useTicketsByMarket(
  userId: string,
  startDate: string | null,
  endDate: string | null,
  marketIds: number[]
) {
  const tickets = useLiveQuery(
    async () => {
      if (!userId) return [];

      // Get all tickets for user
      let allTickets = await db.tickets.where('userId').equals(userId).toArray();

      // Filter by date range if specified
      if (startDate || endDate) {
        const normalizedStart = startDate ? startDate.slice(0, 10) : null;
        const normalizedEnd = endDate ? endDate.slice(0, 10) : null;

        allTickets = allTickets.filter((ticket) => {
          const ticketDate = ticket.impressionDate;
          // Skip tickets with missing or invalid date format
          if (!ticketDate || typeof ticketDate !== 'string') return false;
          if (normalizedStart && ticketDate < normalizedStart) return false;
          if (normalizedEnd && ticketDate > normalizedEnd) return false;
          return true;
        });
      }

      // Filter by market if specified
      if (marketIds.length > 0) {
        allTickets = allTickets.filter(
          (ticket) => ticket.marketId && marketIds.includes(ticket.marketId)
        );
      }

      // Sort by createdAt descending (most recent first)
      return allTickets.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    // Join marketIds for stable dependency array
    [userId, startDate, endDate, marketIds.join(',')]
  );

  return {
    tickets,
    isLoading: tickets === undefined,
  };
}
