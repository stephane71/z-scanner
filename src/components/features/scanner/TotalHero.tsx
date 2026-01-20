'use client';

/**
 * TotalHero - Displays total amount in hero size
 * Story 3.4: Verification Screen
 *
 * Shows the TOTAL TTC in 36px hero size per UX spec.
 * Includes confidence indicator when OCR confidence is below threshold.
 */

interface TotalHeroProps {
  /** Total amount in centimes */
  total: number;
  /** OCR confidence score (0-1), optional */
  confidence?: number;
  /** Optional className for styling */
  className?: string;
}

/**
 * Format centimes to French currency display
 */
function formatCurrency(centimes: number): string {
  return (centimes / 100).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Get confidence level from score
 */
function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

/**
 * Get confidence color classes
 */
function getConfidenceStyles(level: 'high' | 'medium' | 'low'): {
  textColor: string;
  bgColor: string;
  label: string;
} {
  switch (level) {
    case 'high':
      return {
        textColor: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Confiance élevée',
      };
    case 'medium':
      return {
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: 'Confiance moyenne',
      };
    case 'low':
      return {
        textColor: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Confiance faible',
      };
  }
}

export function TotalHero({
  total,
  confidence,
  className = '',
}: TotalHeroProps) {
  const showConfidence = confidence !== undefined && confidence < 0.8;
  const confidenceLevel = confidence !== undefined ? getConfidenceLevel(confidence) : null;
  const confidenceStyles = confidenceLevel ? getConfidenceStyles(confidenceLevel) : null;

  return (
    <div className={`flex flex-col items-center py-6 ${className}`}>
      {/* Label */}
      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        TOTAL TTC
      </span>

      {/* Total amount - 36px hero size per UX spec */}
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="text-4xl font-bold text-gray-900"
          style={{ fontSize: '36px' }}
          aria-label={`Total: ${formatCurrency(total)} euros`}
        >
          {formatCurrency(total)}
        </span>
        <span className="text-2xl font-semibold text-gray-600">€</span>
      </div>

      {/* Confidence indicator - only show if below high threshold */}
      {showConfidence && confidenceStyles && (
        <div
          className={`mt-3 flex items-center gap-2 px-3 py-1 rounded-full ${confidenceStyles.bgColor}`}
          role="status"
          aria-label={confidenceStyles.label}
        >
          {/* Warning icon for medium/low confidence */}
          <svg
            className={`h-4 w-4 ${confidenceStyles.textColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className={`text-sm font-medium ${confidenceStyles.textColor}`}>
            {confidenceStyles.label}
          </span>
        </div>
      )}
    </div>
  );
}

export type { TotalHeroProps };
