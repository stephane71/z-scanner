"use client";

/**
 * useExportPreview - Hook for export preview data
 * Story 5.1: Export Page & Period Selection
 *
 * Uses useLiveQuery to reactively count tickets and sum amounts
 * for a given date range. Excludes cancelled tickets from totals.
 */

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export interface UseExportPreviewResult {
  /** Number of tickets in the selected period */
  ticketCount: number;
  /** Total amount in centimes */
  totalAmount: number;
  /** Whether the data is still loading */
  isLoading: boolean;
}

/**
 * Hook to get preview data for export
 * @param userId - Supabase auth.uid() of the user
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Object with ticket count, total amount, and loading state
 */
export function useExportPreview(
  userId: string,
  startDate: string,
  endDate: string,
): UseExportPreviewResult {
  const result = useLiveQuery(async () => {
    if (!userId || !startDate || !endDate) {
      return { count: 0, total: 0 };
    }

    // Query tickets in date range using impressionDate
    // impressionDate is the date printed on the ticket (primary date for filtering)
    const tickets = await db.tickets
      .where("userId")
      .equals(userId)
      .filter((ticket) => {
        // Extract date part from impressionDate
        const ticketDate = ticket.impressionDate?.slice(0, 10);
        if (!ticketDate) return false;
        return ticketDate >= startDate && ticketDate <= endDate;
      })
      .toArray();

    // Calculate count and total for validated tickets only
    // Draft tickets have total=0 and aren't ready for export
    // Cancelled tickets are excluded from export
    let count = 0;
    let total = 0;

    for (const ticket of tickets) {
      // Only count validated tickets for export
      if (ticket.status === "validated") {
        count++;
        total += ticket.total ?? 0;
      }
    }

    return { count, total };
  }, [userId, startDate, endDate]);

  return {
    ticketCount: result?.count ?? 0,
    totalAmount: result?.total ?? 0,
    isLoading: result === undefined,
  };
}
