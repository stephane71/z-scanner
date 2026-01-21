/**
 * Photo upload utility for Supabase Storage
 * Story 3.7: Photo Archival
 *
 * Handles uploading photo blobs from IndexedDB to Supabase Storage
 * for cloud backup and 6-year NF525 retention compliance.
 */

import { createClient } from '@/lib/supabase/client';
import { db } from '@/lib/db';

/**
 * Parameters for photo upload
 */
interface UploadPhotoParams {
  /** Photo ID from local Dexie photos table */
  photoId: number;
  /** Ticket ID this photo belongs to */
  ticketId: number;
  /** User ID for storage path structure */
  userId: string;
}

/**
 * Upload a photo to Supabase Storage
 *
 * Path structure: {userId}/{ticketId}/{photoId}.webp
 *
 * @param params - Upload parameters including photoId, ticketId, userId
 * @returns Storage path on success
 * @throws Error if photo not found or upload fails
 *
 * @example
 * ```typescript
 * const storagePath = await uploadPhoto({
 *   photoId: 1,
 *   ticketId: 42,
 *   userId: 'user-abc123',
 * });
 * // Returns: 'user-abc123/42/1.webp'
 * ```
 */
export async function uploadPhoto({
  photoId,
  ticketId,
  userId,
}: UploadPhotoParams): Promise<string> {
  // 1. Get photo blob from Dexie
  const photo = await db.photos.get(photoId);
  if (!photo) {
    throw new Error(`Photo ${photoId} not found in local storage`);
  }

  // 2. Construct storage path
  const storagePath = `${userId}/${ticketId}/${photoId}.webp`;

  // 3. Upload to Supabase Storage
  const supabase = createClient();
  const { error } = await supabase.storage
    .from('ticket-photos')
    .upload(storagePath, photo.blob, {
      contentType: 'image/webp',
      upsert: false, // Don't overwrite - photos are immutable (NF525)
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // 4. Return storage path for reference
  return storagePath;
}

export type { UploadPhotoParams };
