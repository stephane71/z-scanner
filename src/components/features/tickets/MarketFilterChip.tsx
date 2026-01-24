'use client';

/**
 * MarketFilterChip component - Display active market filter
 * Story 4.4: Filter by Market
 *
 * Shows selected market name or count, with clear button.
 * Follows FilterChip pattern from Story 4.3.
 */

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketFilterChipProps {
  marketNames: string[];
  onClear: () => void;
}

export function MarketFilterChip({ marketNames, onClear }: MarketFilterChipProps) {
  // Display single market name or "X marchés" for multiple
  const displayText =
    marketNames.length === 1
      ? marketNames[0]
      : `${marketNames.length} marchés`;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5',
        'bg-primary/10 text-primary rounded-full',
        'text-sm font-medium'
      )}
    >
      <span>{displayText}</span>
      <button
        type="button"
        onClick={onClear}
        data-testid="market-filter-chip-clear"
        aria-label="Effacer le filtre marché"
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
