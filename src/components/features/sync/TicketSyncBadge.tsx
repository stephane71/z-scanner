'use client';

/**
 * TicketSyncBadge - Individual ticket sync status badge
 * Story 3.8: Sync Queue & Indicator
 *
 * Displays a subtle badge on tickets that haven't been synced yet.
 * Uses amber styling per UX spec (warning but not error).
 *
 * Hidden when:
 * - Ticket is fully synced (status = completed)
 *
 * Visible when:
 * - Ticket has pending, in-progress, or failed sync items
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

interface TicketSyncBadgeProps {
  /** ID of the ticket to check sync status for */
  ticketId: number;
}

export function TicketSyncBadge({ ticketId }: TicketSyncBadgeProps) {
  // Check if this ticket has any non-completed sync items
  // (pending, in-progress, or failed all mean "not synced")
  const hasPendingSync = useLiveQuery(async () => {
    // Count non-completed items for this ticket
    const ticketItems = await db.syncQueue
      .where('entityType')
      .equals('ticket')
      .and((item) => item.entityId === ticketId)
      .and((item) => item.status !== 'completed')
      .count();

    if (ticketItems > 0) return true;

    // Also check photos linked to this ticket
    const photoItems = await db.syncQueue
      .where('entityType')
      .equals('photo')
      .and((item) => {
        try {
          const payload = JSON.parse(item.payload);
          return payload.ticketId === ticketId;
        } catch {
          return false;
        }
      })
      .and((item) => item.status !== 'completed')
      .count();

    return photoItems > 0;
  }, [ticketId]);

  // Hidden when no pending sync items
  if (!hasPendingSync) {
    return null;
  }

  return (
    <span
      data-testid="ticket-sync-badge"
      className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded"
    >
      Non synchronisé
    </span>
  );
}

export type { TicketSyncBadgeProps };
