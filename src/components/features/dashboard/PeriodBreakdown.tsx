/**
 * Period Breakdown Component
 * Story 6.2: Sales by Period
 *
 * Expandable/collapsible component showing daily/weekly/monthly breakdown.
 * Uses useState for ephemeral UI state (expand/collapse).
 */

'use client';

import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

/** Single breakdown item data */
export interface BreakdownItem {
  /** Label for the period (e.g., "Lundi", "Semaine 1", "Janvier") */
  label: string;
  /** Number of tickets in this period */
  ticketCount: number;
  /** Revenue in centimes */
  revenue: number;
}

interface PeriodBreakdownProps {
  /** Title shown on the trigger button */
  title: string;
  /** Breakdown items to display */
  items: BreakdownItem[];
  /** Comparison label for screen readers (e.g., "par jour") */
  comparisonLabel: string;
}

/**
 * Single breakdown item row
 */
function BreakdownItemRow({ item }: { item: BreakdownItem }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium">{item.label}</span>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{item.ticketCount} tickets</span>
        <span className="font-medium text-foreground">{formatCurrency(item.revenue)}</span>
      </div>
    </div>
  );
}

/**
 * Period Breakdown - expandable section with detailed stats
 */
export function PeriodBreakdown({ title, items, comparisonLabel }: PeriodBreakdownProps) {
  return (
    <Collapsible>
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center justify-between',
          'text-sm text-muted-foreground hover:text-foreground',
          'transition-colors duration-200',
          'min-h-[48px] px-2 rounded-md hover:bg-muted/50'
        )}
      >
        <span>{title}</span>
        <ChevronDown
          className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180"
          aria-hidden="true"
        />
        <span className="sr-only">Afficher {comparisonLabel}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 text-center">Aucune donnée disponible</p>
        ) : (
          <div className="space-y-0">
            {items.map((item) => (
              <BreakdownItemRow key={item.label} item={item} />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
