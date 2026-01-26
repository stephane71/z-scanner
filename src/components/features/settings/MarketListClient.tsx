'use client';

/**
 * MarketListClient - Client component for market management
 * Story 4.5: Market Management (CRUD)
 *
 * Displays user's markets with options to add, edit, and delete.
 * All CRUD operations use existing hooks from useMarkets.ts.
 * Uses useLiveQuery for reactive updates (no manual refresh needed).
 */

import { useState, useEffect } from 'react';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useMarkets } from '@/hooks';
import { Button } from '@/components/ui/button';
import type { Market } from '@/types';
import { AddMarketForm } from './AddMarketForm';
import { EditMarketDialog } from './EditMarketDialog';
import { DeleteMarketDialog } from './DeleteMarketDialog';

/** Market with guaranteed id (from database) */
type MarketWithId = Market & { id: number };

export function MarketListClient() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [editingMarket, setEditingMarket] = useState<MarketWithId | null>(null);
  const [deletingMarket, setDeletingMarket] = useState<MarketWithId | null>(null);

  // Get current user from Supabase
  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      setAuthLoading(false);
    }
    getUser();
  }, []);

  const { markets, isLoading } = useMarkets(userId ?? '');

  // Show skeleton during auth loading or data loading
  if (authLoading || (userId && isLoading)) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Mes marchés</h2>
        <div data-testid="market-list-skeleton" className="space-y-3">
          <div className="h-12 bg-muted animate-pulse rounded-lg" />
          <div className="h-12 bg-muted animate-pulse rounded-lg" />
          <div className="h-12 bg-muted animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  const hasMarkets = markets && markets.length > 0;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Mes marchés</h2>

      {hasMarkets ? (
        <ul className="space-y-2 mb-4">
          {markets.map((market) => (
            <li
              key={market.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <span className="truncate">{market.name}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setEditingMarket(market as MarketWithId)}
                  aria-label={`Modifier ${market.name}`}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                  onClick={() => setDeletingMarket(market as MarketWithId)}
                  aria-label={`Supprimer ${market.name}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-6 text-center mb-4">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground mb-1">Aucun marché enregistré</p>
          <p className="text-xs text-muted-foreground">
            Ajoutez un marché pour organiser vos tickets par lieu.
          </p>
        </div>
      )}

      {userId && <AddMarketForm userId={userId} />}

      {editingMarket && (
        <EditMarketDialog
          market={editingMarket}
          open={!!editingMarket}
          onOpenChange={(open) => !open && setEditingMarket(null)}
        />
      )}

      {deletingMarket && (
        <DeleteMarketDialog
          market={deletingMarket}
          open={!!deletingMarket}
          onOpenChange={(open) => !open && setDeletingMarket(null)}
        />
      )}
    </section>
  );
}
