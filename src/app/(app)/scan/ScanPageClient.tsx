/**
 * Scan Page Client Component
 * Story 3.2: Camera Capture UI - Task 7
 * Story 3.3: OCR Processing (Claude Haiku 4.5 API)
 *
 * Main scanner interface for capturing ticket photos.
 * Handles capture flow: camera → compress → store → OCR → navigate
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CameraView, OcrLoading, OcrError } from '@/components/features/scanner';
import { compressTicketImage } from '@/lib/utils/image';
import { generateDataHash } from '@/lib/utils/hash';
import { createClient } from '@/lib/supabase/client';
import { db } from '@/lib/db';
import { useOCR } from '@/hooks';
import type { Ticket, Photo } from '@/types';
import type { OcrError as OcrErrorType } from '@/lib/ocr/types';

/**
 * UI state for scan flow
 */
type ScanState =
  | 'camera' // Showing camera viewfinder
  | 'compressing' // Compressing captured image
  | 'ocr' // Running OCR processing
  | 'ocr_error'; // OCR failed, showing error

/**
 * ScanPageClient - Camera scanner interface
 *
 * Flow:
 * 1. User captures photo with camera
 * 2. Compress image (WebP ~100KB + thumbnail ~10KB)
 * 3. Create draft ticket in Dexie
 * 4. Store photo linked to ticket
 * 5. Run OCR processing (if online) or queue for later
 * 6. Navigate to verification screen
 */
export function ScanPageClient() {
  const router = useRouter();
  const [scanState, setScanState] = useState<ScanState>('camera');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<OcrErrorType | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentTicketId, setCurrentTicketId] = useState<number | null>(null);
  const [currentPhotoBlob, setCurrentPhotoBlob] = useState<Blob | null>(null);

  // OCR hook
  const { processImage, isProcessing: isOcrProcessing } = useOCR();

  // Get current user on mount
  useEffect(() => {
    async function getUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error('Failed to get user:', err);
      }
    }
    getUser();
  }, []);

  /**
   * Handle captured image from camera
   * - Compress image to WebP
   * - Create draft ticket
   * - Store photo in IndexedDB
   * - Run OCR processing
   * - Navigate to verification screen
   */
  const handleCapture = useCallback(
    async (blob: Blob) => {
      if (!userId) {
        setError('Utilisateur non authentifié');
        return;
      }

      setIsProcessing(true);
      setScanState('compressing');
      setError(null);
      setOcrError(null);

      try {
        // 1. Compress image (WebP with JPEG fallback)
        const { original, thumbnail } = await compressTicketImage(blob);

        // 2. Create draft ticket with placeholder data (Z-ticket model)
        // (Will be filled with OCR results or manual entry)
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

        // Generate hash for NF525 compliance (placeholder data)
        const hashInput = `${today}|0|STATISTIQUES|draft|${userId}`;
        const dataHash = await generateDataHash(hashInput);

        // Note: Dexie auto-generates the id field, so we omit it here
        // Z-ticket data model with placeholder values
        const ticketData: Omit<Ticket, 'id'> = {
          // Technical fields
          dataHash,
          userId,
          status: 'draft',
          createdAt: now.toISOString(),
          clientTimestamp: now.toISOString(),
          ocrStatus: 'pending_ocr',
          // Z-ticket data fields (placeholders - to be filled by OCR or manual entry)
          type: 'STATISTIQUES',
          impressionDate: today,
          lastResetDate: today,
          resetNumber: 0,
          ticketNumber: 0,
          discountValue: 0,
          cancelValue: 0,
          cancelNumber: 0,
          payments: [],
          total: 0,
        };

        // 3. Store ticket in Dexie (returns the new ID)
        const ticketId = (await db.tickets.add(ticketData)) as number;

        // 4. Store photo linked to ticket
        const photoData: Omit<Photo, 'id'> = {
          ticketId,
          blob: original,
          thumbnail,
          createdAt: now.toISOString(),
        };

        await db.photos.add(photoData as Photo);

        // Store for potential retry
        setCurrentTicketId(ticketId);
        setCurrentPhotoBlob(original);

        // 5. Run OCR processing
        setScanState('ocr');
        const ocrResult = await processImage(ticketId, original);

        if (ocrResult) {
          // OCR succeeded - navigate to verification with data
          router.push(`/scan/verify/${ticketId}`);
        } else {
          // OCR failed or offline - check if queued
          // Navigate to verification anyway (user can do manual entry)
          router.push(`/scan/verify/${ticketId}`);
        }
      } catch (err) {
        console.error('Capture processing failed:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Une erreur est survenue lors du traitement'
        );
        setScanState('camera');
      } finally {
        // Always reset processing state (even on success, in case navigation is delayed)
        setIsProcessing(false);
      }
    },
    [userId, router, processImage]
  );

  /**
   * Handle OCR retry
   */
  const handleOcrRetry = useCallback(async () => {
    if (!currentTicketId || !currentPhotoBlob) {
      setScanState('camera');
      return;
    }

    setScanState('ocr');
    setOcrError(null);

    try {
      const ocrResult = await processImage(currentTicketId, currentPhotoBlob);

      if (ocrResult) {
        router.push(`/scan/verify/${currentTicketId}`);
      } else {
        // Still failed - show error or navigate to manual entry
        router.push(`/scan/verify/${currentTicketId}`);
      }
    } catch {
      // Navigate to verification for manual entry
      router.push(`/scan/verify/${currentTicketId}`);
    }
  }, [currentTicketId, currentPhotoBlob, processImage, router]);

  /**
   * Handle manual entry selection from OcrError
   * Navigates to /scan/manual for fresh manual entry
   */
  const handleManualEntry = useCallback(() => {
    router.push('/scan/manual');
  }, [router]);

  /**
   * Dismiss error and allow retry
   */
  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  // Render based on scan state
  if (scanState === 'ocr' || isOcrProcessing) {
    return (
      <div className="h-dvh w-full bg-white flex items-center justify-center">
        <OcrLoading message="Analyse du ticket..." />
      </div>
    );
  }

  if (scanState === 'ocr_error' && ocrError) {
    return (
      <div className="h-dvh w-full bg-white flex items-center justify-center">
        <OcrError
          error={ocrError}
          onRetry={handleOcrRetry}
          onManualEntry={handleManualEntry}
          isRetrying={isOcrProcessing}
        />
      </div>
    );
  }

  if (scanState === 'compressing') {
    return (
      <div className="h-dvh w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white" />
          <p className="text-white text-sm">Traitement de l&apos;image...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full bg-black">
      {/* Camera viewfinder */}
      <CameraView onCapture={handleCapture} isProcessing={isProcessing} />

      {/* Error toast */}
      {error && (
        <div
          className="fixed bottom-20 left-4 right-4 z-50"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={handleDismissError}
              className="ml-4 text-white/80 hover:text-white"
              aria-label="Fermer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
