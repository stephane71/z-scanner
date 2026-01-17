import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Export - Z-Scanner',
  description: 'Export comptable des tickets',
  robots: 'noindex',
}

/**
 * Export page - CSV export for accounting purposes.
 *
 * This is a placeholder page that will be fully implemented in Epic 5.
 * @see Story 5.1 (export-page-period-selection) - Period selection
 * @see Story 5.2 (csv-export-generation) - CSV export generation
 * @see Story 5.3 (file-download) - File download functionality
 */
export default function ExportPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Export</h1>

      <div
        className="rounded-lg border border-border bg-muted/50 p-6 text-center"
        role="status"
        aria-label="Fonctionnalité en cours de développement"
      >
        <p className="text-muted-foreground mb-4">
          Export comptable en cours de développement
        </p>
        <p className="text-sm text-muted-foreground">
          Cette fonctionnalité sera disponible dans Epic 5
        </p>
      </div>

      {/* Period selection will be added in Story 5.1 */}
      {/* CSV generation will be added in Story 5.2 */}
      {/* File download will be added in Story 5.3 */}
    </div>
  )
}
