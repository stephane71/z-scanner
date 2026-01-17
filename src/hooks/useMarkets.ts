/**
 * React hooks for market operations with useLiveQuery
 * Provides reactive queries and CRUD operations for markets
 *
 * @see https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Market } from '@/types';

/**
 * Hook to get all active markets for a user with reactive updates
 * Excludes soft-deleted markets (deletedAt is set)
 * @param userId - Supabase auth.uid() of the user
 * @returns Object with markets array and loading state
 */
export function useMarkets(userId: string) {
  const markets = useLiveQuery(
    async () => {
      if (!userId) return [];
      const allMarkets = await db.markets
        .where('userId')
        .equals(userId)
        .sortBy('name');
      // Filter out soft-deleted markets
      return allMarkets.filter((m) => !m.deletedAt);
    },
    [userId]
  );

  return {
    markets,
    isLoading: markets === undefined,
  };
}

/**
 * Hook to get a single market by ID
 * @param id - Market ID to fetch
 * @returns Object with market and loading state
 */
export function useMarketById(id: number | undefined) {
  const market = useLiveQuery(
    async () => (id !== undefined ? db.markets.get(id) : undefined),
    [id]
  );

  return {
    market,
    isLoading: market === undefined && id !== undefined,
  };
}

/**
 * Hook to get markets count for a user
 * @param userId - Supabase auth.uid() of the user
 * @returns Object with count and loading state
 */
export function useMarketsCount(userId: string) {
  const count = useLiveQuery(
    async () => {
      if (!userId) return 0;
      const allMarkets = await db.markets
        .where('userId')
        .equals(userId)
        .toArray();
      return allMarkets.filter((m) => !m.deletedAt).length;
    },
    [userId]
  );

  return {
    count,
    isLoading: count === undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CRUD Operations (non-reactive)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add a new market to the database
 * @param market - Market data to insert
 * @returns Promise with the new market ID
 */
export async function addMarket(market: Omit<Market, 'id'>): Promise<number> {
  const id = await db.markets.add(market as Market);
  return id as number;
}

/**
 * Get a market by ID (non-reactive)
 * @param id - Market ID to fetch
 * @returns Promise with the market or undefined
 */
export async function getMarket(id: number): Promise<Market | undefined> {
  return db.markets.get(id);
}

/**
 * Update a market's name
 * @param id - Market ID to update
 * @param name - New market name
 * @returns Promise that resolves when complete
 */
export async function updateMarketName(id: number, name: string): Promise<void> {
  if (!name.trim()) {
    throw new Error('Market name cannot be empty');
  }
  await db.markets.update(id, { name: name.trim() });
}

/**
 * Soft-delete a market
 * NF525: Markets are never truly deleted, only marked with deletedAt
 * @param id - Market ID to soft-delete
 * @returns Promise that resolves when complete
 */
export async function deleteMarket(id: number): Promise<void> {
  const market = await db.markets.get(id);
  if (!market) throw new Error(`Market ${id} not found`);
  if (market.deletedAt) throw new Error('Market is already deleted');

  await db.markets.update(id, {
    deletedAt: new Date().toISOString(),
  });
}

/**
 * Restore a soft-deleted market
 * @param id - Market ID to restore
 * @returns Promise that resolves when complete
 */
export async function restoreMarket(id: number): Promise<void> {
  const market = await db.markets.get(id);
  if (!market) throw new Error(`Market ${id} not found`);
  if (!market.deletedAt) throw new Error('Market is not deleted');

  await db.markets.update(id, {
    deletedAt: undefined,
  });
}
