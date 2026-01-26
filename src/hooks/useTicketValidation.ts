/**
 * useTicketValidation hook - Validates tickets with NF525 compliance
 * Story 3.6: Ticket Validation with NF525 Compliance
 * Story 3.7: Photo Archival - Adds photo to sync queue
 *
 * Handles:
 * - SHA-256 hash computation for ticket data
 * - Ticket status update to 'validated'
 * - Sync queue entry for offline support (ticket + photo)
 * - Haptic feedback on success
 */

import { useState, useCallback } from 'react';
import { db } from '@/lib/db';
import { computeTicketHash } from '@/lib/crypto';
import { triggerHaptic } from '@/lib/utils/haptic';
import type { TicketVerificationForm } from '@/lib/validation/ticket';
import type { TicketStatus } from '@/types';

interface UseTicketValidationResult {
  /** Validate a ticket with NF525 compliance */
  validateTicket: (
    ticketId: number,
    formData: TicketVerificationForm,
    userId: string
  ) => Promise<void>;
  /** Whether validation is in progress */
  isValidating: boolean;
  /** Error message if validation failed */
  validationError: string | null;
  /** Whether validation succeeded */
  validationSuccess: boolean;
  /** Reset validation state */
  resetValidation: () => void;
}

/**
 * Hook for validating tickets with NF525 compliance
 *
 * @returns Validation methods and state
 *
 * @example
 * ```tsx
 * const { validateTicket, isValidating, validationSuccess } = useTicketValidation();
 *
 * const handleValidate = async () => {
 *   await validateTicket(ticketId, formData, userId);
 *   // On success, validationSuccess will be true
 * };
 * ```
 */
export function useTicketValidation(): UseTicketValidationResult {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState(false);

  /**
   * Validate a ticket with NF525 compliance
   *
   * This function:
   * 1. Verifies ticket exists and is in 'draft' status
   * 2. Computes SHA-256 hash of ticket data
   * 3. Updates ticket with hash, status, and timestamps
   * 4. Adds entry to sync queue for offline support
   * 5. Triggers haptic feedback
   */
  const validateTicket = useCallback(
    async (
      ticketId: number,
      formData: TicketVerificationForm,
      userId: string
    ) => {
      setIsValidating(true);
      setValidationError(null);
      setValidationSuccess(false);

      try {
        // Use transaction for atomicity
        // Story 3.7: Include photos table for photo sync queue entry
        await db.transaction('rw', [db.tickets, db.syncQueue, db.photos], async () => {
          // 1. Verify ticket exists and is in draft status
          const ticket = await db.tickets.get(ticketId);
          if (!ticket) {
            throw new Error(`Ticket ${ticketId} introuvable`);
          }
          if (ticket.status !== 'draft') {
            throw new Error('Ce ticket a déjà été validé ou annulé');
          }

          // 2. Compute SHA-256 hash
          const dataHash = computeTicketHash({
            impressionDate: formData.impressionDate,
            total: formData.total,
            payments: formData.payments,
            ticketNumber: formData.ticketNumber,
            userId,
          });

          // 3. Generate client timestamp
          // Note: Server timestamp will be added during sync (Story 3.9)
          // For now, validatedAt uses client time; sync will add serverValidatedAt
          const clientTimestamp = new Date().toISOString();
          const validatedAt = clientTimestamp;

          // 4. Update ticket (make immutable)
          await db.tickets.update(ticketId, {
            // Form data
            type: formData.type,
            impressionDate: formData.impressionDate,
            lastResetDate: formData.lastResetDate,
            resetNumber: formData.resetNumber,
            ticketNumber: formData.ticketNumber,
            discountValue: formData.discountValue,
            cancelValue: formData.cancelValue,
            cancelNumber: formData.cancelNumber,
            payments: formData.payments,
            total: formData.total,
            // Market assignment (Story 4.6)
            marketId: formData.marketId,
            // Validation data
            status: 'validated' as TicketStatus,
            dataHash,
            validatedAt,
            clientTimestamp,
          });

          // 5. Add to sync queue for later upload
          await db.syncQueue.add({
            entityType: 'ticket',
            entityId: ticketId,
            action: 'validate',
            payload: JSON.stringify({
              dataHash,
              validatedAt,
              formData,
            }),
            status: 'pending',
            retries: 0,
            createdAt: clientTimestamp,
          });

          // 6. Story 3.7: Add photo to sync queue for cloud backup
          const photo = await db.photos.where('ticketId').equals(ticketId).first();
          if (photo && photo.id) {
            const storagePath = `${userId}/${ticketId}/${photo.id}.webp`;
            await db.syncQueue.add({
              entityType: 'photo',
              entityId: photo.id,
              action: 'create',
              payload: JSON.stringify({
                ticketId,
                userId,
                storagePath,
              }),
              status: 'pending',
              retries: 0,
              createdAt: clientTimestamp,
            });
          }
        });

        // 7. Trigger haptic feedback
        triggerHaptic('success');

        setValidationSuccess(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erreur lors de la validation';
        setValidationError(message);
        throw error;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  /**
   * Reset validation state
   * Call this when navigating away or starting a new validation
   */
  const resetValidation = useCallback(() => {
    setIsValidating(false);
    setValidationError(null);
    setValidationSuccess(false);
  }, []);

  return {
    validateTicket,
    isValidating,
    validationError,
    validationSuccess,
    resetValidation,
  };
}

export type { UseTicketValidationResult };
