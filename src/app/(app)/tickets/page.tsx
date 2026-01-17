import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tickets - Z-Scanner',
  description: 'Historique des tickets scannés',
  robots: 'noindex',
}

/**
 * Tickets page - History and list of scanned tickets.
 *
 * This is a placeholder page that will be fully implemented in Epic 4.
 * @see Story 4.1 (ticket-list-historique) - Ticket list with history
 * @see Story 4.2 (ticket-detail-view) - Ticket detail view
 */
export default function TicketsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Tickets</h1>

      <div
        className="rounded-lg border border-border bg-muted/50 p-6 text-center"
        role="status"
        aria-label="Fonctionnalité en cours de développement"
      >
        <p className="text-muted-foreground mb-4">
          Historique des tickets en cours de développement
        </p>
        <p className="text-sm text-muted-foreground">
          Cette fonctionnalité sera disponible dans Epic 4
        </p>
      </div>

      {/* Ticket list will be added in Story 4.1 */}
      {/* Ticket detail view will be added in Story 4.2 */}
      {/* Date filters will be added in Story 4.3 */}
      {/* Market filters will be added in Story 4.4 */}
    </div>
  )
}
