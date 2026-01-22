'use client';

/**
 * FilterChip - Displays active filter with clear button
 * Story 4.3: Filter by Date
 *
 * Shows the current date filter range in a compact pill format
 * with an X button to clear the filter.
 */

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  /** Start date of the filter (ISO string or YYYY-MM-DD) */
  startDate: string;
  /** End date of the filter (ISO string or YYYY-MM-DD) */
  endDate: string;
  /** Called when the filter should be cleared */
  onClear: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format a date string to French short format (dd/MM)
 */
function formatDateShort(dateStr: string): string {
  try {
    // Handle both YYYY-MM-DD and ISO 8601 formats
    const datePart = dateStr.slice(0, 10);
    const [, month, day] = datePart.split('-');
    return `${day}/${month}`;
  } catch {
    return dateStr;
  }
}

export function FilterChip({
  startDate,
  endDate,
  onClear,
  className,
}: FilterChipProps) {
  const startFormatted = formatDateShort(startDate);
  const endFormatted = formatDateShort(endDate);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5',
        'bg-primary/10 text-primary border border-primary/20',
        'rounded-full text-sm font-medium',
        className
      )}
      data-testid="filter-chip"
    >
      <span>{startFormatted} - {endFormatted}</span>
      <button
        type="button"
        onClick={onClear}
        data-testid="filter-chip-clear"
        aria-label="Effacer le filtre"
        className={cn(
          'flex items-center justify-center w-8 h-8 -mr-1.5',
          'rounded-full hover:bg-primary/20',
          'transition-colors'
        )}
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
