"use client";

/**
 * useGenerateExport - Hook for generating CSV export
 * Story 5.2: CSV Export Generation
 *
 * Combines useExportTickets with CSV generation utility
 * to provide a simple interface for export functionality.
 */

import { useState, useCallback } from "react";
import { useExportTickets } from "./useExportTickets";
import { generateCsv } from "@/lib/utils/csv";
import type { UseGenerateExportResult } from "@/types";

/**
 * Hook to generate CSV export for tickets in a date range
 * @param userId - Supabase auth.uid() of the user
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Object with generateCsv function, loading state, and error
 */
export function useGenerateExport(
  userId: string,
  startDate: string,
  endDate: string
): UseGenerateExportResult {
  const { tickets, isLoading } = useExportTickets(userId, startDate, endDate);
  const [error, setError] = useState<string | null>(null);

  const generateCsvCallback = useCallback(() => {
    // Reset error
    setError(null);

    // Return null if no tickets
    if (tickets.length === 0) {
      return null;
    }

    try {
      return generateCsv(tickets);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "CSV generation failed";
      setError(errorMessage);
      return null;
    }
  }, [tickets]);

  return {
    generateCsv: generateCsvCallback,
    isGenerating: isLoading,
    error,
  };
}
