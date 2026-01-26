'use client';

/**
 * EditMarketDialog - Sheet dialog for renaming a market
 * Story 4.5: Market Management (CRUD)
 *
 * Uses Sheet (bottom sheet on mobile) for editing market name.
 * Validates non-empty name before saving via updateMarketName().
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { updateMarketName } from '@/hooks';
import type { Market } from '@/types';

/** Market with guaranteed id (from database) */
type MarketWithId = Market & { id: number };

interface EditMarketDialogProps {
  market: MarketWithId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMarketDialog({ market, open, onOpenChange }: EditMarketDialogProps) {
  const [name, setName] = useState(market.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Le nom ne peut pas être vide');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await updateMarketName(market.id, trimmedName);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetTitle>Modifier le marché</SheetTitle>
        <SheetDescription>Renommez votre marché ou point de vente.</SheetDescription>

        <div className="px-4 py-2">
          <Input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            disabled={isSaving}
            aria-label="Nom du marché"
          />
          {error && (
            <p className="text-sm text-destructive mt-1">{error}</p>
          )}
        </div>

        <SheetFooter>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            Enregistrer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
