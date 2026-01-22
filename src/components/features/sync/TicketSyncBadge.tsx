'use client';

/**
 * TicketSyncBadge - Individual ticket sync status badge
 * Story 3.8: Sync Queue & Indicator
 *
 * Displays a subtle badge on tickets that haven't been synced yet.
 * Uses amber styling per UX spec (warning but not error).
 *
 * Hidden when:
 * - Ticket is fully synced (no pending/in-progress items)
 *
 * Visible when:
 * - Ticket has pending or in-progress sync items
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

interface TicketSyncBadgeProps {
  /** ID of the ticket to check sync status for */
  ticketId: number;
}

export function TicketSyncBadge({ ticketId }: TicketSyncBadgeProps) {
  // Check if this ticket has any pending or in-progress sync items
  // Also check photos linked to this ticket
  const hasPendingSync = useLiveQuery(async () => {
    // Count pending/in-progress items for this ticket
    const ticketItems = await db.syncQueue
      .where('entityType')
      .equals('ticket')
      .and((item) => item.entityId === ticketId)
      .and((item) => item.status === 'pending' || item.status === 'in-progress')
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
      .and((item) => item.status === 'pending' || item.status === 'in-progress')
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
