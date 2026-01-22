import type { Metadata } from 'next';
import { List } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Historique - Z-Scanner',
  description: 'Historique des tickets scannés',
  robots: 'noindex',
};

/**
 * Tickets page - History and list of scanned tickets.
 * Story 3.10: App Layout & Bottom Navigation - Placeholder page
 *
 * This is a placeholder page that will be fully implemented in Epic 4.
 * @see Story 4.1 (ticket-list-historique) - Ticket list with history
 * @see Story 4.2 (ticket-detail-view) - Ticket detail view
 */
export default function TicketsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-9rem)] p-4">
      <List className="h-16 w-16 text-muted-foreground mb-4" aria-hidden="true" />
      <h1 className="text-xl font-semibold text-foreground mb-2">Historique</h1>
      <p className="text-muted-foreground text-center max-w-xs">
        La liste de vos tickets validés sera disponible dans Epic 4.
      </p>
    </div>
  );
}
