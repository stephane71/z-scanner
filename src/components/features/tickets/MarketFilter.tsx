'use client';

/**
 * MarketFilter component - Market selection filter for ticket list
 * Story 4.4: Filter by Market
 *
 * Provides a Sheet with multi-select checkboxes for market filtering.
 * Follows patterns established in DateRangeFilter from Story 4.3.
 */

import { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { useMarkets } from '@/hooks';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface MarketFilterProps {
  userId: string;
  selectedMarketIds: number[];
  onApply: (marketIds: number[]) => void;
}

export function MarketFilter({
  userId,
  selectedMarketIds,
  onApply,
}: MarketFilterProps) {
  const [open, setOpen] = useState(false);
  const [tempSelection, setTempSelection] = useState<number[]>(selectedMarketIds);
  const { markets, isLoading } = useMarkets(userId);

  // Reset temp selection when sheet opens
  useEffect(() => {
    if (open) {
      setTempSelection(selectedMarketIds);
    }
  }, [open, selectedMarketIds]);

  function handleToggle(marketId: number) {
    setTempSelection((prev) =>
      prev.includes(marketId)
        ? prev.filter((id) => id !== marketId)
        : [...prev, marketId]
    );
  }

  function handleSelectAll() {
    setTempSelection([]);
  }

  function handleApply() {
    onApply(tempSelection);
    setOpen(false);
  }

  function handleCancel() {
    setTempSelection(selectedMarketIds);
    setOpen(false);
  }

  const isAllSelected = tempSelection.length === 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Filtrer par marché"
        className={cn(
          'flex items-center justify-center w-12 h-12',
          'rounded-full hover:bg-muted',
          'transition-colors'
        )}
      >
        <MapPin className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
      </button>

      {/* Sheet content */}
      <SheetContent
        side="bottom"
        className="h-auto max-h-[80vh] rounded-t-2xl px-4 [&>button:last-child]:hidden"
      >
        {/* Custom header with title and close button on same row */}
        <div className="flex items-center justify-between py-4">
          <SheetTitle>Filtrer par marché</SheetTitle>
          <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-5 w-5" />
            <span className="sr-only">Fermer</span>
          </SheetClose>
        </div>

        {/* Market list */}
        <div className="space-y-3 py-4 max-h-[50vh] overflow-y-auto">
          {/* "All markets" option */}
          <div className="flex items-center space-x-3 py-2">
            <Checkbox
              id="all-markets"
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Tous les marchés"
            />
            <label
              htmlFor="all-markets"
              className="text-sm font-medium cursor-pointer"
            >
              Tous les marchés
            </label>
          </div>

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Individual markets */}
          {isLoading ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Chargement...
            </div>
          ) : markets && markets.length > 0 ? (
            markets.map((market) => (
              <div key={market.id} className="flex items-center space-x-3 py-2">
                <Checkbox
                  id={`market-${market.id}`}
                  checked={tempSelection.includes(market.id!)}
                  onCheckedChange={() => handleToggle(market.id!)}
                  aria-label={market.name}
                />
                <label
                  htmlFor={`market-${market.id}`}
                  className="text-sm cursor-pointer"
                >
                  {market.name}
                </label>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Aucun marché créé. Créez un marché dans les paramètres.
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 pb-6">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Annuler
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Appliquer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
