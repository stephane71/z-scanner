/**
 * useOCR Hook for Z-Scanner
 * React hook for OCR processing with offline queue support
 */

import { useState, useCallback } from 'react';
import { processOcr, queueForOcr, isOcrError } from '@/lib/ocr';
import type { OcrResult, OcrStatus, OcrError } from '@/lib/ocr/types';
import { db } from '@/lib/db';

/**
 * Hook result interface
 */
export interface UseOcrResult {
  /** Process an image for OCR */
  processImage: (
    ticketId: number,
    imageBlob: Blob
  ) => Promise<OcrResult | null>;
  /** Whether OCR is currently processing */
  isProcessing: boolean;
  /** Error if OCR failed */
  error: OcrError | null;
  /** Current OCR status */
  status: OcrStatus | null;
  /** Clear the error state */
  clearError: () => void;
}

/**
 * React hook for OCR processing
 * Handles online/offline scenarios with queue fallback
 *
 * @returns UseOcrResult with processImage function and state
 *
 * @example
 * ```tsx
 * const { processImage, isProcessing, error, status } = useOCR();
 *
 * const handleCapture = async (ticketId: number, photo: Blob) => {
 *   const result = await processImage(ticketId, photo);
 *   if (result) {
 *     // Navigate to verification with OCR data
 *   } else if (status === 'pending_ocr') {
 *     // Offline - show manual entry option
 *   }
 * };
 * ```
 */
export function useOCR(): UseOcrResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<OcrError | null>(null);
  const [status, setStatus] = useState<OcrStatus | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const processImage = useCallback(
    async (
      ticketId: number,
      imageBlob: Blob
    ): Promise<OcrResult | null> => {
      setIsProcessing(true);
      setError(null);
      setStatus(null);

      try {
        // Check online status
        if (!navigator.onLine) {
          // Queue for later processing
          await queueForOcr(ticketId);

          // Update ticket status
          await db.tickets.update(ticketId, {
            ocrStatus: 'pending_ocr' as OcrStatus,
          });

          setStatus('pending_ocr');
          return null;
        }

        // Process immediately when online
        const result = await processOcr(imageBlob);

        // Update ticket with OCR results (Z-ticket data model)
        await db.tickets.update(ticketId, {
          ocrStatus: 'ocr_complete' as OcrStatus,
          ocrConfidence: result.confidence,
          // Z-ticket fields
          type: result.type ?? undefined,
          impressionDate: result.impressionDate ?? undefined,
          lastResetDate: result.lastResetDate ?? undefined,
          resetNumber: result.resetNumber ?? undefined,
          ticketNumber: result.ticketNumber ?? undefined,
          discountValue: result.discountValue ?? undefined,
          cancelValue: result.cancelValue ?? undefined,
          cancelNumber: result.cancelNumber ?? undefined,
          payments: result.payments.length > 0 ? result.payments : undefined,
          total: result.total ?? undefined,
        });

        setStatus('ocr_complete');
        return result;
      } catch (err) {
        // Handle OCR errors
        if (isOcrError(err)) {
          setError(err);

          // For timeout or network errors, queue for retry
          if (err.type === 'timeout' || err.type === 'network_error') {
            await queueForOcr(ticketId);
            await db.tickets.update(ticketId, {
              ocrStatus: 'pending_ocr' as OcrStatus,
            });
            setStatus('pending_ocr');
          } else {
            // For other errors, mark as failed
            await db.tickets.update(ticketId, {
              ocrStatus: 'ocr_failed' as OcrStatus,
            });
            setStatus('ocr_failed');
          }
        } else {
          // Unknown error
          const errorObj: OcrError = {
            type: 'api_error',
            message:
              err instanceof Error
                ? err.message
                : "Erreur lors de l'analyse du ticket",
          };
          setError(errorObj);

          await db.tickets.update(ticketId, {
            ocrStatus: 'ocr_failed' as OcrStatus,
          });
          setStatus('ocr_failed');
        }

        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    processImage,
    isProcessing,
    error,
    status,
    clearError,
  };
}
