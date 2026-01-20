/**
 * OCR types for Z-Scanner Claude 3.5 Haiku Vision API integration
 * Defines request/response structures and status types for OCR processing
 * Based on Z-ticket (ticket de caisse "Statistique Totaux")
 */

/**
 * OCR processing status for tickets
 * - pending_ocr: Photo captured, waiting for OCR (offline or in queue)
 * - ocr_complete: OCR processing succeeded, data extracted
 * - ocr_failed: OCR failed after retries, manual entry required
 * - pending_validation: OCR complete, waiting for user validation
 * - manual_entry: Ticket created via manual entry (no OCR)
 */
export type OcrStatus =
  | 'pending_ocr'
  | 'ocr_complete'
  | 'ocr_failed'
  | 'pending_validation'
  | 'manual_entry';

/**
 * Ticket type - Currently only STATISTIQUES is supported
 * Future types: PLU, PLU-GROUPES, OPERATEUR
 */
export type TicketType = 'STATISTIQUES' | 'PLU' | 'PLU-GROUPES' | 'OPERATEUR';

/**
 * Payment method types extracted from tickets
 * - CB: Carte bancaire
 * - ESPECES: Cash
 * - CHEQUE: Check
 * - VIREMENT: Bank transfer
 */
export type PaymentMode = 'CB' | 'ESPECES' | 'CHEQUE' | 'VIREMENT';

/**
 * Single payment entry (ticket can have multiple payment modes)
 * All values in centimes (integer)
 */
export interface Payment {
  /** Payment method */
  mode: PaymentMode;
  /** Payment amount in centimes (1250 = 12,50€) */
  value: number;
}

/**
 * Confidence scores for each extracted field (0-1 range)
 * Used to display confidence indicators in UI
 */
export interface OcrConfidence {
  /** Confidence score for ticket type extraction */
  type: number;
  /** Confidence score for impression date extraction */
  impressionDate: number;
  /** Confidence score for last reset date extraction */
  lastResetDate: number;
  /** Confidence score for reset number extraction */
  resetNumber: number;
  /** Confidence score for ticket number extraction */
  ticketNumber: number;
  /** Confidence score for discount value extraction */
  discountValue: number;
  /** Confidence score for cancel value extraction */
  cancelValue: number;
  /** Confidence score for cancel number extraction */
  cancelNumber: number;
  /** Confidence score for payments extraction */
  payments: number;
  /** Confidence score for total extraction */
  total: number;
}

/**
 * OCR extraction result from Claude 3.5 Haiku Vision API
 * All fields are nullable to handle partial extraction
 * All monetary values in centimes (integer)
 */
export interface OcrResult {
  /** Ticket type - currently only STATISTIQUES supported */
  type: TicketType | null;
  /** Impression date in YYYY-MM-DD format, null if not readable */
  impressionDate: string | null;
  /** Last reset date in YYYY-MM-DD format, null if not readable */
  lastResetDate: string | null;
  /** Reset number (RAZ number), null if not readable */
  resetNumber: number | null;
  /** Ticket number (pure numeric), null if not readable */
  ticketNumber: number | null;
  /** Discount value in centimes, null if not readable */
  discountValue: number | null;
  /** Cancel value in centimes (amount of cancelled items), null if not readable */
  cancelValue: number | null;
  /** Number of cancelled items, null if not readable */
  cancelNumber: number | null;
  /** Array of payment entries (mode + value), empty array if not readable */
  payments: Payment[];
  /** Total amount in centimes, null if not readable */
  total: number | null;
  /** Confidence scores for each extracted field */
  confidence: OcrConfidence;
}

/**
 * API response from /api/ocr endpoint
 */
export interface OcrResponse {
  /** Whether the OCR processing was successful */
  success: boolean;
  /** Extracted data if successful */
  data?: OcrResult;
  /** Error message if failed */
  error?: string;
}

/**
 * Request body for /api/ocr endpoint
 */
export interface OcrRequest {
  /** Base64-encoded image data (without data URL prefix) */
  image: string;
}

/**
 * OCR error types for specific error handling
 */
export type OcrErrorType =
  | 'network_error'
  | 'timeout'
  | 'api_error'
  | 'low_confidence'
  | 'invalid_image';

/**
 * OCR error with type and message for UI display
 */
export interface OcrError {
  /** Error type for programmatic handling */
  type: OcrErrorType;
  /** Human-readable error message (French) */
  message: string;
}

/**
 * Confidence level thresholds for UI display
 * - high: green indicator (>= 0.8)
 * - medium: yellow indicator (>= 0.5, < 0.8)
 * - low: red indicator (< 0.5)
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Get confidence level from numeric score
 * @param score - Confidence score between 0 and 1
 * @returns Confidence level for UI display
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

/**
 * Calculate average confidence from all fields
 * @param confidence - Confidence scores object
 * @returns Average confidence score
 */
export function getAverageConfidence(confidence: OcrConfidence): number {
  const scores = [
    confidence.type,
    confidence.impressionDate,
    confidence.lastResetDate,
    confidence.resetNumber,
    confidence.ticketNumber,
    confidence.discountValue,
    confidence.cancelValue,
    confidence.cancelNumber,
    confidence.payments,
    confidence.total,
  ];
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Create empty/default confidence object
 * Used when OCR fails or for manual entry
 */
export function createEmptyConfidence(): OcrConfidence {
  return {
    type: 0,
    impressionDate: 0,
    lastResetDate: 0,
    resetNumber: 0,
    ticketNumber: 0,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: 0,
    total: 0,
  };
}
