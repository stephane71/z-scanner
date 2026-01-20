'use client';

/**
 * VerificationHeader - Header for verification screen
 * Story 3.4: Verification Screen
 *
 * Displays back button, "Vérification" title, and NF525 badge.
 * Follows UX specification for header layout.
 */

interface VerificationHeaderProps {
  /** Callback when back button is clicked */
  onBack: () => void;
}

export function VerificationHeader({ onBack }: VerificationHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
        aria-label="Retour"
      >
        <svg
          className="h-6 w-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Title */}
      <h1 className="text-lg font-semibold text-gray-900">Vérification</h1>

      {/* NF525 Badge */}
      <div className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1">
        <svg
          className="h-4 w-4 text-blue-700"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs font-medium text-blue-700">NF525</span>
      </div>
    </header>
  );
}

export type { VerificationHeaderProps };
