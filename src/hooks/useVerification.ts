/**
 * useVerification hook - Form state management for verification screen
 * Story 3.4: Verification Screen
 *
 * Loads ticket data from Dexie by ID, loads photo, handles form state.
 * Uses react-hook-form's `values` prop for reactive synchronization.
 */

import { useMemo, useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/db";
import {
  TicketVerificationSchema,
  type TicketVerificationForm,
} from "@/lib/validation/ticket";
import type { Ticket, Photo, OcrConfidence } from "@/types";

interface UseVerificationOptions {
  /** Ticket ID to load */
  ticketId: number;
}

interface UseVerificationResult {
  /** Loaded ticket data (undefined while loading) */
  ticket: Ticket | undefined;
  /** Loaded photo data (undefined while loading) */
  photo: Photo | undefined;
  /** Whether ticket is loading */
  isLoading: boolean;
  /** Whether ticket was not found */
  notFound: boolean;
  /** React Hook Form instance */
  form: UseFormReturn<TicketVerificationForm>;
  /** Update ticket with current form values */
  updateTicket: () => Promise<void>;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Whether form is currently being saved */
  isSaving: boolean;
  /** Error message if save failed */
  saveError: string | null;
  /** OCR confidence scores for highlighting fields */
  confidence: OcrConfidence | null;
}

/**
 * Hook for verification screen state management
 */
export function useVerification({
  ticketId,
}: UseVerificationOptions): UseVerificationResult {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load ticket from Dexie
  const ticket = useLiveQuery(async () => {
    if (ticketId <= 0) return undefined;
    return db.tickets.get(ticketId);
  }, [ticketId]);

  // Load photo for ticket
  const photo = useLiveQuery(async () => {
    if (ticketId <= 0) return undefined;
    return db.photos.where("ticketId").equals(ticketId).first();
  }, [ticketId]);

  // Track if initial load is complete
  const isLoading = ticket === undefined && ticketId > 0;
  const notFound = ticket === null || (ticket === undefined && ticketId <= 0);

  // Default empty form values (used before ticket loads)
  const defaultValues: TicketVerificationForm = useMemo(
    () => ({
      type: "STATISTIQUES" as const,
      impressionDate: new Date().toISOString().split("T")[0],
      lastResetDate: new Date().toISOString().split("T")[0],
      resetNumber: 0,
      ticketNumber: 1,
      discountValue: 0,
      cancelValue: 0,
      cancelNumber: 0,
      payments: [{ mode: "CB" as const, value: 0 }],
      total: 0,
    }),
    [],
  );

  // Compute form values from ticket data (reactive)
  // This is passed to useForm's `values` prop for automatic sync
  const ticketFormValues: TicketVerificationForm | undefined = useMemo(() => {
    if (!ticket) return undefined;

    return {
      type: "STATISTIQUES" as const,
      impressionDate:
        ticket.impressionDate || new Date().toISOString().split("T")[0],
      lastResetDate:
        ticket.lastResetDate || new Date().toISOString().split("T")[0],
      resetNumber: ticket.resetNumber ?? 0,
      ticketNumber: ticket.ticketNumber ?? 1,
      discountValue: ticket.discountValue ?? 0,
      cancelValue: ticket.cancelValue ?? 0,
      cancelNumber: ticket.cancelNumber ?? 0,
      payments:
        ticket.payments && ticket.payments.length > 0
          ? ticket.payments.map((p) => ({ mode: p.mode, value: p.value }))
          : [{ mode: "CB" as const, value: 0 }],
      total: ticket.total ?? 0,
    };
  }, [ticket]);

  // Initialize React Hook Form with `values` prop for reactive sync
  // See: https://react-hook-form.com/docs/useform (values prop section)
  const form = useForm<TicketVerificationForm>({
    resolver: zodResolver(TicketVerificationSchema),
    defaultValues,
    values: ticketFormValues, // Reactive: form updates when ticketFormValues changes
    resetOptions: {
      keepDirtyValues: true, // Preserve user edits if they've modified the form
    },
    mode: "onBlur",
  });

  // Extract OCR confidence scores
  const confidence = useMemo((): OcrConfidence | null => {
    if (ticket?.ocrConfidence) {
      return ticket.ocrConfidence;
    }
    return null;
  }, [ticket]);

  // Save ticket updates
  const updateTicket = useCallback(async () => {
    if (!ticket?.id) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      const formData = form.getValues();

      // Update ticket in Dexie
      await db.tickets.update(ticket.id, {
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
        ocrStatus: "pending_validation",
      });

      // Reset form dirty state after successful save
      form.reset(formData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur lors de la sauvegarde";
      setSaveError(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [ticket, form]);

  return {
    ticket,
    photo,
    isLoading,
    notFound,
    form,
    updateTicket,
    isDirty: form.formState.isDirty,
    isSaving,
    saveError,
    confidence,
  };
}

export type { UseVerificationOptions, UseVerificationResult };
