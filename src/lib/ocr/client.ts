/**
 * OCR Client for Z-Scanner
 * Client-side API wrapper for OCR processing
 */

import type { OcrResult, OcrResponse, OcrError } from './types';

/**
 * OCR timeout in milliseconds (5 seconds per NFR-P1)
 */
const OCR_TIMEOUT = 5000;

/**
 * Convert Blob to base64 string (without data URL prefix)
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/webp;base64,")
      const base64Index = result.indexOf(',');
      if (base64Index === -1) {
        reject(new Error('Invalid data URL'));
        return;
      }
      resolve(result.substring(base64Index + 1));
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image'));
    };

    reader.readAsDataURL(blob);
  });
}

/**
 * Process image with OCR API
 * @param imageBlob - Image blob to process (WebP or JPEG)
 * @returns OCR result with extracted fields and confidence scores
 * @throws OcrError on failure
 */
export async function processOcr(imageBlob: Blob): Promise<OcrResult> {
  // Validate blob
  if (!imageBlob || imageBlob.size === 0) {
    throw createOcrError('invalid_image', 'Image invalide ou vide');
  }

  // Check file size (max 20MB)
  if (imageBlob.size > 20 * 1024 * 1024) {
    throw createOcrError('invalid_image', 'Image trop volumineuse (max 20MB)');
  }

  // Convert to base64
  const base64 = await blobToBase64(imageBlob);

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OCR_TIMEOUT);

  try {
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64 }),
      signal: controller.signal,
    });

    // Clear timeout on response
    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 429) {
        throw createOcrError(
          'api_error',
          'Trop de requêtes, réessayez dans quelques instants'
        );
      }
      if (response.status === 413) {
        throw createOcrError('invalid_image', 'Image trop volumineuse');
      }

      throw createOcrError('api_error', "Erreur lors de l'analyse du ticket");
    }

    // Parse response
    const data: OcrResponse = await response.json();

    if (!data.success || !data.data) {
      throw createOcrError('api_error', data.error || "Erreur lors de l'analyse");
    }

    return data.data;
  } catch (error) {
    // Clear timeout on error
    clearTimeout(timeoutId);

    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw createOcrError('timeout', "L'analyse prend trop de temps. Veuillez réessayer.");
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw createOcrError(
        'network_error',
        'Erreur de connexion. Le ticket sera analysé lors de la prochaine synchronisation.'
      );
    }

    // Re-throw OcrError as-is
    if (isOcrError(error)) {
      throw error;
    }

    // Wrap other errors
    throw createOcrError(
      'api_error',
      error instanceof Error ? error.message : "Erreur lors de l'analyse"
    );
  }
}

/**
 * Create an OcrError object
 */
function createOcrError(
  type: OcrError['type'],
  message: string
): OcrError {
  return { type, message };
}

/**
 * Type guard for OcrError
 */
export function isOcrError(error: unknown): error is OcrError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    typeof (error as OcrError).type === 'string' &&
    typeof (error as OcrError).message === 'string'
  );
}
