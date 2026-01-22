'use client';

/**
 * TicketList - Renders a list of ticket cards with loading state
 * Story 4.1: Ticket List (Historique)
 *
 * Displays tickets sorted by most recent first.
 * Shows skeleton loading state while data is being fetched.
 */

import { useRouter } from 'next/navigation';
import { TicketCard } from './TicketCard';
import type { Ticket } from '@/types';

interface TicketListProps {
  /** Array of tickets to display */
  tickets: Ticket[];
  /** Whether tickets are still loading */
  isLoading: boolean;
}

/**
 * Skeleton card for loading state
 */
function TicketCardSkeleton() {
  return (
    <div
      className="p-4 border-b border-border animate-pulse"
      data-testid="ticket-skeleton"
    >
      <div className="flex gap-3 items-center">
        {/* Thumbnail skeleton */}
        <div className="w-12 h-12 bg-muted rounded flex-shrink-0" />

        {/* Info skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>

        {/* Total skeleton */}
        <div className="h-5 bg-muted rounded w-16 flex-shrink-0" />
      </div>
    </div>
  );
}

/**
 * Skeleton list for loading state
 */
function TicketListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div data-testid="ticket-list-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TicketList({ tickets, isLoading }: TicketListProps) {
  const router = useRouter();

  // Show skeleton while loading
  if (isLoading) {
    return <TicketListSkeleton count={5} />;
  }

  // Navigate to ticket detail
  function handleTicketClick(ticketId: number) {
    router.push(`/tickets/${ticketId}`);
  }

  return (
    <div data-testid="ticket-list">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onClick={() => ticket.id && handleTicketClick(ticket.id)}
        />
      ))}
    </div>
  );
}

export { TicketCardSkeleton, TicketListSkeleton };
export type { TicketListProps };
