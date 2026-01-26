import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import { Suspense } from 'react';
import { ExportPageClient } from './ExportPageClient';

export const metadata: Metadata = {
  title: 'Export - Z-Scanner',
  description: 'Export comptable des tickets',
  robots: 'noindex',
};

/**
 * Export page - CSV export for accounting purposes.
 * Story 5.1: Export Page & Period Selection
 *
 * Server component shell with client component for interactivity.
 * @see Story 5.2 (csv-export-generation) - CSV export generation
 * @see Story 5.3 (file-download) - File download functionality
 */
export default function ExportPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Download className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Export Comptable</h1>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6" data-testid="export-page-suspense">
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded w-48" />
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-32 bg-muted animate-pulse rounded" />
          </div>
        }
      >
        <ExportPageClient />
      </Suspense>
    </div>
  );
}
