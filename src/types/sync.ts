/**
 * Sync queue types for Z-Scanner offline-first architecture
 * All operations are logged to syncQueue for audit trail (NF525 compliance)
 */

/**
 * Status of a sync queue item
 * - pending: Waiting to be synced
 * - in-progress: Currently being synced
 * - completed: Successfully synced to server
 * - failed: Failed after all retry attempts (max 5)
 */
export type SyncStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

/**
 * Action type for sync operations
 * NF525: Only 'create' and 'cancel' are valid for tickets (no update/delete)
 * 'ocr': Queue OCR processing for offline photos
 */
export type SyncAction = 'create' | 'update' | 'cancel' | 'ocr';

/**
 * Entity types that can be synced
 */
export type SyncEntityType = 'ticket' | 'photo' | 'market';

/**
 * Sync queue item stored in IndexedDB
 * Tracks all pending synchronization operations with retry logic
 */
export interface SyncQueueItem {
  /** Auto-increment primary key (undefined before insert) */
  id?: number;
  /** What operation to perform on the server */
  action: SyncAction;
  /** Which entity type this operation affects */
  entityType: SyncEntityType;
  /** ID of the entity in the local table */
  entityId: number;
  /** JSON stringified payload to send to server */
  payload: string;
  /** Current status of this queue item */
  status: SyncStatus;
  /** Number of retry attempts (max 5, then marked as failed) */
  retries: number;
  /** ISO 8601 timestamp when item was added to queue */
  createdAt: string;
  /** ISO 8601 timestamp of last sync attempt */
  lastAttemptAt?: string;
  /** Error message from last failed attempt */
  errorMessage?: string;
}
