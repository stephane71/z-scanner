/**
 * useManualEntry hook - Form state management for manual ticket entry
 * Story 3.5: Manual Entry Fallback
 *
 * Initializes an empty form for manual ticket data entry.
 * Shares validation schema with useVerification.
 */

import { useState, useCallback, useMemo } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { db } from '@/lib/db';
import { generateDataHash } from '@/lib/utils/hash';
import {
  TicketVerificationSchema,
  type TicketVerificationForm,
} from '@/lib/validation/ticket';

interface UseManualEntryOptions {
  /** User ID for ticket ownership */
  userId: string | null;
}

interface UseManualEntryResult {
  /** React Hook Form instance */
  form: UseFormReturn<TicketVerificationForm>;
  /** Create a new ticket with current form values */
  createTicket: () => Promise<number>;
  /** Whether form has changes from defaults */
  isDirty: boolean;
  /** Whether ticket is currently being saved */
  isSaving: boolean;
  /** Error message if save failed */
  saveError: string | null;
  /** Clear any save errors */
  clearError: () => void;
}

/**
 * Hook for manual entry form state management
 */
export function useManualEntry({
  userId,
}: UseManualEntryOptions): UseManualEntryResult {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Default values for manual entry (today's date, empty amounts)
  const defaultValues: TicketVerificationForm = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      type: 'STATISTIQUES' as const,
      impressionDate: today,
      lastResetDate: today,
      resetNumber: 0,
      ticketNumber: 1,
      discountValue: 0,
      cancelValue: 0,
      cancelNumber: 0,
      payments: [{ mode: 'CB' as const, value: 0 }],
      total: 0,
    };
  }, []);

  // Initialize React Hook Form with default values
  const form = useForm<TicketVerificationForm>({
    resolver: zodResolver(TicketVerificationSchema),
    defaultValues,
    mode: 'onBlur',
  });

  // Clear error state
  const clearError = useCallback(() => {
    setSaveError(null);
  }, []);

  // Create new ticket in Dexie
  const createTicket = useCallback(async (): Promise<number> => {
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const formData = form.getValues();
      const now = new Date();

      // Generate hash for NF525 compliance
      const hashInput = `${formData.impressionDate}|${formData.total}|${formData.type}|draft|${userId}`;
      const dataHash = await generateDataHash(hashInput);

      // Create new ticket with manual entry status
      const ticketId = (await db.tickets.add({
        // Technical fields
        dataHash,
        userId,
        status: 'draft',
        createdAt: now.toISOString(),
        clientTimestamp: now.toISOString(),
        ocrStatus: 'manual_entry',
        // Z-ticket data fields from form
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
      })) as number;

      // Reset form dirty state after successful save
      form.reset(formData);

      return ticketId;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la création du ticket';
      setSaveError(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [userId, form]);

  return {
    form,
    createTicket,
    isDirty: form.formState.isDirty,
    isSaving,
    saveError,
    clearError,
  };
}

export type { UseManualEntryOptions, UseManualEntryResult };
