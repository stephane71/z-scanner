"use client";

/**
 * VerifyPageClient - Client Component for Verification Screen
 * Story 3.4: Verification Screen
 *
 * Displays ticket data for user verification before validation.
 * Uses useVerification hook for form state, VerificationForm for editable fields.
 * Shows photo thumbnail, total in hero size, editable fields with confidence indicators.
 */

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVerification } from "@/hooks";
import {
  VerificationForm,
  VerificationHeader,
  ValidateButton,
} from "@/components/features/scanner";

interface VerifyPageClientProps {
  ticketId: number;
}

export function VerifyPageClient({ ticketId }: VerifyPageClientProps) {
  const router = useRouter();
  const [isPhotoFullscreen, setIsPhotoFullscreen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Use the verification hook for form state management
  const {
    ticket,
    photo,
    isLoading,
    notFound,
    form,
    updateTicket,
    isDirty,
    isSaving,
    saveError,
    confidence,
  } = useVerification({ ticketId });

  // Create object URL for photo blob
  const photoUrl = useMemo(() => {
    if (photo?.blob) {
      return URL.createObjectURL(photo.blob);
    }
    return null;
  }, [photo?.blob]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  // Handle invalid ticket ID
  useEffect(() => {
    if (ticketId <= 0) {
      router.push("/scan");
    }
  }, [ticketId, router]);

  // Handle ticket not found or already validated
  useEffect(() => {
    if (notFound) {
      router.push("/scan");
    } else if (ticket && ticket.status !== "draft") {
      router.push("/scan");
    }
  }, [ticket, notFound, router]);

  // Handle form validation and save
  const handleValidate = useCallback(async () => {
    // Trigger form validation
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    setIsValidating(true);
    try {
      // Save form data to Dexie
      await updateTicket();
      // Navigate back to scan (Story 3.6 will add actual validation)
      router.push("/scan");
    } catch (error) {
      // Error is handled by useVerification hook (saveError)
    } finally {
      setIsValidating(false);
    }
  }, [form, updateTicket, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  // Ticket not found or invalid (will redirect)
  if (notFound || !ticket || ticket.status !== "draft") {
    return null;
  }

  // Check if form has validation errors
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header with back button and NF525 badge */}
      <VerificationHeader onBack={() => router.push("/scan")} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {/* Photo thumbnail - click to view fullscreen */}
        {photoUrl && (
          <div className="px-4 pt-4">
            <button
              onClick={() => setIsPhotoFullscreen(true)}
              className="mb-4 w-full overflow-hidden rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Voir la photo en plein écran"
            >
              <img
                src={photoUrl}
                alt="Photo du ticket"
                className="h-32 w-full object-cover"
              />
            </button>
          </div>
        )}

        {/* Fullscreen photo overlay */}
        {isPhotoFullscreen && photoUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            onClick={() => setIsPhotoFullscreen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsPhotoFullscreen(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              aria-label="Fermer"
            >
              <svg
                className="h-6 w-6"
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
            {/* Full size image */}
            <img
              src={photoUrl}
              alt="Photo du ticket en plein écran"
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Verification Form with all editable fields */}
        <VerificationForm
          form={form}
          confidence={confidence}
          className="py-4"
        />

        {/* Save error display */}
        {saveError && (
          <div className="mx-4 mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {saveError}
          </div>
        )}
      </main>

      {/* Validate Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <ValidateButton
          onClick={handleValidate}
          isLoading={isValidating || isSaving}
          isValid={!hasErrors}
        />
        {isDirty && !hasErrors && (
          <p className="mt-2 text-center text-xs text-gray-500">
            Modifications non enregistrées
          </p>
        )}
      </div>
    </div>
  );
}
