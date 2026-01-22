/**
 * CancelledBanner - Prominent banner for cancelled tickets
 * Story 4.2: Ticket Detail View
 *
 * Displays "Annulé" status with red styling, cancellation reason,
 * and timestamp. Shows clear indication that ticket is cancelled
 * per NF525 compliance (append-only, cancelled tickets remain visible).
 */

import { XCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format';

interface CancelledBannerProps {
  /** Reason for cancellation (required per NF525) */
  reason: string;
  /** ISO 8601 timestamp when ticket was cancelled */
  cancelledAt: string;
}

export function CancelledBanner({ reason, cancelledAt }: CancelledBannerProps) {
  return (
    <div
      className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
      data-testid="cancelled-banner"
      role="alert"
    >
      {/* Status badge */}
      <div className="flex items-center gap-2 mb-2">
        <XCircle
          className="w-5 h-5 text-red-600 flex-shrink-0"
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-red-700">
          Ticket annulé
        </span>
      </div>

      {/* Reason */}
      <p className="text-sm text-red-600 mb-1">
        <span className="font-medium">Motif :</span> {reason}
      </p>

      {/* Timestamp */}
      <p className="text-xs text-red-500">
        Annulé le {formatDateTime(cancelledAt)}
      </p>
    </div>
  );
}

export type { CancelledBannerProps };
