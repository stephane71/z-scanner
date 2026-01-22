/**
 * Sync Engine - Story 3.9
 * Background sync engine with priority ordering and exponential retry
 *
 * Processes the syncQueue in priority order:
 * 1. OCR items (priority 1) - unblock validation
 * 2. Tickets/Markets (priority 2) - metadata
 * 3. Photos (priority 3) - binary data
 *
 * @see https://dexie.org/docs/Dexie/Dexie.transaction()
 */

import { db } from '@/lib/db';
import type { SyncQueueItem, SyncEntityType } from '@/types';
import {
  markInProgress,
  markCompleted,
  markFailed,
  incrementRetry,
} from '@/hooks/useSyncQueue';
import { shouldRetry, calculateBackoff } from './retry';

/**
 * Convert a Blob to base64 string
 * Uses arrayBuffer for cross-platform compatibility (browser + Node.js tests)
 *
 * @param blob - Blob to convert
 * @returns Base64 string with data URL prefix
 */
async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Convert to base64
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return `data:${blob.type || 'image/webp'};base64,${base64}`;
}

/**
 * Priority constants for sync order
 * Lower number = higher priority
 */
export const SYNC_PRIORITY: Record<SyncEntityType, number> = {
  ticket: 2,
  photo: 3,
  market: 2,
};

/**
 * Result of a single sync operation
 */
export interface SyncItemResult {
  success: boolean;
  serverId?: number;
  storagePath?: string;
  error?: string;
}

/**
 * Result of processing the entire sync queue
 */
export interface SyncResult {
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{ id: number; error: string }>;
}

/**
 * Get the priority of a sync item
 * OCR action has highest priority (1)
 *
 * @param item - Sync queue item
 * @returns Priority number (lower = higher priority)
 */
export function getItemPriority(item: SyncQueueItem): number {
  // OCR actions have highest priority to unblock validation
  if (item.action === 'ocr') {
    return 1;
  }
  return SYNC_PRIORITY[item.entityType] || 99;
}

/**
 * Check if an item is ready for retry based on exponential backoff
 * Uses lastAttemptAt and retries to calculate when item becomes eligible
 *
 * @param item - Sync queue item to check
 * @returns true if item has never been attempted or backoff period has elapsed
 */
export function isReadyForRetry(item: SyncQueueItem): boolean {
  // First attempt - always ready
  if (!item.lastAttemptAt || item.retries === 0) {
    return true;
  }

  // Calculate required delay based on retry count
  // retries is incremented AFTER failure, so current delay is based on retries-1
  const requiredDelay = calculateBackoff(item.retries - 1);
  const lastAttempt = new Date(item.lastAttemptAt).getTime();
  const now = Date.now();
  const elapsedMs = now - lastAttempt;

  return elapsedMs >= requiredDelay;
}

/**
 * Get all pending sync items sorted by priority
 * Only includes items that are ready for retry (backoff period elapsed)
 *
 * @returns Array of pending items sorted by priority (lowest first)
 */
export async function getPendingItemsByPriority(): Promise<SyncQueueItem[]> {
  const pendingItems = await db.syncQueue
    .where('status')
    .equals('pending')
    .toArray();

  // Filter to only items ready for retry (backoff elapsed)
  const readyItems = pendingItems.filter(isReadyForRetry);

  // Sort by priority (lower number = higher priority)
  return readyItems.sort((a, b) => getItemPriority(a) - getItemPriority(b));
}

/**
 * Sync a single item to the server
 *
 * @param item - Sync queue item to sync
 * @returns Result of the sync operation
 */
export async function syncItem(item: SyncQueueItem): Promise<SyncItemResult> {
  try {
    const payload = JSON.parse(item.payload);

    let endpoint: string;
    let body: Record<string, unknown>;

    switch (item.entityType) {
      case 'ticket': {
        // Load full ticket data from IndexedDB
        const ticket = await db.tickets.get(item.entityId);
        if (!ticket) {
          return { success: false, error: `Ticket ${item.entityId} not found in local database` };
        }

        endpoint = '/api/sync/tickets';
        body = {
          localId: item.entityId,
          action: item.action,
          data: {
            // Full ticket data required by the API
            dataHash: payload.dataHash || ticket.dataHash,
            type: ticket.type,
            status: ticket.status,
            impressionDate: ticket.impressionDate,
            lastResetDate: ticket.lastResetDate,
            resetNumber: ticket.resetNumber,
            ticketNumber: ticket.ticketNumber,
            discountValue: ticket.discountValue,
            cancelValue: ticket.cancelValue,
            cancelNumber: ticket.cancelNumber,
            payments: ticket.payments,
            total: ticket.total,
            clientTimestamp: payload.clientTimestamp || ticket.clientTimestamp,
            validatedAt: payload.validatedAt || ticket.validatedAt,
            cancelledAt: ticket.cancelledAt,
            cancellationReason: ticket.cancellationReason,
            marketId: ticket.marketId,
          },
        };
        break;
      }

      case 'photo': {
        // Load photo data from IndexedDB
        const photo = await db.photos.get(item.entityId);
        if (!photo) {
          return { success: false, error: `Photo ${item.entityId} not found in local database` };
        }

        // Validate blob exists and is valid (fake-indexeddb doesn't serialize Blobs properly)
        if (!photo.blob || !(photo.blob instanceof Blob) || photo.blob.size === 0) {
          return { success: false, error: `Photo ${item.entityId} has invalid blob data` };
        }

        // Convert blob to base64 for transmission
        const base64Image = await blobToBase64(photo.blob);

        endpoint = '/api/sync/photos';
        body = {
          photoId: item.entityId,
          ticketId: payload.ticketId,
          image: base64Image,
        };
        break;
      }

      case 'market':
        endpoint = '/api/sync';
        body = {
          items: [
            {
              queueId: item.id,
              action: item.action,
              entityType: item.entityType,
              entityId: item.entityId,
              payload: item.payload,
            },
          ],
        };
        break;

      default:
        return { success: false, error: `Unknown entity type: ${item.entityType}` };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      serverId: result.data?.serverId,
      storagePath: result.data?.storagePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process the entire sync queue
 * Items are processed in priority order: OCR > Tickets > Photos
 *
 * @returns Result summary of the sync operation
 */
export async function processSyncQueue(): Promise<SyncResult> {
  const result: SyncResult = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  // Get pending items sorted by priority
  const items = await getPendingItemsByPriority();

  if (items.length === 0) {
    return result;
  }

  for (const item of items) {
    if (!item.id) continue;

    result.processed++;

    // Mark as in-progress
    await markInProgress(item.id);

    // Attempt sync
    const syncResult = await syncItem(item);

    if (syncResult.success) {
      // Mark as completed
      await markCompleted(item.id);
      result.succeeded++;

      // Update local entity with server ID if applicable
      if (syncResult.serverId && item.entityType === 'ticket') {
        try {
          await db.tickets.update(item.entityId, {
            serverId: syncResult.serverId,
            serverTimestamp: new Date().toISOString(),
          });
        } catch (e) {
          // Non-critical: log but don't fail
          console.warn('Failed to update ticket with server ID:', e);
        }
      }
    } else {
      // Increment retry count
      const newRetries = await incrementRetry(item.id);

      if (shouldRetry(newRetries)) {
        // Still has retries left - will be picked up on next cycle
        // Status is reset to 'pending' by incrementRetry
        await db.syncQueue.update(item.id, { status: 'pending' });
      } else {
        // Max retries reached - mark as failed
        await markFailed(item.id, syncResult.error || 'Max retries exceeded');
        result.failed++;
        result.errors.push({
          id: item.id,
          error: syncResult.error || 'Max retries exceeded',
        });
      }
    }
  }

  return result;
}

/**
 * Get count of failed sync items
 *
 * @returns Number of failed items in the queue
 */
export async function getFailedItemsCount(): Promise<number> {
  return db.syncQueue.where('status').equals('failed').count();
}

/**
 * Retry all failed items by resetting their status to pending
 *
 * @returns Number of items reset for retry
 */
export async function retryFailedItems(): Promise<number> {
  const failedItems = await db.syncQueue
    .where('status')
    .equals('failed')
    .toArray();

  let count = 0;
  for (const item of failedItems) {
    if (item.id) {
      await db.syncQueue.update(item.id, {
        status: 'pending',
        retries: 0,
        errorMessage: undefined,
      });
      count++;
    }
  }

  return count;
}
