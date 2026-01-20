'use client';

/**
 * PhotoThumbnail - Displays ticket photo thumbnail
 * Story 3.4: Verification Screen
 *
 * Shows the captured ticket photo as a thumbnail.
 * Handles loading states and blob URL management.
 */

import { useMemo, useEffect, useState } from 'react';

interface PhotoThumbnailProps {
  /** Photo blob to display */
  blob: Blob | null;
  /** Alt text for the image */
  alt?: string;
  /** Optional className for styling */
  className?: string;
}

export function PhotoThumbnail({
  blob,
  alt = 'Photo du ticket',
  className = '',
}: PhotoThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Create object URL for blob
  const photoUrl = useMemo(() => {
    if (blob) {
      return URL.createObjectURL(blob);
    }
    return null;
  }, [blob]);

  // Cleanup object URL on unmount or when blob changes
  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle image error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Reset states when blob changes
  useEffect(() => {
    if (blob) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [blob]);

  // No photo available
  if (!photoUrl) {
    return (
      <div
        className={`flex h-32 items-center justify-center rounded-lg bg-gray-100 ${className}`}
        role="img"
        aria-label="Aucune photo disponible"
      >
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${className}`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="flex h-32 items-center justify-center bg-gray-100"
          role="alert"
        >
          <div className="text-center">
            <svg
              className="mx-auto h-8 w-8 text-red-400"
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
            <p className="mt-1 text-sm text-gray-500">Erreur de chargement</p>
          </div>
        </div>
      )}

      {/* Image */}
      <img
        src={photoUrl}
        alt={alt}
        className={`h-32 w-full object-cover ${isLoading || hasError ? 'invisible' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

export type { PhotoThumbnailProps };
