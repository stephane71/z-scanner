/**
 * Ticket types for Z-Scanner local database
 * NF525 compliance: append-only data model, no UPDATE/DELETE operations
 * Based on Z-ticket (ticket de caisse "Statistique Totaux")
 */

import type {
  OcrStatus,
  OcrConfidence,
  TicketType,
  Payment,
} from "@/lib/ocr/types";

// Re-export types for convenience
export type {
  OcrStatus,
  TicketType,
  PaymentMode,
  Payment,
} from "@/lib/ocr/types";

/**
 * Ticket status following NF525 append-only pattern
 * - draft: Ticket being created, not yet validated
 * - validated: Ticket has been validated (immutable)
 * - cancelled: Ticket has been cancelled (immutable, with reason)
 */
export type TicketStatus = "draft" | "validated" | "cancelled";

/**
 * Core ticket interface for IndexedDB storage
 * All monetary values stored as integer centimes (1250 = 12,50€)
 * All dates stored as ISO 8601 strings
 */
export interface Ticket {
  // ===== Technical Fields =====
  /** Auto-increment primary key (undefined before insert) */
  id?: number;
  /** SHA-256 hash for NF525 compliance */
  dataHash: string;
  /** Supabase auth.uid() of the ticket owner */
  userId: string;
  /** Optional foreign key to markets table */
  marketId?: number;
  /** Current ticket status (NF525: only validated/cancelled are final) */
  status: TicketStatus;
  /** ISO 8601 timestamp when ticket was created locally */
  createdAt: string;
  /** Device time at capture (client-side timestamp) */
  clientTimestamp: string;
  /** ISO 8601 timestamp when ticket was validated (NF525 requirement) */
  validatedAt?: string;
  /** ISO 8601 timestamp when ticket was cancelled (NF525 requirement) */
  cancelledAt?: string;
  /** Required cancellation reason when status = 'cancelled' */
  cancellationReason?: string;
  /** Server ID from Supabase after successful sync */
  serverId?: number;
  /** Server timestamp from Supabase after successful sync */
  serverTimestamp?: string;
  /** OCR processing status (pending_ocr, ocr_complete, ocr_failed, pending_validation) */
  ocrStatus?: OcrStatus;
  /** OCR confidence scores for each extracted field */
  ocrConfidence?: OcrConfidence;

  // ===== Z-Ticket Data Fields =====
  /** Ticket type - currently only STATISTIQUES supported */
  type: TicketType;
  /** Impression date in ISO 8601 format (YYYY-MM-DD) */
  impressionDate: string;
  /** Last reset date (RAZ) in ISO 8601 format (YYYY-MM-DD) */
  lastResetDate: string;
  /** Reset number (numéro de RAZ) */
  resetNumber: number;
  /** Ticket number (pure numeric) */
  ticketNumber: number;
  /** Discount value in centimes (1250 = 12,50€) */
  discountValue: number;
  /** Cancel value in centimes (amount of cancelled items) */
  cancelValue: number;
  /** Number of cancelled items */
  cancelNumber: number;
  /** Array of payment entries (mode + value in centimes) */
  payments: Payment[];
  /** Total amount in centimes (1250 = 12,50€) */
  total: number;
}

/**
 * Form data for creating/editing a ticket (before validation)
 * Does not include auto-generated fields like id, dataHash, timestamps
 */
export interface TicketFormData {
  /** Ticket type */
  type: TicketType;
  /** Impression date (YYYY-MM-DD) */
  impressionDate: string;
  /** Last reset date (YYYY-MM-DD) */
  lastResetDate: string;
  /** Reset number */
  resetNumber: number;
  /** Ticket number */
  ticketNumber: number;
  /** Discount value in centimes */
  discountValue: number;
  /** Cancel value in centimes */
  cancelValue: number;
  /** Cancel number */
  cancelNumber: number;
  /** Payment entries */
  payments: Payment[];
  /** Total in centimes */
  total: number;
  /** Optional market association */
  marketId?: number;
}

/**
 * Create default ticket data for a new ticket
 * Used when creating a ticket from OCR or manual entry
 */
export function createDefaultTicketData(): Omit<TicketFormData, "marketId"> {
  return {
    type: "STATISTIQUES",
    impressionDate: new Date().toISOString().split("T")[0],
    lastResetDate: new Date().toISOString().split("T")[0],
    resetNumber: 0,
    ticketNumber: 0,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: [],
    total: 0,
  };
}
