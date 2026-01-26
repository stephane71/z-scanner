"use client";

/**
 * useExportTickets - Hook for fetching tickets for CSV export
 * Story 5.2: CSV Export Generation
 *
 * Uses useLiveQuery to reactively fetch tickets in a date range
 * and resolve market names for export. Includes both validated
 * and cancelled tickets (excludes drafts).
 */

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { ExportTicket, UseExportTicketsResult } from "@/types";

/**
 * Hook to get tickets for export with market names resolved
 * @param userId - Supabase auth.uid() of the user
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Object with export tickets array and loading state
 */
export function useExportTickets(
  userId: string,
  startDate: string,
  endDate: string
): UseExportTicketsResult {
  const result = useLiveQuery(
    async () => {
      if (!userId || !startDate || !endDate) {
        return [];
      }

      // Query tickets in date range using impressionDate
      const tickets = await db.tickets
        .where("userId")
        .equals(userId)
        .filter((ticket) => {
          // Only include validated and cancelled tickets (not drafts)
          if (ticket.status !== "validated" && ticket.status !== "cancelled") {
            return false;
          }
          // Extract date part from impressionDate
          const ticketDate = ticket.impressionDate?.slice(0, 10);
          if (!ticketDate) return false;
          return ticketDate >= startDate && ticketDate <= endDate;
        })
        .toArray();

      // Sort tickets by impression date (chronological order for accountants)
      tickets.sort((a, b) => a.impressionDate.localeCompare(b.impressionDate));

      // Resolve market names and create one line per payment
      const exportTickets: ExportTicket[] = [];

      for (const ticket of tickets) {
        // Resolve market name if marketId exists
        let marketName = "";
        if (ticket.marketId) {
          const market = await db.markets.get(ticket.marketId);
          marketName = market?.name ?? "";
        }

        // Common fields for all payment lines of this ticket
        const commonFields = {
          date: ticket.impressionDate,
          numeroTicket: ticket.ticketNumber,
          marche: marketName,
          statut: (ticket.status === "validated" ? "Validé" : "Annulé") as "Validé" | "Annulé",
          hash: ticket.dataHash,
          // Use validatedAt for validated tickets, cancelledAt for cancelled tickets
          validatedAt: ticket.validatedAt ?? ticket.cancelledAt ?? "",
        };

        // Create one line per payment mode
        if (ticket.payments && ticket.payments.length > 0) {
          for (const payment of ticket.payments) {
            exportTickets.push({
              ...commonFields,
              montantTtc: payment.value,
              modeReglement: payment.mode,
            });
          }
        } else {
          // Ticket with no payments - still export with 0 amount and empty mode
          exportTickets.push({
            ...commonFields,
            montantTtc: 0,
            modeReglement: "",
          });
        }
      }

      return exportTickets;
    },
    [userId, startDate, endDate]
  );

  return {
    tickets: result ?? [],
    isLoading: result === undefined,
  };
}
