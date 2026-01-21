'use client';

/**
 * ValidationSuccess - Success animation overlay after ticket validation
 * Story 3.6: Ticket Validation with NF525 Compliance
 *
 * Displays:
 * - Animated checkmark with green circle
 * - "Conforme NF525" message
 * - Validation timestamp
 * - Auto-redirects after 2 seconds (configurable)
 */

import { useEffect, useMemo } from 'react';

/** Constant for auto-redirect delay (ms) */
export const VALIDATION_SUCCESS_DELAY = 2000;

interface ValidationSuccessProps {
  /** Callback when auto-redirect timer completes */
  onComplete: () => void;
  /** Auto-redirect delay in milliseconds (default: 2000) */
  autoRedirectDelay?: number;
  /** Optional timestamp override for testing */
  timestamp?: Date;
}

export function ValidationSuccess({
  onComplete,
  autoRedirectDelay = VALIDATION_SUCCESS_DELAY,
  timestamp,
}: ValidationSuccessProps) {
  // Use provided timestamp or current time
  const validatedAt = useMemo(() => timestamp ?? new Date(), [timestamp]);

  // Format timestamp for display (French locale)
  const formattedTimestamp = useMemo(() => {
    return validatedAt.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [validatedAt]);

  // Auto-redirect timer
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, autoRedirectDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete, autoRedirectDelay]);

  return (
    <div
      data-testid="validation-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      role="alert"
      aria-live="polite"
      aria-label="Ticket validé avec succès"
    >
      <div className="text-center px-4">
        {/* Animated checkmark in green circle */}
        <div
          data-testid="checkmark-container"
          className="mx-auto mb-6 flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-green-100"
        >
          <svg
            className="h-12 w-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* NF525 Badge */}
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2">
          <svg
            className="h-5 w-5 text-blue-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="text-sm font-semibold text-blue-700">NF525</span>
        </div>

        {/* Success message */}
        <p className="mb-2 text-xl font-bold text-green-600">Conforme NF525</p>
        <p className="mb-4 text-base text-gray-600">Ticket validé et archivé</p>

        {/* Validation timestamp */}
        <p
          data-testid="validation-timestamp"
          className="text-sm text-gray-400"
        >
          {formattedTimestamp}
        </p>
      </div>
    </div>
  );
}

export type { ValidationSuccessProps };
