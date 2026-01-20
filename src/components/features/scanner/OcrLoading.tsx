'use client';

/**
 * OcrLoading Component
 * Displays loading state during OCR processing with timeout indicator
 */

import { useEffect, useState } from 'react';

/**
 * OCR timeout in milliseconds
 * Extended to 30s for Claude Vision API processing (see NFR-P1 deviation in Story 3.3)
 */
const OCR_TIMEOUT = 30000;

interface OcrLoadingProps {
  /** Custom message to display (default: "Analyse en cours...") */
  message?: string;
}

/**
 * Loading indicator for OCR processing
 * Shows animated spinner and progress bar for timeout
 */
export function OcrLoading({ message = 'Analyse en cours...' }: OcrLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    let animationFrameId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / OCR_TIMEOUT) * 100, 100);
      setProgress(newProgress);

      if (elapsed < OCR_TIMEOUT) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center p-8 space-y-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Animated spinner */}
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
      </div>

      {/* Message */}
      <p className="text-lg font-medium text-gray-700">{message}</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-green-600 h-full rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progression de l'analyse"
          />
        </div>
        <p className="text-sm text-gray-500 text-center mt-2">
          {progress < 100
            ? `${Math.round((OCR_TIMEOUT - (progress / 100) * OCR_TIMEOUT) / 1000)}s restantes`
            : 'Finalisation...'}
        </p>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">
        Analyse du ticket en cours. Veuillez patienter.
      </span>
    </div>
  );
}
