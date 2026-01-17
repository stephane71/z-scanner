/**
 * Scan Page Client Component
 * Story 3.2: Camera Capture UI - Task 7
 *
 * Main scanner interface for capturing ticket photos.
 * Handles capture flow: camera → compress → store → navigate
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CameraView } from '@/components/features/scanner';
import { compressTicketImage } from '@/lib/utils/image';
import { createClient } from '@/lib/supabase/client';
import { db } from '@/lib/db';
import type { Ticket, Photo } from '@/types';

/**
 * Generate SHA-256 hash for NF525 compliance
 * Hash is computed from: date + montantTTC + modeReglement + numeroTicket + userId
 */
async function generateDataHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * ScanPageClient - Camera scanner interface
 *
 * Flow:
 * 1. User captures photo with camera
 * 2. Compress image (WebP ~100KB + thumbnail ~10KB)
 * 3. Create draft ticket in Dexie
 * 4. Store photo linked to ticket
 * 5. Navigate to verification screen
 */
export function ScanPageClient() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
   * - Navigate to verification screen
   */
  const handleCapture = useCallback(
    async (blob: Blob) => {
      if (!userId) {
        setError('Utilisateur non authentifié');
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // 1. Compress image (WebP with JPEG fallback)
        const { original, thumbnail } = await compressTicketImage(blob);

        // 2. Create draft ticket with placeholder data
        // (Will be filled in verification screen via OCR or manual entry)
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

        // Generate hash for NF525 compliance (placeholder data)
        const hashInput = `${today}|0|draft|draft|${userId}`;
        const dataHash = await generateDataHash(hashInput);

        // Note: Dexie auto-generates the id field, so we omit it here
        const ticketData = {
          dataHash,
          date: today,
          montantTTC: 0, // Placeholder - to be filled in verification
          modeReglement: '', // Placeholder - to be filled in verification
          numeroTicket: '', // Placeholder - to be filled in verification
          userId,
          status: 'draft' as const,
          createdAt: now.toISOString(),
          clientTimestamp: now.toISOString(),
        } satisfies Omit<Ticket, 'id'>;

        // 3. Store ticket in Dexie (returns the new ID)
        const ticketId = await db.tickets.add(ticketData);

        // 4. Store photo linked to ticket
        const photoData: Omit<Photo, 'id'> = {
          ticketId: ticketId as number,
          blob: original,
          thumbnail,
          createdAt: now.toISOString(),
        };

        await db.photos.add(photoData as Photo);

        // 5. Navigate to verification screen
        // (Story 3.4 will implement /scan/verify/[id] route)
        router.push(`/scan/verify/${ticketId}`);
      } catch (err) {
        console.error('Capture processing failed:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Une erreur est survenue lors du traitement'
        );
      } finally {
        // Always reset processing state (even on success, in case navigation is delayed)
        setIsProcessing(false);
      }
    },
    [userId, router]
  );

  /**
   * Dismiss error and allow retry
   */
  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

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
