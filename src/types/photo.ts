/**
 * Photo types for Z-Scanner local database
 * Photos are stored as WebP blobs with thumbnails for efficient display
 */

/**
 * Photo entity stored in IndexedDB
 * Original image (~100KB WebP 80%) + thumbnail (~10KB WebP 60%)
 */
export interface Photo {
  /** Auto-increment primary key (undefined before insert) */
  id?: number;
  /** Foreign key to tickets table */
  ticketId: number;
  /** WebP original image blob (~100KB at 80% quality) */
  blob: Blob;
  /** WebP thumbnail blob (~10KB at 60% quality) */
  thumbnail: Blob;
  /** ISO 8601 timestamp when photo was captured */
  createdAt: string;
}
