/**
 * React hook for filtering tickets by date range with useLiveQuery
 * Story 4.3: Filter by Date
 *
 * Provides reactive queries for tickets within a specified date range.
 * Falls back to returning all tickets when no filter is applied.
 *
 * @see https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Ticket } from '@/types';

/**
 * Hook to get tickets filtered by date range with reactive updates
 * @param userId - Supabase auth.uid() of the user
 * @param startDate - Start date filter (ISO string, e.g., "2026-01-15") or null for no filter
 * @param endDate - End date filter (ISO string, e.g., "2026-01-22") or null for no filter
 * @returns Object with filtered tickets array and loading state
 */
export function useTicketsByDateRange(
  userId: string,
  startDate: string | null,
  endDate: string | null
) {
  const tickets = useLiveQuery(
    async (): Promise<Ticket[]> => {
      // Return empty array for empty userId
      if (!userId) return [];

      // No filter applied - return all tickets sorted by createdAt descending
      if (!startDate && !endDate) {
        return db.tickets
          .where('userId')
          .equals(userId)
          .reverse()
          .sortBy('createdAt');
      }

      // Filter by impressionDate range
      // Note: impressionDate is stored as "YYYY-MM-DD" string in database
      const allTickets = await db.tickets.where('userId').equals(userId).toArray();

      // Extract date part for comparison (first 10 chars of ISO string)
      const normalizedStart = startDate ? startDate.slice(0, 10) : null;
      const normalizedEnd = endDate ? endDate.slice(0, 10) : null;

      return allTickets
        .filter((ticket) => {
          const ticketDate = ticket.impressionDate; // "YYYY-MM-DD" format
          // Skip tickets with missing or invalid date format
          if (!ticketDate || typeof ticketDate !== 'string') return false;
          if (normalizedStart && ticketDate < normalizedStart) return false;
          if (normalizedEnd && ticketDate > normalizedEnd) return false;
          return true;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },
    [userId, startDate, endDate]
  );

  return {
    tickets,
    isLoading: tickets === undefined,
  };
}
