import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TicketsPageClient } from './TicketsPageClient';
import { TicketListSkeleton } from '@/components/features/tickets/TicketList';

export const metadata: Metadata = {
  title: 'Historique - Z-Scanner',
  description: 'Historique des tickets scannés',
  robots: 'noindex',
};

/**
 * Tickets page - History and list of scanned tickets.
 * Story 4.1: Ticket List (Historique)
 * Story 4.3: Filter by Date (with URL persistence)
 *
 * Server component that renders the TicketsPageClient.
 * Wrapped in Suspense because TicketsPageClient uses useSearchParams.
 * @see TicketsPageClient for client-side logic and data fetching
 */
export default function TicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-4">
          <TicketListSkeleton count={5} />
        </div>
      }
    >
      <TicketsPageClient />
    </Suspense>
  );
}
