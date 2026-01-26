'use client';

/**
 * MarketPicker - Sheet picker for selecting a market
 * Story 4.6: Assign Ticket to Market
 *
 * Bottom sheet picker that displays list of markets.
 * Includes quick-add form for creating new markets inline.
 * Uses useMarkets hook for reactive market list.
 */

import { useState } from 'react';
import { MapPin, Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { useMarkets, addMarket, queueCreate } from '@/hooks';
import type { Market } from '@/types';

/** Market with guaranteed id (from database) */
type MarketWithId = Market & { id: number };

export interface MarketPickerProps {
  /** Whether the picker sheet is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when a market is selected */
  onSelect: (marketId: number | undefined) => void;
  /** Currently selected market ID */
  selectedMarketId: number | undefined;
  /** User ID for fetching markets */
  userId: string;
}

export function MarketPicker({
  open,
  onOpenChange,
  onSelect,
  selectedMarketId,
  userId,
}: MarketPickerProps) {
  const { markets, isLoading } = useMarkets(userId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMarketName, setNewMarketName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Sort markets alphabetically by name
  const sortedMarkets = markets
    ? [...markets].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  function handleSelect(marketId: number | undefined) {
    onSelect(marketId);
    onOpenChange(false);
  }

  async function handleCreateMarket() {
    const trimmedName = newMarketName.trim();
    if (!trimmedName) {
      setCreateError('Le nom ne peut pas être vide');
      return;
    }

    setIsCreating(true);
    setCreateError('');
    try {
      const createdAt = new Date().toISOString();
      const marketId = await addMarket({ name: trimmedName, userId, createdAt });
      await queueCreate('market', marketId, { name: trimmedName, userId, createdAt });

      // Auto-select the newly created market
      setNewMarketName('');
      onSelect(marketId);
      onOpenChange(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[70vh] overflow-y-auto px-4 [&>button:last-child]:hidden"
      >
        {/* Custom header with title and close button on same row */}
        <div className="flex items-center justify-between py-4">
          <SheetTitle>Sélectionner un marché</SheetTitle>
          <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-5 w-5" />
            <span className="sr-only">Fermer</span>
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">
          Choisissez un marché pour associer ce ticket
        </SheetDescription>

        <div className="flex flex-col gap-2 pb-4">
          {/* Loading state */}
          {isLoading && (
            <div
              data-testid="market-picker-loading"
              className="flex items-center justify-center py-8"
            >
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            </div>
          )}

          {/* "No market" option */}
          {!isLoading && (
            <button
              type="button"
              onClick={() => handleSelect(undefined)}
              data-selected={selectedMarketId === undefined}
              className="flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <span className="text-gray-600">Aucun marché</span>
              {selectedMarketId === undefined && (
                <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
              )}
            </button>
          )}

          {/* Markets list */}
          {!isLoading && sortedMarkets.length > 0 && (
            <>
              {sortedMarkets.map((market) => (
                <button
                  key={market.id}
                  type="button"
                  onClick={() => handleSelect((market as MarketWithId).id)}
                  data-selected={selectedMarketId === (market as MarketWithId).id}
                  className="flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <span>{market.name}</span>
                  </span>
                  {selectedMarketId === (market as MarketWithId).id && (
                    <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
                  )}
                </button>
              ))}
            </>
          )}

          {/* Empty state */}
          {!isLoading && sortedMarkets.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">
              Aucun marché créé
            </p>
          )}

          {/* Divider */}
          <div className="my-2 border-t border-gray-200" />

          {/* Add market button - reveals quick-add form (AC #4) */}
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex h-12 w-full items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 text-left text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Ajouter un marché</span>
            </button>
          )}

          {/* Quick-add form - revealed when button clicked */}
          {showAddForm && (
            <div className="flex gap-2">
              <Input
                type="text"
                value={newMarketName}
                onChange={(e) => {
                  setNewMarketName(e.target.value);
                  if (createError) setCreateError('');
                }}
                placeholder="Nom du marché"
                disabled={isCreating}
                className="flex-1"
                autoFocus
              />
              <Button
                type="button"
                onClick={handleCreateMarket}
                disabled={isCreating || !newMarketName.trim()}
                className="flex items-center gap-1"
              >
                {isCreating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden="true" />
                )}
                Ajouter
              </Button>
            </div>
          )}
          {createError && (
            <p className="text-sm text-destructive">{createError}</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
