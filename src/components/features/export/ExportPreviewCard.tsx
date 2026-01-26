'use client';

/**
 * ExportPreviewCard - Displays export preview summary
 * Story 5.1: Export Page & Period Selection
 *
 * Shows ticket count, total amount, and period summary.
 * Handles loading and empty states.
 */

import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export interface ExportPreviewCardProps {
  /** Number of tickets in the selected period */
  ticketCount: number;
  /** Total amount in centimes */
  totalAmount: number;
  /** Whether the data is loading */
  isLoading: boolean;
  /** Start date in YYYY-MM-DD format */
  startDate: string;
  /** End date in YYYY-MM-DD format */
  endDate: string;
}

export function ExportPreviewCard({
  ticketCount,
  totalAmount,
  isLoading,
  startDate,
  endDate,
}: ExportPreviewCardProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <Card data-testid="export-preview-skeleton">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Aperçu de l&apos;export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-6 bg-muted animate-pulse rounded w-24" />
          <div className="h-6 bg-muted animate-pulse rounded w-32" />
          <div className="h-4 bg-muted animate-pulse rounded w-40" />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (ticketCount === 0) {
    return (
      <Card data-testid="export-preview-empty">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Aperçu de l&apos;export
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-4">
          <p className="text-muted-foreground">
            Aucun ticket pour cette période
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Sélectionnez une autre période
          </p>
        </CardContent>
      </Card>
    );
  }

  // Data display
  return (
    <Card data-testid="export-preview-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Aperçu de l&apos;export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold">
          {ticketCount} ticket{ticketCount > 1 ? 's' : ''}
        </p>
        <p className="text-lg text-muted-foreground">
          Total : {formatCurrency(totalAmount)}
        </p>
        <p className="text-sm text-muted-foreground">
          Du {formatDate(startDate)} au {formatDate(endDate)}
        </p>
      </CardContent>
    </Card>
  );
}
