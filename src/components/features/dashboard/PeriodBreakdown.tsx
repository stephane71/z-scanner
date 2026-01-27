/**
 * Period Breakdown Component
 * Story 6.2: Sales by Period
 *
 * Expandable/collapsible component showing daily/weekly/monthly breakdown.
 * Controlled component - parent manages accordion state (only one open at a time).
 */

'use client';

import { ChevronDown } from 'lucide-react';
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

interface PeriodBreakdownTriggerProps {
  /** Title shown on the trigger button */
  title: string;
  /** Whether this breakdown is currently open */
  isOpen: boolean;
  /** Callback when toggle is clicked */
  onToggle: () => void;
  /** Comparison label for screen readers (e.g., "par jour") */
  comparisonLabel: string;
}

interface PeriodBreakdownContentProps {
  /** Breakdown items to display */
  items: BreakdownItem[];
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
 * Period Breakdown Trigger - button to expand/collapse breakdown
 * Controlled component for accordion behavior
 */
export function PeriodBreakdownTrigger({ title, isOpen, onToggle, comparisonLabel }: PeriodBreakdownTriggerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className={cn(
        'flex w-full items-center justify-center gap-1',
        'text-sm text-muted-foreground hover:text-foreground',
        'transition-colors duration-200',
        'min-h-[48px] px-2 rounded-md hover:bg-muted/50',
        isOpen && 'bg-muted/50 text-foreground'
      )}
    >
      <span>{title}</span>
      <ChevronDown
        className={cn(
          'h-4 w-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
        aria-hidden="true"
      />
      <span className="sr-only">Afficher {comparisonLabel}</span>
    </button>
  );
}

/**
 * Period Breakdown Content - displays breakdown items full-width
 */
export function PeriodBreakdownContent({ items }: PeriodBreakdownContentProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2 text-center">Aucune donnée disponible</p>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item) => (
        <BreakdownItemRow key={item.label} item={item} />
      ))}
    </div>
  );
}

// Legacy export for backwards compatibility with tests
export interface PeriodBreakdownProps {
  title: string;
  items: BreakdownItem[];
  comparisonLabel: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

/**
 * Period Breakdown - legacy component, now controlled
 * @deprecated Use PeriodBreakdownTrigger and PeriodBreakdownContent separately
 */
export function PeriodBreakdown({ title, items, comparisonLabel, isOpen = false, onToggle }: PeriodBreakdownProps) {
  return (
    <div>
      <PeriodBreakdownTrigger
        title={title}
        isOpen={isOpen}
        onToggle={onToggle ?? (() => {})}
        comparisonLabel={comparisonLabel}
      />
      {isOpen && (
        <div className="pt-2">
          <PeriodBreakdownContent items={items} />
        </div>
      )}
    </div>
  );
}
