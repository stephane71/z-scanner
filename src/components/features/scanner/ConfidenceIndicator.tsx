'use client';

/**
 * ConfidenceIndicator - Shows OCR confidence level
 * Story 3.4: Verification Screen
 *
 * Three states: high (green > 0.8), medium (yellow 0.5-0.8), low (red < 0.5).
 * Small badge/icon next to field with tooltip explaining confidence.
 */

interface ConfidenceIndicatorProps {
  /** Confidence score from 0 to 1 */
  confidence: number;
  /** Optional className for styling */
  className?: string;
  /** Show label text */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Get confidence level from score
 */
function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

/**
 * Get styling based on confidence level
 */
function getConfidenceStyles(level: ConfidenceLevel): {
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
  ariaLabel: string;
} {
  switch (level) {
    case 'high':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        borderColor: 'border-green-600',
        label: 'Élevée',
        ariaLabel: 'Confiance élevée (supérieure à 80%)',
      };
    case 'medium':
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600',
        borderColor: 'border-yellow-600',
        label: 'Moyenne',
        ariaLabel: 'Confiance moyenne (entre 50% et 80%)',
      };
    case 'low':
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-600',
        borderColor: 'border-red-600',
        label: 'Faible',
        ariaLabel: 'Confiance faible (inférieure à 50%)',
      };
  }
}

export function ConfidenceIndicator({
  confidence,
  className = '',
  showLabel = false,
  size = 'sm',
}: ConfidenceIndicatorProps) {
  const level = getConfidenceLevel(confidence);
  const styles = getConfidenceStyles(level);

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const containerSize = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full ${styles.bgColor} ${containerSize} ${className}`}
      role="status"
      aria-label={styles.ariaLabel}
      title={`${Math.round(confidence * 100)}% de confiance`}
    >
      {/* Icon based on confidence level */}
      {level === 'high' && (
        <svg
          className={`${iconSize} ${styles.textColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
      {level === 'medium' && (
        <svg
          className={`${iconSize} ${styles.textColor}`}
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
      )}
      {level === 'low' && (
        <svg
          className={`${iconSize} ${styles.textColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}

      {/* Optional label */}
      {showLabel && (
        <span className={`font-medium ${styles.textColor} ${fontSize}`}>
          {styles.label}
        </span>
      )}
    </div>
  );
}

/**
 * Helper to get border color class for form field highlighting
 */
export function getConfidenceBorderClass(confidence: number): string {
  const level = getConfidenceLevel(confidence);
  const styles = getConfidenceStyles(level);
  return styles.borderColor;
}

export type { ConfidenceIndicatorProps, ConfidenceLevel };
