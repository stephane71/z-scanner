/**
 * Shared TypeScript types for Z-Scanner
 * Re-exports all domain types for convenient imports
 */

// Ticket types
export type {
  Ticket,
  TicketFormData,
  TicketStatus,
  OcrStatus,
  TicketType,
  PaymentMode,
  Payment,
} from './ticket';

// OCR types (re-export from ticket which re-exports from ocr/types)
export type { OcrConfidence } from '@/lib/ocr/types';

// Photo types
export type { Photo } from './photo';

// Sync queue types
export type {
  SyncQueueItem,
  SyncStatus,
  SyncAction,
  SyncEntityType,
} from './sync';

// Market types
export type { Market } from './market';

// Export types
export type {
  ExportTicket,
  UseExportTicketsResult,
  UseGenerateExportResult,
} from './export';
