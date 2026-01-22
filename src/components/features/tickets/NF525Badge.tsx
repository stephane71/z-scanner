/**
 * NF525Badge - Trust badge for validated tickets
 * Story 4.1: Ticket List (Historique)
 *
 * Displays a blue badge indicating NF525 compliance.
 * Uses blue-700/blue-50 per UX spec "trust color" (#1D4ED8).
 * Note: blue-700 is a Tailwind theme token, not a hardcoded color.
 * Compact design for list view.
 */

import { ShieldCheck } from 'lucide-react';

export function NF525Badge() {
  return (
    <span
      data-testid="nf525-badge"
      className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded"
      title="Conforme NF525"
      aria-label="Conforme NF525"
    >
      <ShieldCheck className="w-3 h-3" aria-hidden="true" />
      <span>NF525</span>
    </span>
  );
}
