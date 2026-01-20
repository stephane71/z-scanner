'use client';

/**
 * ValidateButton - Large green validation button
 * Story 3.4: Verification Screen
 *
 * 80px height, green primary color per UX spec.
 * Position in thumb zone (bottom of screen).
 * Shows loading state during validation.
 * Disabled when form has validation errors.
 */

interface ValidateButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Whether form is valid and can be submitted */
  isValid?: boolean;
  /** Whether validation is in progress */
  isLoading?: boolean;
  /** Optional className for styling */
  className?: string;
  /** Button type */
  type?: 'button' | 'submit';
  /** Custom label text (default: "VALIDER") */
  label?: string;
  /** Loading label text (default: "Validation...") */
  loadingLabel?: string;
}

export function ValidateButton({
  onClick,
  isValid = true,
  isLoading = false,
  className = '',
  type = 'button',
  label = 'VALIDER',
  loadingLabel = 'Validation...',
}: ValidateButtonProps) {
  const isDisabled = !isValid || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full
        rounded-xl
        bg-green-600
        px-6
        text-xl
        font-bold
        uppercase
        tracking-wide
        text-white
        transition-all
        duration-200
        hover:bg-green-700
        focus:outline-none
        focus:ring-4
        focus:ring-green-500/50
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:active:scale-100
        ${className}
      `}
      style={{ height: '80px', minHeight: '80px' }}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-3">
          {/* Loading spinner */}
          <svg
            className="h-6 w-6 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingLabel}</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {/* Checkmark icon */}
          <svg
            className="h-6 w-6"
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
            />
          </svg>
          <span>{label}</span>
        </span>
      )}
    </button>
  );
}

export type { ValidateButtonProps };
