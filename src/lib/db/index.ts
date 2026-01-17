/**
 * Dexie.js database instance for Z-Scanner
 * Singleton export for use throughout the application
 *
 * @example
 * import { db } from '@/lib/db';
 * const tickets = await db.tickets.where('userId').equals(userId).toArray();
 */

import { ZScannerDB, DB_NAME, CURRENT_DB_VERSION } from './schema';

/**
 * Singleton database instance
 * Import this throughout the application for all IndexedDB operations
 */
export const db = new ZScannerDB();

// Re-export schema utilities
export { ZScannerDB, DB_NAME, CURRENT_DB_VERSION } from './schema';
