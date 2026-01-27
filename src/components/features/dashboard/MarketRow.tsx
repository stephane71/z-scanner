/**
 * Market Row Component
 * Story 6.3: Sales by Market
 *
 * Clickable row displaying market stats with navigation to filtered ticket list.
 */

'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { type MarketStats } from '@/hooks';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

export interface MarketRowProps {
  /** Market statistics to display */
  stats: MarketStats;
  /** Whether this is the unassigned category */
  isUnassigned?: boolean;
}

/**
 * Clickable market row with navigation to filtered ticket list
 * Uses 'markets' parameter to match Story 4.4 filter implementation.
 * Uses 'unassigned' marker (market ID 0) for tickets without market.
 */
export function MarketRow({ stats, isUnassigned = false }: MarketRowProps) {
  // Use markets (plural) to match existing filter in TicketsPageClient
  // Use 0 as marker for unassigned tickets (marketId = null)
  const href = isUnassigned
    ? '/tickets?markets=0'
    : `/tickets?markets=${stats.marketId}`;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between py-3 px-2 -mx-2 rounded-md',
        'hover:bg-muted/50 active:bg-muted transition-colors',
        'min-h-[48px]' // 48px touch target per UX guidelines
      )}
      aria-label={`${stats.marketName}: ${stats.ticketCount} tickets, ${formatCurrency(stats.revenue)}`}
    >
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          isUnassigned && 'text-muted-foreground'
        )}>
          {stats.marketName}
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="sr-only">Nombre de tickets: </span>
          {stats.ticketCount} ticket{stats.ticketCount !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">
          <span className="sr-only">Revenu: </span>
          {formatCurrency(stats.revenue)}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
    </Link>
  );
}
