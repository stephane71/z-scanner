'use client';

/**
 * OcrError Component
 * Displays OCR error state with manual entry option
 */

import type { OcrError as OcrErrorType } from '@/lib/ocr/types';

interface OcrErrorProps {
  /** Error details */
  error: OcrErrorType;
  /** Callback when user wants to retry OCR */
  onRetry?: () => void;
  /** Callback when user wants to enter data manually */
  onManualEntry?: () => void;
  /** Whether retry is currently in progress */
  isRetrying?: boolean;
}

/**
 * Get appropriate icon for error type
 */
function ErrorIcon({ type }: { type: OcrErrorType['type'] }) {
  if (type === 'network_error' || type === 'timeout') {
    // Network/timeout icon
    return (
      <svg
        className="w-12 h-12 text-amber-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
        />
      </svg>
    );
  }

  if (type === 'low_confidence') {
    // Low confidence icon
    return (
      <svg
        className="w-12 h-12 text-amber-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    );
  }

  // Default error icon
  return (
    <svg
      className="w-12 h-12 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Get title based on error type
 */
function getErrorTitle(type: OcrErrorType['type']): string {
  switch (type) {
    case 'network_error':
      return 'Hors ligne';
    case 'timeout':
      return 'Analyse trop longue';
    case 'low_confidence':
      return 'Lecture difficile';
    case 'invalid_image':
      return 'Image invalide';
    case 'api_error':
    default:
      return "Erreur d'analyse";
  }
}

/**
 * OCR error display with retry and manual entry options
 */
export function OcrError({
  error,
  onRetry,
  onManualEntry,
  isRetrying = false,
}: OcrErrorProps) {
  const title = getErrorTitle(error.type);
  const showRetry = error.type !== 'low_confidence' && onRetry;
  const isPendingOcr = error.type === 'network_error' || error.type === 'timeout';

  return (
    <div
      className="flex flex-col items-center justify-center p-8 space-y-6"
      role="alert"
      aria-live="assertive"
    >
      {/* Error icon */}
      <ErrorIcon type={error.type} />

      {/* Error title */}
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>

      {/* Error message */}
      <p className="text-center text-gray-600 max-w-sm">{error.message}</p>

      {/* Pending OCR info */}
      {isPendingOcr && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-sm">
          <p className="text-sm text-blue-700 text-center">
            Le ticket sera analysé automatiquement lors de la prochaine connexion.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {showRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRetrying ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
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
                Réessai en cours...
              </span>
            ) : (
              'Réessayer'
            )}
          </button>
        )}

        {onManualEntry && (
          <button
            onClick={onManualEntry}
            className={`flex-1 px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              showRetry
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            Saisie manuelle
          </button>
        )}
      </div>

      {/* Help text for low confidence */}
      {error.type === 'low_confidence' && (
        <p className="text-sm text-gray-500 text-center max-w-sm">
          La qualité de l&apos;image ne permet pas une lecture fiable. Vous pouvez
          saisir les informations manuellement.
        </p>
      )}
    </div>
  );
}
