'use client';

/**
 * ExportPageClient - Client component for export page
 * Story 5.1: Export Page & Period Selection
 *
 * Manages date range state and displays period selector and preview.
 * Defaults to "Ce mois" preset on initial load.
 */

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useExportPreview } from '@/hooks/useExportPreview';
import { PeriodSelector } from '@/components/features/export/PeriodSelector';
import { ExportPreviewCard } from '@/components/features/export/ExportPreviewCard';
import {
  getThisMonth,
  type DateRange,
  type ExportPreset,
} from '@/lib/utils/date-ranges';

export function ExportPageClient() {
  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Date range state - default to "Ce mois"
  const defaultRange = getThisMonth();
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset | null>(
    'this-month'
  );
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);

  // Get current user from Supabase
  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      setAuthLoading(false);
    }
    getUser();
  }, []);

  // Get export preview data
  const { ticketCount, totalAmount, isLoading } = useExportPreview(
    userId ?? '',
    startDate,
    endDate
  );

  function handlePresetSelect(preset: ExportPreset, range: DateRange) {
    setSelectedPreset(preset);
    setStartDate(range.start);
    setEndDate(range.end);
  }

  function handleCustomRangeChange(newStartDate: string, newEndDate: string) {
    setSelectedPreset('custom');
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }

  // Determine if export is possible
  const isDateRangeValid = startDate && endDate && startDate <= endDate;
  const canExport = ticketCount > 0 && isDateRangeValid && !isLoading;

  // Loading state
  if (authLoading) {
    return (
      <div className="space-y-6" data-testid="export-page-loading">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded w-48" />
          <div className="h-12 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="export-page-content">
      {/* Period Selector */}
      <PeriodSelector
        selectedPreset={selectedPreset}
        startDate={startDate}
        endDate={endDate}
        onPresetSelect={handlePresetSelect}
        onCustomRangeChange={handleCustomRangeChange}
      />

      {/* Export Preview */}
      <ExportPreviewCard
        ticketCount={ticketCount}
        totalAmount={totalAmount}
        isLoading={isLoading}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Export Button (disabled until Story 5.2) */}
      <Button
        className="w-full min-h-[48px]"
        disabled={!canExport}
        data-testid="export-button"
      >
        <Download className="h-5 w-5 mr-2" aria-hidden="true" />
        Exporter en CSV
      </Button>
      {!canExport && ticketCount === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground text-center">
          Sélectionnez une période avec des tickets pour exporter
        </p>
      )}
    </div>
  );
}
