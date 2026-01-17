/**
 * Unit tests for Dexie.js database schema
 * Uses fake-indexeddb for in-memory IndexedDB testing
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, CURRENT_DB_VERSION, DB_NAME } from './index';
import type { Ticket, Photo, SyncQueueItem, Market } from '@/types';

describe('ZScannerDB Schema', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.tickets.clear();
    await db.photos.clear();
    await db.syncQueue.clear();
    await db.markets.clear();
  });

  afterEach(async () => {
    // Reset database state
    await db.tickets.clear();
    await db.photos.clear();
    await db.syncQueue.clear();
    await db.markets.clear();
  });

  describe('Database Initialization', () => {
    it('should have correct database name', () => {
      expect(DB_NAME).toBe('ZScannerDB');
    });

    it('should have correct current version', () => {
      expect(CURRENT_DB_VERSION).toBe(1);
    });

    it('should have all required tables', () => {
      expect(db.tickets).toBeDefined();
      expect(db.photos).toBeDefined();
      expect(db.syncQueue).toBeDefined();
      expect(db.markets).toBeDefined();
    });
  });

  describe('Tickets Table', () => {
    const createTestTicket = (): Omit<Ticket, 'id'> => ({
      dataHash: 'sha256-test-hash-123',
      date: '2026-01-17',
      montantTTC: 1250, // 12,50€
      modeReglement: 'CB',
      numeroTicket: 'TKT-001',
      userId: 'user-123',
      status: 'validated',
      createdAt: new Date().toISOString(),
      clientTimestamp: new Date().toISOString(),
    });

    it('should create a ticket with auto-increment id', async () => {
      const ticket = createTestTicket();
      const id = await db.tickets.add(ticket as Ticket);

      expect(id).toBeGreaterThan(0);
      expect(typeof id).toBe('number');
    });

    it('should retrieve a ticket by id', async () => {
      const ticket = createTestTicket();
      const id = await db.tickets.add(ticket as Ticket);

      const retrieved = await db.tickets.get(id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.montantTTC).toBe(1250);
      expect(retrieved?.numeroTicket).toBe('TKT-001');
    });

    it('should query tickets by userId index', async () => {
      const ticket1 = { ...createTestTicket(), userId: 'user-1' };
      const ticket2 = { ...createTestTicket(), userId: 'user-2' };
      const ticket3 = { ...createTestTicket(), userId: 'user-1' };

      await db.tickets.bulkAdd([ticket1, ticket2, ticket3] as Ticket[]);

      const user1Tickets = await db.tickets
        .where('userId')
        .equals('user-1')
        .toArray();

      expect(user1Tickets).toHaveLength(2);
    });

    it('should query tickets by status index', async () => {
      const validated = { ...createTestTicket(), status: 'validated' as const };
      const draft = { ...createTestTicket(), status: 'draft' as const };
      const cancelled = { ...createTestTicket(), status: 'cancelled' as const };

      await db.tickets.bulkAdd([validated, draft, cancelled] as Ticket[]);

      const validatedTickets = await db.tickets
        .where('status')
        .equals('validated')
        .toArray();

      expect(validatedTickets).toHaveLength(1);
    });

    it('should store money as integer centimes', async () => {
      const ticket = { ...createTestTicket(), montantTTC: 9999 }; // 99,99€
      const id = await db.tickets.add(ticket as Ticket);

      const retrieved = await db.tickets.get(id);

      expect(retrieved?.montantTTC).toBe(9999);
      expect(typeof retrieved?.montantTTC).toBe('number');
    });

    it('should store optional marketId', async () => {
      const ticket = { ...createTestTicket(), marketId: 42 };
      const id = await db.tickets.add(ticket as Ticket);

      const retrieved = await db.tickets.get(id);

      expect(retrieved?.marketId).toBe(42);
    });

    it('should allow undefined marketId', async () => {
      const ticket = createTestTicket(); // No marketId
      const id = await db.tickets.add(ticket as Ticket);

      const retrieved = await db.tickets.get(id);

      expect(retrieved?.marketId).toBeUndefined();
    });
  });

  describe('Photos Table', () => {
    const createTestPhoto = (ticketId: number): Omit<Photo, 'id'> => ({
      ticketId,
      blob: new Blob(['test image data'], { type: 'image/webp' }),
      thumbnail: new Blob(['test thumbnail'], { type: 'image/webp' }),
      createdAt: new Date().toISOString(),
    });

    it('should create a photo with auto-increment id', async () => {
      const photo = createTestPhoto(1);
      const id = await db.photos.add(photo as Photo);

      expect(id).toBeGreaterThan(0);
    });

    it('should store blob data', async () => {
      const photo = createTestPhoto(1);
      const id = await db.photos.add(photo as Photo);

      const retrieved = await db.photos.get(id);

      // fake-indexeddb returns plain objects, not Blob instances
      // In production IndexedDB, these would be actual Blobs
      expect(retrieved?.blob).toBeDefined();
      expect(retrieved?.thumbnail).toBeDefined();
    });

    it('should query photos by ticketId index', async () => {
      const photo1 = createTestPhoto(1);
      const photo2 = createTestPhoto(1);
      const photo3 = createTestPhoto(2);

      await db.photos.bulkAdd([photo1, photo2, photo3] as Photo[]);

      const ticket1Photos = await db.photos
        .where('ticketId')
        .equals(1)
        .toArray();

      expect(ticket1Photos).toHaveLength(2);
    });
  });

  describe('SyncQueue Table', () => {
    const createTestSyncItem = (): Omit<SyncQueueItem, 'id'> => ({
      action: 'create',
      entityType: 'ticket',
      entityId: 1,
      payload: JSON.stringify({ test: 'data' }),
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    it('should create a sync queue item with auto-increment id', async () => {
      const item = createTestSyncItem();
      const id = await db.syncQueue.add(item as SyncQueueItem);

      expect(id).toBeGreaterThan(0);
    });

    it('should query by status index', async () => {
      const pending = { ...createTestSyncItem(), status: 'pending' as const };
      const completed = { ...createTestSyncItem(), status: 'completed' as const };
      const failed = { ...createTestSyncItem(), status: 'failed' as const };

      await db.syncQueue.bulkAdd([pending, completed, failed] as SyncQueueItem[]);

      const pendingItems = await db.syncQueue
        .where('status')
        .equals('pending')
        .toArray();

      expect(pendingItems).toHaveLength(1);
    });

    it('should store JSON payload as string', async () => {
      const payload = { ticketId: 123, amount: 1250 };
      const item = { ...createTestSyncItem(), payload: JSON.stringify(payload) };
      const id = await db.syncQueue.add(item as SyncQueueItem);

      const retrieved = await db.syncQueue.get(id);
      const parsedPayload = JSON.parse(retrieved?.payload || '');

      expect(parsedPayload.ticketId).toBe(123);
      expect(parsedPayload.amount).toBe(1250);
    });

    it('should track retry count', async () => {
      const item = { ...createTestSyncItem(), retries: 3 };
      const id = await db.syncQueue.add(item as SyncQueueItem);

      const retrieved = await db.syncQueue.get(id);

      expect(retrieved?.retries).toBe(3);
    });
  });

  describe('Markets Table', () => {
    const createTestMarket = (): Omit<Market, 'id'> => ({
      name: 'Marché de Rungis',
      userId: 'user-123',
      createdAt: new Date().toISOString(),
    });

    it('should create a market with auto-increment id', async () => {
      const market = createTestMarket();
      const id = await db.markets.add(market as Market);

      expect(id).toBeGreaterThan(0);
    });

    it('should query markets by userId index', async () => {
      const market1 = { ...createTestMarket(), userId: 'user-1' };
      const market2 = { ...createTestMarket(), userId: 'user-2' };
      const market3 = { ...createTestMarket(), userId: 'user-1' };

      await db.markets.bulkAdd([market1, market2, market3] as Market[]);

      const user1Markets = await db.markets
        .where('userId')
        .equals('user-1')
        .toArray();

      expect(user1Markets).toHaveLength(2);
    });

    it('should support soft-delete with deletedAt', async () => {
      const market = { ...createTestMarket(), deletedAt: new Date().toISOString() };
      const id = await db.markets.add(market as Market);

      const retrieved = await db.markets.get(id);

      expect(retrieved?.deletedAt).toBeDefined();
    });

    it('should allow undefined deletedAt for active markets', async () => {
      const market = createTestMarket(); // No deletedAt
      const id = await db.markets.add(market as Market);

      const retrieved = await db.markets.get(id);

      expect(retrieved?.deletedAt).toBeUndefined();
    });
  });

  describe('Cross-Table Operations', () => {
    it('should support transaction across multiple tables', async () => {
      await db.transaction('rw', [db.tickets, db.syncQueue], async () => {
        const ticketId = await db.tickets.add({
          dataHash: 'hash-123',
          date: '2026-01-17',
          montantTTC: 1000,
          modeReglement: 'Espèces',
          numeroTicket: 'TKT-TX',
          userId: 'user-tx',
          status: 'draft',
          createdAt: new Date().toISOString(),
          clientTimestamp: new Date().toISOString(),
        } as Ticket);

        await db.syncQueue.add({
          action: 'create',
          entityType: 'ticket',
          entityId: ticketId as number,
          payload: JSON.stringify({ ticketId }),
          status: 'pending',
          retries: 0,
          createdAt: new Date().toISOString(),
        } as SyncQueueItem);

        return ticketId;
      });

      const tickets = await db.tickets.toArray();
      const syncItems = await db.syncQueue.toArray();

      expect(tickets).toHaveLength(1);
      expect(syncItems).toHaveLength(1);
    });
  });
});
