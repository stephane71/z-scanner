/**
 * useCancelTicket - Hook for NF525-compliant ticket cancellation
 * Story 4.7: Ticket Cancellation (NF525 Compliant)
 *
 * Handles canceling tickets with required reason, updating local
 * IndexedDB via Dexie and queuing for cloud sync.
 *
 * NF525 Compliance:
 * - Tickets are NEVER deleted, only marked as cancelled
 * - cancellationReason is REQUIRED
 * - cancelledAt timestamp is recorded
 */

'use client';

import { useState, useCallback } from 'react';
import { cancelTicket as cancelTicketInDb } from '@/hooks/useTickets';
import { queueCancel } from '@/hooks/useSyncQueue';

export interface UseCancelTicketResult {
  /** Cancel a ticket with the given reason */
  cancelTicket: (ticketId: number, reason: string) => Promise<void>;
  /** Whether a cancellation is in progress */
  isLoading: boolean;
  /** Error message if cancellation failed */
  error: string | null;
}

/**
 * Hook for canceling tickets with NF525 compliance
 * @returns Object with cancelTicket function, loading state, and error
 */
export function useCancelTicket(): UseCancelTicketResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelTicket = useCallback(async (ticketId: number, reason: string): Promise<void> => {
    // Validate reason
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError('Cancellation reason is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate single timestamp for consistency between DB and sync queue
      const cancelledAt = new Date().toISOString();

      // 1. Update ticket in local Dexie database
      await cancelTicketInDb(ticketId, trimmedReason, cancelledAt);

      // 2. Queue for cloud sync with same timestamp
      await queueCancel(ticketId, {
        action: 'cancel',
        cancelledAt,
        cancellationReason: trimmedReason,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cancelTicket,
    isLoading,
    error,
  };
}
