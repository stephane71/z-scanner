'use client';

/**
 * MarketField - Form field button for market selection
 * Story 4.6: Assign Ticket to Market
 *
 * Displays selected market name or "Aucun marché" if none selected.
 * Click opens the MarketPicker sheet.
 * Uses useMarketById hook to get market name from ID.
 */

import { MapPin, ChevronRight } from 'lucide-react';
import { useMarketById } from '@/hooks';

export interface MarketFieldProps {
  /** Selected market ID (undefined means no market) */
  value: number | undefined;
  /** Callback when field is clicked to open picker */
  onClick: () => void;
  /** Optional className for styling */
  className?: string;
}

export function MarketField({ value, onClick, className = '' }: MarketFieldProps) {
  const { market, isLoading } = useMarketById(value);

  // Determine display text
  let displayText = 'Aucun marché';
  if (value !== undefined) {
    if (isLoading) {
      displayText = 'Chargement...';
    } else if (market) {
      displayText = market.name;
    } else {
      // Market was deleted or not found
      displayText = 'Marché supprimé';
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
    >
      <span className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
        <span className={value === undefined ? 'text-gray-500' : 'text-gray-900'}>
          {displayText}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
    </button>
  );
}
