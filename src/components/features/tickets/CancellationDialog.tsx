/**
 * CancellationDialog - NF525-compliant ticket cancellation confirmation
 * Story 4.7: Ticket Cancellation (NF525 Compliant)
 *
 * Bottom sheet dialog for confirming ticket cancellation.
 * Requires a reason (mandatory per NF525 audit compliance).
 * Cancellation is append-only - tickets are never deleted.
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface CancellationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when cancellation is confirmed, receives the reason */
  onConfirm: (reason: string) => Promise<void>;
}

export function CancellationDialog({
  open,
  onOpenChange,
  onConfirm,
}: CancellationDialogProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trim reason for validation - whitespace-only is not valid
  const trimmedReason = reason.trim();
  const isReasonValid = trimmedReason.length > 0;

  const handleConfirm = async () => {
    if (!isReasonValid) return;

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(trimmedReason);
      // Clear state and close dialog on success
      setReason('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    if (isLoading) return;
    onOpenChange(false);
  };

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason('');
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Annuler ce ticket</SheetTitle>
          <SheetDescription asChild>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
              <AlertTriangle
                className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Attention</p>
                <p className="mt-1">
                  L'annulation est définitive et sera enregistrée pour la
                  conformité NF525. Le ticket restera visible dans l'historique
                  avec le statut "Annulé".
                </p>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 py-4">
          <Label htmlFor="cancellation-reason" className="text-sm font-medium">
            Raison de l'annulation <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="cancellation-reason"
            className="mt-2 w-full min-h-[100px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Entrez la raison de l'annulation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
            required
          />

          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              Erreur : {error}
            </p>
          )}
        </div>

        <SheetFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleDismiss}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isReasonValid || isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                  data-testid="cancellation-loading"
                />
                Annulation...
              </>
            ) : (
              "Confirmer l'annulation"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
