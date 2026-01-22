'use client';

/**
 * TicketListItem - Reusable ticket list item with sync badge
 * Story 3.8: Sync Queue & Indicator - Task 5
 *
 * Displays a ticket summary with:
 * - Ticket date and number
 * - Total amount
 * - Sync status badge (when not synced)
 *
 * Prepared for Story 4.1 (ticket-list-historique) integration.
 */

import { TicketSyncBadge } from './TicketSyncBadge';
import type { Ticket } from '@/types';

interface TicketListItemProps {
  /** Ticket data to display */
  ticket: Ticket;
  /** Click handler for navigation */
  onClick?: () => void;
}

/**
 * Format amount from centimes to display string
 * @param centimes - Amount in centimes
 * @returns Formatted string (e.g., "12,50 €")
 */
function formatAmount(centimes: number): string {
  const euros = centimes / 100;
  return euros.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}

/**
 * Format date for display
 * @param dateStr - ISO date string
 * @returns Formatted string (e.g., "15/01/2026")
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function TicketListItem({ ticket, onClick }: TicketListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors min-h-[72px] flex items-center justify-between"
      aria-label={`Ticket ${ticket.ticketNumber ?? 'N/A'} du ${formatDate(ticket.impressionDate ?? ticket.createdAt)}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900">
            Ticket #{ticket.ticketNumber ?? 'N/A'}
          </span>
          {ticket.id !== undefined && <TicketSyncBadge ticketId={ticket.id} />}
        </div>
        <p className="text-sm text-gray-500">
          {formatDate(ticket.impressionDate ?? ticket.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <span className="font-semibold text-gray-900">
          {formatAmount(ticket.total ?? 0)}
        </span>
      </div>
    </button>
  );
}

export type { TicketListItemProps };
