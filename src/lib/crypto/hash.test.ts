/**
 * Unit tests for SHA-256 hash utility
 * Story 3.6: Ticket Validation with NF525 Compliance
 *
 * Tests for:
 * - Deterministic output (same input = same hash)
 * - Correct field inclusion
 * - Hex-encoded output
 * - Payment sorting for consistency
 */

import { describe, it, expect } from 'vitest';
import { computeTicketHash, type TicketHashData } from './hash';

describe('computeTicketHash', () => {
  const baseData: TicketHashData = {
    impressionDate: '2026-01-21',
    total: 12500, // 125,00 EUR in centimes
    payments: [{ mode: 'CB', value: 12500 }],
    ticketNumber: 42,
    userId: 'user-123-abc',
  };

  it('should return a 64-character hex string (SHA-256)', () => {
    const hash = computeTicketHash(baseData);

    // SHA-256 produces 32 bytes = 64 hex characters
    expect(hash).toHaveLength(64);
    // Should only contain hex characters
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('should produce deterministic output for same input', () => {
    const hash1 = computeTicketHash(baseData);
    const hash2 = computeTicketHash(baseData);

    expect(hash1).toBe(hash2);
  });

  it('should produce different output for different impressionDate', () => {
    const hash1 = computeTicketHash(baseData);
    const hash2 = computeTicketHash({
      ...baseData,
      impressionDate: '2026-01-22',
    });

    expect(hash1).not.toBe(hash2);
  });

  it('should produce different output for different total', () => {
    const hash1 = computeTicketHash(baseData);
    const hash2 = computeTicketHash({
      ...baseData,
      total: 12501,
    });

    expect(hash1).not.toBe(hash2);
  });

  it('should produce different output for different ticketNumber', () => {
    const hash1 = computeTicketHash(baseData);
    const hash2 = computeTicketHash({
      ...baseData,
      ticketNumber: 43,
    });

    expect(hash1).not.toBe(hash2);
  });

  it('should produce different output for different userId', () => {
    const hash1 = computeTicketHash(baseData);
    const hash2 = computeTicketHash({
      ...baseData,
      userId: 'user-456-def',
    });

    expect(hash1).not.toBe(hash2);
  });

  it('should produce different output for different payments', () => {
    const hash1 = computeTicketHash(baseData);
    const hash2 = computeTicketHash({
      ...baseData,
      payments: [{ mode: 'ESPECES', value: 12500 }],
    });

    expect(hash1).not.toBe(hash2);
  });

  it('should produce same hash regardless of payment order (sorted by mode)', () => {
    const dataWithPaymentsA: TicketHashData = {
      ...baseData,
      payments: [
        { mode: 'CB', value: 5000 },
        { mode: 'ESPECES', value: 7500 },
      ],
    };

    const dataWithPaymentsB: TicketHashData = {
      ...baseData,
      payments: [
        { mode: 'ESPECES', value: 7500 },
        { mode: 'CB', value: 5000 },
      ],
    };

    const hash1 = computeTicketHash(dataWithPaymentsA);
    const hash2 = computeTicketHash(dataWithPaymentsB);

    expect(hash1).toBe(hash2);
  });

  it('should handle empty payments array', () => {
    const dataWithNoPayments: TicketHashData = {
      ...baseData,
      payments: [],
    };

    const hash = computeTicketHash(dataWithNoPayments);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('should handle multiple payments with same mode', () => {
    const dataWithDuplicateModes: TicketHashData = {
      ...baseData,
      payments: [
        { mode: 'CB', value: 5000 },
        { mode: 'CB', value: 7500 },
      ],
    };

    const hash = computeTicketHash(dataWithDuplicateModes);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('should handle special characters in userId', () => {
    const dataWithSpecialChars: TicketHashData = {
      ...baseData,
      userId: 'user-123-éèà@#$%',
    };

    const hash = computeTicketHash(dataWithSpecialChars);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('should handle zero total', () => {
    const dataWithZeroTotal: TicketHashData = {
      ...baseData,
      total: 0,
    };

    const hash = computeTicketHash(dataWithZeroTotal);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('should handle large total values', () => {
    const dataWithLargeTotal: TicketHashData = {
      ...baseData,
      total: 99999999, // 999,999.99 EUR
    };

    const hash = computeTicketHash(dataWithLargeTotal);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });
});
