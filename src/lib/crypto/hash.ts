/**
 * SHA-256 hash utility for NF525 compliance
 * Story 3.6: Ticket Validation with NF525 Compliance
 *
 * Computes a SHA-256 hash of ticket data for immutability verification.
 * Uses @noble/hashes for cryptographic hashing.
 *
 * @see https://github.com/paulmillr/noble-hashes
 */

import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import type { Payment } from '@/lib/ocr/types';

/**
 * Data required to compute ticket hash
 * Fields are ordered for deterministic hashing
 */
export interface TicketHashData {
  /** Impression date in YYYY-MM-DD format */
  impressionDate: string;
  /** Total amount in centimes (integer) */
  total: number;
  /** Array of payment entries */
  payments: Payment[];
  /** Ticket number (integer) */
  ticketNumber: number;
  /** User ID from Supabase auth.uid() */
  userId: string;
}

/**
 * Compute SHA-256 hash of ticket data for NF525 compliance
 *
 * Creates a deterministic hash by:
 * 1. Sorting payments by mode for consistent ordering
 * 2. Creating a canonical JSON representation
 * 3. Computing SHA-256 hash
 * 4. Returning hex-encoded result
 *
 * @param data - Ticket data to hash
 * @returns 64-character hex-encoded SHA-256 hash
 *
 * @example
 * ```typescript
 * const hash = computeTicketHash({
 *   impressionDate: '2026-01-21',
 *   total: 12500,
 *   payments: [{ mode: 'CB', value: 12500 }],
 *   ticketNumber: 42,
 *   userId: 'user-123',
 * });
 * // Returns: '5f4dcc3b5aa765d61d8327deb882cf99...' (64 chars)
 * ```
 */
export function computeTicketHash(data: TicketHashData): string {
  // Sort payments by mode for deterministic JSON serialization
  // This ensures the same payments in different order produce the same hash
  const sortedPayments = [...data.payments].sort((a, b) =>
    a.mode.localeCompare(b.mode)
  );

  // Create canonical string representation with fields in fixed order
  // Order: impressionDate, total, payments, ticketNumber, userId
  const canonical = JSON.stringify({
    impressionDate: data.impressionDate,
    total: data.total,
    payments: sortedPayments,
    ticketNumber: data.ticketNumber,
    userId: data.userId,
  });

  // Encode string to bytes and compute SHA-256 hash
  const hash = sha256(new TextEncoder().encode(canonical));

  // Return hex-encoded hash string
  return bytesToHex(hash);
}
