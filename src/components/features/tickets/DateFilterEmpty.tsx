'use client';

/**
 * DateFilterEmpty - Displayed when no tickets match the date filter
 * Story 4.3: Filter by Date
 *
 * Shows a message specific to date filtering, indicating that the
 * filter can be adjusted or cleared. Distinct from the general
 * EmptyState which shows when user has no tickets at all.
 */

import { CalendarX } from 'lucide-react';

export function DateFilterEmpty() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      data-testid="date-filter-empty"
    >
      {/* Illustration */}
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <CalendarX className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
      </div>

      {/* Message */}
      <p className="text-sm text-muted-foreground max-w-xs">
        Aucun ticket pour cette période
      </p>
    </div>
  );
}
