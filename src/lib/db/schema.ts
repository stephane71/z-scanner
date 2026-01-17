/**
 * Dexie.js database schema for Z-Scanner
 * Offline-first IndexedDB storage with NF525 compliance
 *
 * @see https://dexie.org/docs/Typescript
 * @see https://dexie.org/docs/Version/Dexie.version()
 */

import Dexie, { type EntityTable } from 'dexie';
import type { Ticket, Photo, SyncQueueItem, Market } from '@/types';

/**
 * Z-Scanner database class extending Dexie
 * Provides strongly-typed table access via EntityTable
 */
export class ZScannerDB extends Dexie {
  /**
   * Tickets table - core data for scanned tickets
   * NF525: append-only, never UPDATE or DELETE
   */
  tickets!: EntityTable<Ticket, 'id'>;

  /**
   * Photos table - ticket images stored as WebP blobs
   * Linked to tickets via ticketId foreign key
   */
  photos!: EntityTable<Photo, 'id'>;

  /**
   * Sync queue table - tracks pending sync operations
   * Used for offline-first architecture with retry logic
   */
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;

  /**
   * Markets table - user's selling locations
   * Soft-delete pattern for NF525 compliance
   */
  markets!: EntityTable<Market, 'id'>;

  constructor() {
    super('ZScannerDB');

    /**
     * Version 1 - Initial schema (Story 3.1)
     *
     * Index syntax:
     * - ++id = auto-increment primary key
     * - field = indexed field for efficient queries
     * - [field1+field2] = compound index (not used yet)
     *
     * @important NEVER modify this version - add new version() for schema changes
     */
    this.version(1).stores({
      // Tickets: indexed by userId, marketId, status, date, createdAt, dataHash
      tickets: '++id, userId, marketId, status, date, createdAt, dataHash',
      // Photos: indexed by ticketId for lookup, createdAt for sorting
      photos: '++id, ticketId, createdAt',
      // SyncQueue: indexed for queue processing
      syncQueue: '++id, entityType, entityId, status, createdAt',
      // Markets: indexed by userId and name
      markets: '++id, userId, name, createdAt',
    });
  }
}

/**
 * Database name constant for reference
 */
export const DB_NAME = 'ZScannerDB';

/**
 * Current database version
 * Increment this when adding new version() calls
 */
export const CURRENT_DB_VERSION = 1;
