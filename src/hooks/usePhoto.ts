/**
 * usePhoto hook - Fetches photo by ticketId
 * Story 3.7: Photo Archival
 *
 * Uses useLiveQuery for reactive updates from IndexedDB.
 * Returns the photo associated with a ticket, or undefined if not found.
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Photo } from '@/types';

/**
 * Hook result for usePhoto
 */
interface UsePhotoResult {
  /** Photo data from IndexedDB, or undefined if not found/loading */
  photo: Photo | undefined;
  /** Whether the photo is still loading */
  isLoading: boolean;
}

/**
 * Fetch photo by ticketId with reactive updates
 *
 * Uses useLiveQuery for reactive updates when photo data changes.
 * Handles invalid ticketIds (undefined, 0, negative) gracefully.
 *
 * @param ticketId - The ticket ID to fetch photo for
 * @returns Photo data and loading state
 *
 * @example
 * ```tsx
 * const { photo, isLoading } = usePhoto(ticketId);
 *
 * if (isLoading) return <Skeleton />;
 * if (!photo) return <NoPhotoMessage />;
 *
 * return <img src={URL.createObjectURL(photo.blob)} />;
 * ```
 */
export function usePhoto(ticketId: number | undefined): UsePhotoResult {
  // Use null as sentinel value to distinguish "loading" from "not found"
  const queryResult = useLiveQuery(
    async () => {
      // Handle invalid ticketIds - return null (not undefined) to indicate "query completed, no result"
      if (!ticketId || ticketId <= 0) {
        return null;
      }
      const photo = await db.photos.where('ticketId').equals(ticketId).first();
      return photo ?? null; // Convert undefined to null to indicate "query completed"
    },
    [ticketId],
    undefined // undefined while loading, null when query completed but no result
  );

  // queryResult is:
  // - undefined: still loading
  // - null: query completed, no photo found
  // - Photo: query completed, photo found
  const isLoading = queryResult === undefined;
  const photo = queryResult === null ? undefined : queryResult;

  return {
    photo,
    isLoading,
  };
}

export type { UsePhotoResult };
