import type { Metadata } from 'next';
import { TicketsPageClient } from './TicketsPageClient';

export const metadata: Metadata = {
  title: 'Historique - Z-Scanner',
  description: 'Historique des tickets scannés',
  robots: 'noindex',
};

/**
 * Tickets page - History and list of scanned tickets.
 * Story 4.1: Ticket List (Historique)
 *
 * Server component that renders the TicketsPageClient.
 * @see TicketsPageClient for client-side logic and data fetching
 */
export default function TicketsPage() {
  return <TicketsPageClient />;
}
