/**
 * OCR module for Z-Scanner
 * Claude Haiku 4.5 Vision API integration with offline queue support
 */

// Types
export type {
  OcrStatus,
  OcrConfidence,
  OcrResult,
  OcrResponse,
  OcrRequest,
  OcrErrorType,
  OcrError,
  ConfidenceLevel,
} from "./types";

export { getConfidenceLevel, getAverageConfidence } from "./types";

// Client
export { processOcr, isOcrError } from "./client";

// Queue
export {
  queueForOcr,
  getOcrQueue,
  getOcrQueueCount,
  processOcrQueue,
  removeCompletedOcrItem,
  clearCompletedOcrItems,
} from "./queue";

// Prompts
export { EXTRACTION_PROMPT } from "./prompts";
