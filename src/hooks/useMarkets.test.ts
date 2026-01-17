/**
 * Unit tests for useMarkets hooks and CRUD operations
 * Uses fake-indexeddb for in-memory IndexedDB testing
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import {
  addMarket,
  getMarket,
  updateMarketName,
  deleteMarket,
  restoreMarket,
} from './useMarkets';
import type { Market } from '@/types';

describe('useMarkets CRUD Operations', () => {
  const createTestMarket = (overrides = {}): Omit<Market, 'id'> => ({
    name: 'Marché de Rungis',
    userId: 'user-123',
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(async () => {
    await db.markets.clear();
  });

  afterEach(async () => {
    await db.markets.clear();
  });

  describe('addMarket', () => {
    it('should add a market and return its id', async () => {
      const market = createTestMarket();
      const id = await addMarket(market);

      expect(id).toBeGreaterThan(0);
      expect(typeof id).toBe('number');
    });

    it('should store all market fields correctly', async () => {
      const market = createTestMarket({
        name: 'Marché du Dimanche',
        userId: 'user-456',
      });
      const id = await addMarket(market);

      const stored = await db.markets.get(id);

      expect(stored?.name).toBe('Marché du Dimanche');
      expect(stored?.userId).toBe('user-456');
      expect(stored?.deletedAt).toBeUndefined();
    });
  });

  describe('getMarket', () => {
    it('should retrieve a market by id', async () => {
      const market = createTestMarket();
      const id = await addMarket(market);

      const retrieved = await getMarket(id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(id);
      expect(retrieved?.name).toBe('Marché de Rungis');
    });

    it('should return undefined for non-existent id', async () => {
      const retrieved = await getMarket(99999);

      expect(retrieved).toBeUndefined();
    });
  });

  describe('updateMarketName', () => {
    it('should update market name', async () => {
      const market = createTestMarket();
      const id = await addMarket(market);

      await updateMarketName(id, 'New Market Name');

      const updated = await getMarket(id);
      expect(updated?.name).toBe('New Market Name');
    });

    it('should trim whitespace from name', async () => {
      const market = createTestMarket();
      const id = await addMarket(market);

      await updateMarketName(id, '  Trimmed Name  ');

      const updated = await getMarket(id);
      expect(updated?.name).toBe('Trimmed Name');
    });

    it('should throw error for empty name', async () => {
      const market = createTestMarket();
      const id = await addMarket(market);

      await expect(updateMarketName(id, '')).rejects.toThrow(
        'Market name cannot be empty'
      );
    });

    it('should throw error for whitespace-only name', async () => {
      const market = createTestMarket();
      const id = await addMarket(market);

      await expect(updateMarketName(id, '   ')).rejects.toThrow(
        'Market name cannot be empty'
      );
    });
  });

  describe('deleteMarket (soft-delete)', () => {
    it('should set deletedAt timestamp (NF525 soft-delete)', async () => {
      const market = createTestMarket();
      const id = await addMarket(market);

      await deleteMarket(id);

      const deleted = await getMarket(id);
      expect(deleted?.deletedAt).toBeDefined();
      expect(new Date(deleted!.deletedAt!).getTime()).toBeGreaterThan(0);
    });

    it('should not physically delete the market (NF525 compliance)', async () => {
      const market = createTestMarket();
      const id = await addMarket(market);

      await deleteMarket(id);

      // Market should still exist in database
      const exists = await db.markets.get(id);
      expect(exists).toBeDefined();
      expect(exists?.name).toBe('Marché de Rungis');
    });

    it('should throw error for non-existent market', async () => {
      await expect(deleteMarket(99999)).rejects.toThrow('Market 99999 not found');
    });

    it('should throw error for already deleted market', async () => {
      const market = createTestMarket({ deletedAt: new Date().toISOString() });
      const id = await addMarket(market);

      await expect(deleteMarket(id)).rejects.toThrow('Market is already deleted');
    });
  });

  describe('restoreMarket', () => {
    it('should clear deletedAt timestamp', async () => {
      const market = createTestMarket({ deletedAt: new Date().toISOString() });
      const id = await addMarket(market);

      await restoreMarket(id);

      const restored = await getMarket(id);
      expect(restored?.deletedAt).toBeUndefined();
    });

    it('should throw error for non-existent market', async () => {
      await expect(restoreMarket(99999)).rejects.toThrow('Market 99999 not found');
    });

    it('should throw error for market that is not deleted', async () => {
      const market = createTestMarket();
      const id = await addMarket(market);

      await expect(restoreMarket(id)).rejects.toThrow('Market is not deleted');
    });
  });

  describe('NF525 Compliance', () => {
    it('should preserve market data after soft-delete', async () => {
      const market = createTestMarket({
        name: 'Important Market',
        userId: 'critical-user',
      });
      const id = await addMarket(market);

      await deleteMarket(id);

      const preserved = await getMarket(id);
      expect(preserved?.name).toBe('Important Market');
      expect(preserved?.userId).toBe('critical-user');
      expect(preserved?.createdAt).toBeDefined();
    });

    it('should store dates in ISO 8601 format', async () => {
      const market = createTestMarket();
      const id = await addMarket(market);

      const stored = await getMarket(id);

      // Verify ISO 8601 format
      expect(stored?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should allow querying deleted markets for audit', async () => {
      const market1 = createTestMarket({ name: 'Active Market' });
      const market2 = createTestMarket({
        name: 'Deleted Market',
        deletedAt: new Date().toISOString(),
      });

      await addMarket(market1);
      await addMarket(market2);

      // Both should be queryable (soft-delete doesn't remove data)
      const allMarkets = await db.markets.toArray();
      expect(allMarkets).toHaveLength(2);

      // But filter logic should exclude deleted in app layer
      const activeMarkets = allMarkets.filter((m) => !m.deletedAt);
      expect(activeMarkets).toHaveLength(1);
      expect(activeMarkets[0].name).toBe('Active Market');
    });
  });
});
