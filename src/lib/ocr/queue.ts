/**
 * OCR Queue for Z-Scanner
 * Manages offline OCR processing queue using Dexie syncQueue
 */

import { db } from '@/lib/db';
import { processOcr, isOcrError } from './client';
import type { OcrStatus, OcrResult, OcrConfidence, TicketType, Payment } from './types';
import type { SyncQueueItem } from '@/types';

/**
 * Maximum retry attempts for OCR processing
 */
const MAX_RETRIES = 5;

/**
 * Add a ticket to the OCR processing queue
 * Called when offline or when immediate OCR fails
 *
 * @param ticketId - ID of the ticket to queue for OCR
 */
export async function queueForOcr(ticketId: number): Promise<void> {
  // Check if already queued
  const existing = await db.syncQueue
    .where('entityId')
    .equals(ticketId)
    .and((item) => item.action === 'ocr' && item.status === 'pending')
    .first();

  if (existing) {
    // Already queued, skip
    return;
  }

  const queueItem: Omit<SyncQueueItem, 'id'> = {
    action: 'ocr',
    entityType: 'ticket',
    entityId: ticketId,
    payload: JSON.stringify({ ticketId }),
    status: 'pending',
    retries: 0,
    createdAt: new Date().toISOString(),
  };

  await db.syncQueue.add(queueItem as SyncQueueItem);
}

/**
 * Get all pending OCR queue items
 * Used by sync engine to check for pending OCR work
 *
 * @returns Array of pending OCR queue items
 */
export async function getOcrQueue(): Promise<SyncQueueItem[]> {
  // Filter by status (indexed) then filter by action in memory
  return db.syncQueue
    .where('status')
    .equals('pending')
    .filter((item) => item.action === 'ocr')
    .toArray();
}

/**
 * Get OCR queue count for UI indicator
 *
 * @returns Number of pending OCR items
 */
export async function getOcrQueueCount(): Promise<number> {
  // Filter by status (indexed) then filter by action in memory
  const items = await db.syncQueue
    .where('status')
    .equals('pending')
    .filter((item) => item.action === 'ocr')
    .toArray();
  return items.length;
}

/**
 * Process all pending OCR queue items
 * Called by sync engine when online
 *
 * @returns Number of successfully processed items
 */
export async function processOcrQueue(): Promise<number> {
  const pendingItems = await getOcrQueue();
  let successCount = 0;

  for (const item of pendingItems) {
    const success = await processOcrQueueItem(item);
    if (success) {
      successCount++;
    }
  }

  return successCount;
}

/**
 * Process a single OCR queue item
 *
 * @param item - Queue item to process
 * @returns true if successful, false otherwise
 */
async function processOcrQueueItem(item: SyncQueueItem): Promise<boolean> {
  try {
    // Mark as in-progress
    await db.syncQueue.update(item.id!, {
      status: 'in-progress',
      lastAttemptAt: new Date().toISOString(),
    });

    // Get the ticket
    const ticket = await db.tickets.get(item.entityId);
    if (!ticket) {
      // Ticket no longer exists, mark as failed
      await markQueueItemFailed(item.id!, 'Ticket introuvable');
      return false;
    }

    // Get the photo for this ticket
    const photo = await db.photos
      .where('ticketId')
      .equals(item.entityId)
      .first();

    if (!photo) {
      // No photo, mark as failed
      await markQueueItemFailed(item.id!, 'Photo introuvable');
      return false;
    }

    // Process OCR
    const result = await processOcr(photo.blob);

    // Update ticket with OCR results
    await updateTicketWithOcrResult(item.entityId, result);

    // Mark queue item as completed
    await db.syncQueue.update(item.id!, {
      status: 'completed',
      lastAttemptAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    // Handle retry logic
    const newRetries = item.retries + 1;
    const errorMessage = isOcrError(error)
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Erreur inconnue';

    if (newRetries >= MAX_RETRIES) {
      // Max retries reached, mark as failed
      await markQueueItemFailed(item.id!, errorMessage);

      // Update ticket status to ocr_failed
      await db.tickets.update(item.entityId, {
        ocrStatus: 'ocr_failed' as OcrStatus,
      });
    } else {
      // Increment retry count and keep as pending
      await db.syncQueue.update(item.id!, {
        status: 'pending',
        retries: newRetries,
        lastAttemptAt: new Date().toISOString(),
        errorMessage,
      });
    }

    return false;
  }
}

/**
 * Mark a queue item as permanently failed
 */
async function markQueueItemFailed(
  itemId: number,
  errorMessage: string
): Promise<void> {
  await db.syncQueue.update(itemId, {
    status: 'failed',
    lastAttemptAt: new Date().toISOString(),
    errorMessage,
  });
}

/**
 * Update ticket with OCR results
 */
async function updateTicketWithOcrResult(
  ticketId: number,
  result: OcrResult
): Promise<void> {
  // Prepare update data with new Z-ticket fields
  const updateData: {
    ocrStatus: OcrStatus;
    ocrConfidence?: OcrConfidence;
    type?: TicketType;
    impressionDate?: string;
    lastResetDate?: string;
    resetNumber?: number;
    ticketNumber?: number;
    discountValue?: number;
    cancelValue?: number;
    cancelNumber?: number;
    payments?: Payment[];
    total?: number;
  } = {
    ocrStatus: 'ocr_complete',
    ocrConfidence: result.confidence,
  };

  // Only update fields with non-null values
  if (result.type !== null) {
    updateData.type = result.type;
  }
  if (result.impressionDate !== null) {
    updateData.impressionDate = result.impressionDate;
  }
  if (result.lastResetDate !== null) {
    updateData.lastResetDate = result.lastResetDate;
  }
  if (result.resetNumber !== null) {
    updateData.resetNumber = result.resetNumber;
  }
  if (result.ticketNumber !== null) {
    updateData.ticketNumber = result.ticketNumber;
  }
  if (result.discountValue !== null) {
    updateData.discountValue = result.discountValue;
  }
  if (result.cancelValue !== null) {
    updateData.cancelValue = result.cancelValue;
  }
  if (result.cancelNumber !== null) {
    updateData.cancelNumber = result.cancelNumber;
  }
  if (result.payments.length > 0) {
    updateData.payments = result.payments;
  }
  if (result.total !== null) {
    updateData.total = result.total;
  }

  await db.tickets.update(ticketId, updateData);
}

/**
 * Remove a completed OCR queue item
 * Called after successful sync to cloud
 */
export async function removeCompletedOcrItem(itemId: number): Promise<void> {
  await db.syncQueue.delete(itemId);
}

/**
 * Clear all completed OCR queue items
 * Called during cleanup
 */
export async function clearCompletedOcrItems(): Promise<number> {
  // Filter by status (indexed) then filter by action in memory
  const completed = await db.syncQueue
    .where('status')
    .equals('completed')
    .filter((item) => item.action === 'ocr')
    .toArray();

  for (const item of completed) {
    if (item.id) {
      await db.syncQueue.delete(item.id);
    }
  }

  return completed.length;
}
