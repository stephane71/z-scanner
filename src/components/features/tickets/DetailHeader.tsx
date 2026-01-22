/**
 * DetailHeader - Back navigation and title for ticket detail view
 * Story 4.2: Ticket Detail View
 *
 * Provides back navigation to /tickets list with ticket number title.
 * Shows sync status badge when ticket is not synced.
 * Uses consistent app header styling.
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { TicketSyncBadge } from '@/components/features/sync';

interface DetailHeaderProps {
  /** Ticket number for title display */
  ticketNumber: number;
  /** Ticket ID for sync status check */
  ticketId?: number;
}

export function DetailHeader({ ticketNumber, ticketId }: DetailHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="flex items-center h-14 px-4">
        {/* Back button */}
        <Link
          href="/tickets"
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-muted active:bg-muted transition-colors"
          aria-label="Retour à la liste des tickets"
          data-testid="back-button"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" aria-hidden="true" />
        </Link>

        {/* Title */}
        <h1 className="flex-1 text-lg font-semibold text-foreground ml-2">
          Ticket #{ticketNumber}
        </h1>

        {/* Sync status badge */}
        {ticketId && <TicketSyncBadge ticketId={ticketId} />}
      </div>
    </header>
  );
}

export type { DetailHeaderProps };
