/**
 * Dexie.js Migration Documentation for Z-Scanner
 *
 * This file documents the migration history and provides guidance
 * for future schema changes. Actual migrations are defined in schema.ts.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * MIGRATION HISTORY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Version 1 (Story 3.1): Initial schema
 * ─────────────────────────────────────
 * Tables created:
 *   - tickets: ++id, userId, marketId, status, date, createdAt, dataHash
 *   - photos: ++id, ticketId, createdAt
 *   - syncQueue: ++id, entityType, entityId, status, createdAt
 *   - markets: ++id, userId, name, createdAt
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ADDING NEW VERSIONS - BEST PRACTICES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. NEVER modify existing version() calls - they are immutable history
 *
 * 2. Add a new version() with incremented number:
 *    ```typescript
 *    this.version(2).stores({
 *      // Only list tables that changed
 *      tickets: '++id, userId, marketId, status, date, createdAt, dataHash, newField'
 *    });
 *    ```
 *
 * 3. If data transformation is needed, add .upgrade():
 *    ```typescript
 *    this.version(2).stores({
 *      tickets: '++id, userId, marketId, status, date, createdAt, dataHash, newField'
 *    }).upgrade(tx => {
 *      return tx.table('tickets').toCollection().modify(ticket => {
 *        ticket.newField = 'default';
 *      });
 *    });
 *    ```
 *
 * 4. Additive changes (new optional fields) don't require upgrade():
 *    Dexie handles missing properties gracefully
 *
 * 5. Index changes (adding/removing indexes) require new version:
 *    - New index: Add field name to schema string
 *    - Remove index: Remove field name from schema string
 *    - Data is preserved, only index structure changes
 *
 * 6. New tables: Simply add them in the new version
 *
 * 7. Remove tables: Set the table schema to null
 *    ```typescript
 *    this.version(2).stores({
 *      oldTable: null  // Removes the table
 *    });
 *    ```
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * NF525 COMPLIANCE NOTES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - NEVER remove the tickets table or its data
 * - NEVER add UPDATE/DELETE operations on tickets
 * - Maintain dataHash field for integrity verification
 * - Keep all timestamp fields for audit trail
 * - 6-year data retention minimum
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Current database version (must match CURRENT_DB_VERSION in schema.ts)
 * Update this when adding new migrations
 */
export const MIGRATION_VERSION = 1;

/**
 * Migration history for documentation purposes
 */
export const MIGRATION_HISTORY = [
  {
    version: 1,
    date: '2026-01-17',
    story: '3.1',
    description: 'Initial schema - tickets, photos, syncQueue, markets',
    changes: [
      'Created tickets table with NF525-compliant fields',
      'Created photos table for ticket images',
      'Created syncQueue table for offline sync',
      'Created markets table for user locations',
    ],
  },
] as const;
