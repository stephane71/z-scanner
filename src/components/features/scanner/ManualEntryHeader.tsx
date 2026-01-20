'use client';

/**
 * ManualEntryHeader - Header for manual entry screen
 * Story 3.5: Manual Entry Fallback
 *
 * Displays "Saisie manuelle" title with back button.
 * Shows NF525 compliance badge for consistency with verification screen.
 */

import Link from 'next/link';

interface ManualEntryHeaderProps {
  /** Custom CSS class */
  className?: string;
}

/**
 * Back arrow icon
 */
function BackIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  );
}

/**
 * NF525 badge icon
 */
function NF525Badge() {
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded"
      title="Conforme NF525"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      <span>NF525</span>
    </div>
  );
}

export function ManualEntryHeader({ className = '' }: ManualEntryHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-10 bg-white border-b border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back button */}
        <Link
          href="/scan"
          className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Retour au scanner"
        >
          <BackIcon />
        </Link>

        {/* Title */}
        <h1 className="text-lg font-semibold text-gray-900">Saisie manuelle</h1>

        {/* NF525 badge */}
        <NF525Badge />
      </div>
    </header>
  );
}

export type { ManualEntryHeaderProps };
