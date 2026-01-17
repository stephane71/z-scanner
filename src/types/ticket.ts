/**
 * Ticket types for Z-Scanner local database
 * NF525 compliance: append-only data model, no UPDATE/DELETE operations
 */

/**
 * Ticket status following NF525 append-only pattern
 * - draft: Ticket being created, not yet validated
 * - validated: Ticket has been validated (immutable)
 * - cancelled: Ticket has been cancelled (immutable, with reason)
 */
export type TicketStatus = 'draft' | 'validated' | 'cancelled';

/**
 * Core ticket interface for IndexedDB storage
 * All monetary values stored as integer centimes (1250 = 12,50€)
 * All dates stored as ISO 8601 strings
 */
export interface Ticket {
  /** Auto-increment primary key (undefined before insert) */
  id?: number;
  /** SHA-256 hash for NF525 compliance (date + montantTTC + modeReglement + numeroTicket + userId) */
  dataHash: string;
  /** Ticket date in ISO 8601 format (YYYY-MM-DD) */
  date: string;
  /** Total amount TTC in integer centimes (1250 = 12,50€) */
  montantTTC: number;
  /** Payment method: CB, Espèces, Chèque, etc. */
  modeReglement: string;
  /** Ticket number from the cash register receipt */
  numeroTicket: string;
  /** Supabase auth.uid() of the ticket owner */
  userId: string;
  /** Optional foreign key to markets table */
  marketId?: number;
  /** Current ticket status (NF525: only validated/cancelled are final) */
  status: TicketStatus;
  /** ISO 8601 timestamp when ticket was created locally */
  createdAt: string;
  /** ISO 8601 timestamp when ticket was validated (NF525 requirement) */
  validatedAt?: string;
  /** ISO 8601 timestamp when ticket was cancelled (NF525 requirement) */
  cancelledAt?: string;
  /** Required cancellation reason when status = 'cancelled' */
  cancellationReason?: string;
  /** Device time at capture (client-side timestamp) */
  clientTimestamp: string;
  /** Server timestamp from Supabase after successful sync */
  serverTimestamp?: string;
}

/**
 * Form data for creating/editing a ticket (before validation)
 * Does not include auto-generated fields like id, dataHash, timestamps
 */
export interface TicketFormData {
  /** Ticket date (YYYY-MM-DD) */
  date: string;
  /** Total amount TTC in centimes */
  montantTTC: number;
  /** Payment method */
  modeReglement: string;
  /** Ticket number */
  numeroTicket: string;
  /** Optional market association */
  marketId?: number;
}
