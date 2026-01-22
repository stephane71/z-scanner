import type { Metadata } from 'next';
import { Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Export - Z-Scanner',
  description: 'Export comptable des tickets',
  robots: 'noindex',
};

/**
 * Export page - CSV export for accounting purposes.
 * Story 3.10: App Layout & Bottom Navigation - Placeholder page
 *
 * This is a placeholder page that will be fully implemented in Epic 5.
 * @see Story 5.1 (export-page-period-selection) - Period selection
 * @see Story 5.2 (csv-export-generation) - CSV export generation
 * @see Story 5.3 (file-download) - File download functionality
 */
export default function ExportPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-9rem)] p-4">
      <Download className="h-16 w-16 text-muted-foreground mb-4" aria-hidden="true" />
      <h1 className="text-xl font-semibold text-foreground mb-2">Export</h1>
      <p className="text-muted-foreground text-center max-w-xs">
        L&apos;export comptable CSV sera disponible dans Epic 5.
      </p>
    </div>
  );
}
