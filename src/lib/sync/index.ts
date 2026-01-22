/**
 * Sync module exports
 * Story 3.7: Photo Archival
 * Story 3.9: Background Sync Engine
 *
 * Provides utilities for syncing local data to Supabase cloud storage.
 */

// Photo upload (Story 3.7)
export { uploadPhoto, type UploadPhotoParams } from './photo';

// Sync engine (Story 3.9)
export {
  processSyncQueue,
  syncItem,
  getItemPriority,
  getPendingItemsByPriority,
  getFailedItemsCount,
  retryFailedItems,
  SYNC_PRIORITY,
  type SyncItemResult,
  type SyncResult,
} from './engine';

// Retry logic (Story 3.9)
export {
  calculateBackoff,
  shouldRetry,
  getBackoffDelays,
  scheduleRetry,
  cancelRetry,
  cancelAllRetries,
  MAX_RETRIES,
  BASE_DELAY,
} from './retry';
