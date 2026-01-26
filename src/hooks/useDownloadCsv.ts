"use client";

/**
 * useDownloadCsv - Hook for downloading CSV files
 * Story 5.3: File Download
 *
 * Provides cross-platform file download functionality:
 * - iOS Safari: Uses Web Share API with file sharing
 * - Other browsers: Uses anchor element download trick
 *
 * Handles filename generation, blob creation, and error states.
 */

import { useState, useCallback } from "react";

/**
 * Result from useDownloadCsv hook
 */
export interface UseDownloadCsvResult {
  /** Trigger download of CSV file, returns true if successful */
  downloadCsv: (csv: string, startDate: string, endDate: string) => Promise<boolean>;
  /** Whether download is in progress */
  isDownloading: boolean;
  /** Error message if download failed */
  error: string | null;
}

/**
 * Generate filename for CSV export
 * Format: z-scanner_export_YYYY-MM-DD_YYYY-MM-DD.csv
 */
function generateFilename(startDate: string, endDate: string): string {
  return `z-scanner_export_${startDate}_${endDate}.csv`;
}

/**
 * Check if Web Share API is available and can share files
 */
function canUseWebShare(file: File): boolean {
  if (typeof navigator === "undefined") return false;
  if (!navigator.share || !navigator.canShare) return false;

  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/**
 * Download using anchor element (works on most browsers)
 */
function downloadWithAnchor(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Hook to download CSV files with cross-platform support
 */
export function useDownloadCsv(): UseDownloadCsvResult {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadCsv = useCallback(
    async (csv: string, startDate: string, endDate: string): Promise<boolean> => {
      setIsDownloading(true);
      setError(null);

      try {
        const filename = generateFilename(startDate, endDate);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

        // Try Web Share API first (iOS Safari)
        const file = new File([blob], filename, { type: "text/csv" });

        if (canUseWebShare(file)) {
          try {
            await navigator.share({ files: [file] });
            // Share succeeded
            return true;
          } catch (shareError) {
            // Check if user cancelled (AbortError) - not a real error
            if (shareError instanceof DOMException && shareError.name === "AbortError") {
              // User cancelled, that's fine - still considered success (not an error)
              return true;
            }
            // Rethrow other share errors
            throw shareError;
          }
        }

        // Fall back to anchor download
        downloadWithAnchor(blob, filename);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Download failed";
        setError(errorMessage);
        return false;
      } finally {
        setIsDownloading(false);
      }
    },
    []
  );

  return {
    downloadCsv,
    isDownloading,
    error,
  };
}
