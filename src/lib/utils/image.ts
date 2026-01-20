/**
 * Image compression utilities for ticket photos
 * Story 3.2: Camera Capture UI - Task 4
 *
 * Provides WebP compression with fallback to JPEG for Safari.
 * Uses browser-image-compression with Web Worker support.
 */

import imageCompression from 'browser-image-compression';

/**
 * Compressed image pair (original + thumbnail)
 */
export interface CompressedImages {
  /** Compressed original image (~100KB) */
  original: Blob;
  /** Thumbnail image (~10KB) */
  thumbnail: Blob;
}

/**
 * Image compression options
 */
export interface CompressionOptions {
  /** Max file size in MB for original (default: 0.1 = 100KB) */
  maxSizeMB?: number;
  /** Max width/height for original (default: 1920) */
  maxWidthOrHeight?: number;
  /** Initial quality (0-1, default: 0.8) */
  initialQuality?: number;
  /** Thumbnail max size in MB (default: 0.01 = 10KB) */
  thumbnailMaxSizeMB?: number;
  /** Thumbnail max width/height (default: 200) */
  thumbnailMaxWidthOrHeight?: number;
  /** Thumbnail quality (0-1, default: 0.6) */
  thumbnailQuality?: number;
  /** Use Web Worker for non-blocking compression (default: true) */
  useWebWorker?: boolean;
}

/**
 * Default compression options per architecture spec
 * Optimized for OCR - text needs to be readable
 */
const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxSizeMB: 1.0, // 1MB - high quality for OCR text recognition
  maxWidthOrHeight: 2048, // Full resolution for text readability
  initialQuality: 0.9, // High quality to preserve text details
  thumbnailMaxSizeMB: 0.01, // 10KB
  thumbnailMaxWidthOrHeight: 200,
  thumbnailQuality: 0.6,
  useWebWorker: true,
};

/**
 * Maximum input blob size (20MB) to prevent memory issues
 */
const MAX_INPUT_SIZE_MB = 20;

/**
 * Check if browser supports WebP encoding
 * Safari < 14 does not support WebP in canvas.toBlob()
 */
export function supportsWebP(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  const dataUrl = canvas.toDataURL('image/webp');
  return dataUrl.indexOf('data:image/webp') === 0;
}

/**
 * Get appropriate file type based on browser support
 */
export function getImageFileType(): 'image/webp' | 'image/jpeg' {
  return supportsWebP() ? 'image/webp' : 'image/jpeg';
}

/**
 * Compress a ticket image to WebP/JPEG
 *
 * Produces both original (~100KB) and thumbnail (~10KB) versions.
 * Uses Web Worker for non-blocking compression.
 *
 * @param blob - Raw image blob from camera capture
 * @param options - Compression options
 * @returns Promise with original and thumbnail blobs
 *
 * @example
 * ```tsx
 * const rawBlob = await captureFrame();
 * const { original, thumbnail } = await compressTicketImage(rawBlob);
 *
 * // Save to Dexie
 * await db.photos.add({
 *   ticketId,
 *   blob: original,
 *   thumbnail,
 *   createdAt: new Date().toISOString(),
 * });
 * ```
 */
export async function compressTicketImage(
  blob: Blob,
  options: CompressionOptions = {}
): Promise<CompressedImages> {
  // Validate input size to prevent memory exhaustion
  const inputSizeMB = blob.size / (1024 * 1024);
  if (inputSizeMB > MAX_INPUT_SIZE_MB) {
    throw new Error(
      `Image trop volumineuse (${inputSizeMB.toFixed(1)}MB). Maximum: ${MAX_INPUT_SIZE_MB}MB`
    );
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fileType = getImageFileType();
  const extension = fileType === 'image/webp' ? 'webp' : 'jpg';

  // Convert blob to File (required by browser-image-compression)
  const file = new File([blob], `ticket.${extension}`, { type: fileType });

  // Compression options for original image
  const originalOptions = {
    maxSizeMB: opts.maxSizeMB,
    maxWidthOrHeight: opts.maxWidthOrHeight,
    useWebWorker: opts.useWebWorker,
    fileType,
    initialQuality: opts.initialQuality,
    alwaysKeepResolution: false,
  };

  // Compression options for thumbnail
  const thumbnailOptions = {
    maxSizeMB: opts.thumbnailMaxSizeMB,
    maxWidthOrHeight: opts.thumbnailMaxWidthOrHeight,
    useWebWorker: opts.useWebWorker,
    fileType,
    initialQuality: opts.thumbnailQuality,
    alwaysKeepResolution: false,
  };

  // Compress both in parallel
  const [original, thumbnail] = await Promise.all([
    imageCompression(file, originalOptions),
    imageCompression(file, thumbnailOptions),
  ]);

  return {
    original,
    thumbnail,
  };
}

/**
 * Compress a single image (utility function)
 *
 * @param blob - Raw image blob
 * @param maxSizeMB - Target size in MB
 * @param maxWidthOrHeight - Max dimension
 * @param quality - Initial quality (0-1)
 * @returns Compressed blob
 */
export async function compressSingleImage(
  blob: Blob,
  maxSizeMB: number = 0.1,
  maxWidthOrHeight: number = 1920,
  quality: number = 0.8
): Promise<Blob> {
  const fileType = getImageFileType();
  const extension = fileType === 'image/webp' ? 'webp' : 'jpg';
  const file = new File([blob], `image.${extension}`, { type: fileType });

  return imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType,
    initialQuality: quality,
    alwaysKeepResolution: false,
  });
}

/**
 * Get image dimensions from blob
 *
 * @param blob - Image blob
 * @returns Promise with width and height
 */
export async function getImageDimensions(
  blob: Blob
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });
}

/**
 * Create a blob URL for preview (remember to revoke when done)
 *
 * @param blob - Image blob
 * @returns Object URL string
 */
export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke a blob URL to free memory
 *
 * @param url - Object URL to revoke
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
