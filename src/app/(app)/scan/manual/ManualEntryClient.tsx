"use client";

/**
 * ManualEntryClient - Manual ticket entry screen
 * Story 3.5: Manual Entry Fallback
 *
 * Provides form interface for manually entering ticket data.
 * Used when OCR fails or user prefers manual entry.
 *
 * Flow:
 * 1. User fills form with ticket data
 * 2. On submit, creates new ticket in Dexie
 * 3. Navigates to verification screen for final review
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useManualEntry } from "@/hooks";
import {
  ManualEntryHeader,
  ManualEntryForm,
  ValidateButton,
} from "@/components/features/scanner";

export function ManualEntryClient() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

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
        } else {
          setAuthError("Utilisateur non authentifié");
        }
      } catch (err) {
        console.error("Failed to get user:", err);
        setAuthError("Erreur lors de la vérification de l'authentification");
      }
    }
    getUser();
  }, []);

  // Manual entry hook
  const { form, createTicket, isSaving, saveError, clearError } =
    useManualEntry({
      userId,
    });

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // Validate form before creating ticket
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    try {
      const ticketId = await createTicket();
      // Navigate to verification screen for final review
      router.push(`/scan/verify/${ticketId}`);
    } catch (error) {
      // Error is handled by hook (saveError state)
      console.error("Failed to create ticket:", error);
    }
  }, [form, createTicket, router]);

  // Show auth error
  if (authError) {
    return (
      <div className="h-dvh w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">{authError}</p>
          <Link
            href="/login"
            className="text-green-600 underline hover:text-green-700 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  // Show loading while fetching user
  if (!userId) {
    return (
      <div className="h-dvh w-full bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      {/* Header */}
      <ManualEntryHeader />

      {/* Form content */}
      <main className="flex-1 pb-28">
        <ManualEntryForm form={form} className="py-4" />

        {/* Error display */}
        {saveError && (
          <div
            className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{saveError}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
                aria-label="Fermer"
              >
                <svg
                  className="w-4 h-4"
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
      </main>

      {/* Fixed bottom button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 pb-safe">
        <ValidateButton
          onClick={handleSubmit}
          isValid={form.formState.isValid && !isSaving}
          isLoading={isSaving}
          label="CRÉER LE TICKET"
          loadingLabel="Création..."
        />
      </div>
    </div>
  );
}
