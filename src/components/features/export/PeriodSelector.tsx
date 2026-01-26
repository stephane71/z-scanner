'use client';

/**
 * PeriodSelector - Period selection for export
 * Story 5.1: Export Page & Period Selection
 *
 * Provides quick preset buttons and custom date range inputs.
 * Highlights the active preset.
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getExportPresets,
  type DateRange,
  type ExportPreset,
} from '@/lib/utils/date-ranges';

export interface PeriodSelectorProps {
  /** Currently selected preset (null for custom) */
  selectedPreset: ExportPreset | null;
  /** Current start date in YYYY-MM-DD format */
  startDate: string;
  /** Current end date in YYYY-MM-DD format */
  endDate: string;
  /** Called when a preset is selected */
  onPresetSelect: (preset: ExportPreset, range: DateRange) => void;
  /** Called when custom dates change */
  onCustomRangeChange: (startDate: string, endDate: string) => void;
}

export function PeriodSelector({
  selectedPreset,
  startDate,
  endDate,
  onPresetSelect,
  onCustomRangeChange,
}: PeriodSelectorProps) {
  const presets = getExportPresets();

  const isCustomRangeValid = startDate && endDate && startDate <= endDate;

  function handlePresetClick(presetId: ExportPreset) {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      const range = preset.getRange();
      onPresetSelect(presetId, range);
    }
  }

  function handleStartDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    onCustomRangeChange(e.target.value, endDate);
  }

  function handleEndDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    onCustomRangeChange(startDate, e.target.value);
  }

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground font-medium">
          Sélectionnez une période
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant={selectedPreset === preset.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetClick(preset.id)}
              className={cn(
                'w-full min-h-[48px]',
                selectedPreset === preset.id &&
                  'bg-primary text-primary-foreground'
              )}
              data-testid={`preset-${preset.id}`}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground font-medium">
          Ou période personnalisée
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="export-start-date"
              className="block text-xs text-muted-foreground mb-1"
            >
              Date de début
            </label>
            <input
              id="export-start-date"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className={cn(
                'w-full px-3 py-2 rounded-md min-h-[48px]',
                'border border-border bg-background',
                'text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              )}
              data-testid="custom-start-date"
            />
          </div>
          <div>
            <label
              htmlFor="export-end-date"
              className="block text-xs text-muted-foreground mb-1"
            >
              Date de fin
            </label>
            <input
              id="export-end-date"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className={cn(
                'w-full px-3 py-2 rounded-md min-h-[48px]',
                'border border-border bg-background',
                'text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              )}
              data-testid="custom-end-date"
            />
          </div>
        </div>
        {startDate && endDate && !isCustomRangeValid && (
          <p className="text-sm text-destructive" data-testid="date-error">
            La date de début doit être antérieure à la date de fin
          </p>
        )}
      </div>
    </div>
  );
}
