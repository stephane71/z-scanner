'use client';

/**
 * DeleteMarketDialog - AlertDialog for confirming market deletion
 * Story 4.5: Market Management (CRUD)
 *
 * NF525 Compliance: Markets are NEVER truly deleted.
 * Uses soft-delete (sets deletedAt timestamp) via deleteMarket().
 */

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteMarket } from '@/hooks';
import type { Market } from '@/types';

/** Market with guaranteed id (from database) */
type MarketWithId = Market & { id: number };

interface DeleteMarketDialogProps {
  market: MarketWithId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMarketDialog({ market, open, onOpenChange }: DeleteMarketDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setIsDeleting(true);
    setError('');
    try {
      await deleteMarket(market.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le marché</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer « {market.name} » ?
            Les données seront conservées pour la conformité fiscale.
          </AlertDialogDescription>
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
