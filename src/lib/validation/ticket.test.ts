/**
 * Unit tests for ticket validation schema
 * Story 3.4: Verification Screen - Task 10
 */

import { describe, it, expect } from 'vitest';
import {
  PaymentModeSchema,
  PaymentSchema,
  TicketVerificationSchema,
  TicketFieldSchemas,
  type TicketVerificationForm,
} from './ticket';

describe('PaymentModeSchema', () => {
  it('should accept valid payment modes', () => {
    expect(PaymentModeSchema.parse('CB')).toBe('CB');
    expect(PaymentModeSchema.parse('ESPECES')).toBe('ESPECES');
    expect(PaymentModeSchema.parse('CHEQUE')).toBe('CHEQUE');
    expect(PaymentModeSchema.parse('VIREMENT')).toBe('VIREMENT');
  });

  it('should reject invalid payment modes', () => {
    const result = PaymentModeSchema.safeParse('BITCOIN');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Mode de paiement invalide');
    }
  });
});

describe('PaymentSchema', () => {
  it('should accept valid payment', () => {
    const result = PaymentSchema.parse({ mode: 'CB', value: 1000 });
    expect(result.mode).toBe('CB');
    expect(result.value).toBe(1000);
  });

  it('should reject negative value', () => {
    const result = PaymentSchema.safeParse({ mode: 'CB', value: -100 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Le montant doit être positif');
    }
  });

  it('should reject non-integer value', () => {
    const result = PaymentSchema.safeParse({ mode: 'CB', value: 10.5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Le montant doit être un nombre entier (centimes)'
      );
    }
  });

  it('should accept zero value', () => {
    const result = PaymentSchema.parse({ mode: 'ESPECES', value: 0 });
    expect(result.value).toBe(0);
  });
});

describe('TicketFieldSchemas', () => {
  describe('impressionDate', () => {
    it('should accept valid date format', () => {
      const result = TicketFieldSchemas.impressionDate.parse('2026-01-18');
      expect(result).toBe('2026-01-18');
    });

    it('should reject invalid date format', () => {
      const result = TicketFieldSchemas.impressionDate.safeParse('18/01/2026');
      expect(result.success).toBe(false);
    });

    it('should reject invalid date', () => {
      const result = TicketFieldSchemas.impressionDate.safeParse('2026-13-45');
      expect(result.success).toBe(false);
    });
  });

  describe('ticketNumber', () => {
    it('should accept positive integer', () => {
      const result = TicketFieldSchemas.ticketNumber.parse(42);
      expect(result).toBe(42);
    });

    it('should reject zero', () => {
      const result = TicketFieldSchemas.ticketNumber.safeParse(0);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Le numéro de ticket doit être au moins 1'
        );
      }
    });

    it('should reject negative number', () => {
      const result = TicketFieldSchemas.ticketNumber.safeParse(-5);
      expect(result.success).toBe(false);
    });
  });

  describe('resetNumber', () => {
    it('should accept zero', () => {
      const result = TicketFieldSchemas.resetNumber.parse(0);
      expect(result).toBe(0);
    });

    it('should accept positive integer', () => {
      const result = TicketFieldSchemas.resetNumber.parse(100);
      expect(result).toBe(100);
    });
  });

  describe('currency fields', () => {
    it('should accept zero for discountValue', () => {
      expect(TicketFieldSchemas.discountValue.parse(0)).toBe(0);
    });

    it('should accept positive value for cancelValue', () => {
      expect(TicketFieldSchemas.cancelValue.parse(500)).toBe(500);
    });

    it('should accept large total', () => {
      expect(TicketFieldSchemas.total.parse(99999999)).toBe(99999999);
    });
  });
});

describe('TicketVerificationSchema', () => {
  const validTicket: TicketVerificationForm = {
    type: 'STATISTIQUES',
    impressionDate: '2026-01-18',
    lastResetDate: '2026-01-15',
    resetNumber: 42,
    ticketNumber: 1,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: [{ mode: 'CB', value: 1250 }],
    total: 1250,
  };

  it('should accept valid ticket', () => {
    const result = TicketVerificationSchema.parse(validTicket);
    expect(result.type).toBe('STATISTIQUES');
    expect(result.total).toBe(1250);
  });

  it('should accept ticket with multiple payments', () => {
    const ticket = {
      ...validTicket,
      payments: [
        { mode: 'CB', value: 500 },
        { mode: 'ESPECES', value: 750 },
      ],
      total: 1250,
    };
    const result = TicketVerificationSchema.parse(ticket);
    expect(result.payments).toHaveLength(2);
  });

  it('should reject empty payments array', () => {
    const ticket = {
      ...validTicket,
      payments: [],
    };
    const result = TicketVerificationSchema.safeParse(ticket);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Au moins un mode de paiement requis'
      );
    }
  });

  it('should reject when total does not match payments sum', () => {
    const ticket = {
      ...validTicket,
      payments: [{ mode: 'CB', value: 1000 }],
      total: 1500, // Mismatch
    };
    const result = TicketVerificationSchema.safeParse(ticket);
    expect(result.success).toBe(false);
    if (!result.success) {
      const totalError = result.error.issues.find((e) => e.path.includes('total'));
      expect(totalError?.message).toBe(
        'Le total doit correspondre à la somme des paiements'
      );
    }
  });

  it('should accept when total matches multiple payments sum', () => {
    const ticket = {
      ...validTicket,
      payments: [
        { mode: 'CB', value: 1000 },
        { mode: 'ESPECES', value: 500 },
        { mode: 'CHEQUE', value: 250 },
      ],
      total: 1750,
    };
    const result = TicketVerificationSchema.parse(ticket);
    expect(result.total).toBe(1750);
  });

  it('should reject missing required fields', () => {
    const ticket = {
      impressionDate: '2026-01-18',
      // Missing other fields
    };
    const result = TicketVerificationSchema.safeParse(ticket);
    expect(result.success).toBe(false);
  });

  it('should require type field explicitly', () => {
    const ticketWithoutType = {
      impressionDate: '2026-01-18',
      lastResetDate: '2026-01-15',
      resetNumber: 42,
      ticketNumber: 1,
      discountValue: 0,
      cancelValue: 0,
      cancelNumber: 0,
      payments: [{ mode: 'CB', value: 1250 }],
      total: 1250,
    };
    const result = TicketVerificationSchema.safeParse(ticketWithoutType);
    expect(result.success).toBe(false);
  });
});

describe('Edge Cases', () => {
  it('should handle ticket with all payment modes', () => {
    const ticket = {
      type: 'STATISTIQUES' as const,
      impressionDate: '2026-01-18',
      lastResetDate: '2026-01-15',
      resetNumber: 0,
      ticketNumber: 1,
      discountValue: 100,
      cancelValue: 50,
      cancelNumber: 1,
      payments: [
        { mode: 'CB' as const, value: 250 },
        { mode: 'ESPECES' as const, value: 250 },
        { mode: 'CHEQUE' as const, value: 250 },
        { mode: 'VIREMENT' as const, value: 250 },
      ],
      total: 1000,
    };
    const result = TicketVerificationSchema.parse(ticket);
    expect(result.payments).toHaveLength(4);
  });

  it('should handle minimum valid ticket', () => {
    const ticket = {
      type: 'STATISTIQUES' as const,
      impressionDate: '2026-01-01',
      lastResetDate: '2026-01-01',
      resetNumber: 0,
      ticketNumber: 1,
      discountValue: 0,
      cancelValue: 0,
      cancelNumber: 0,
      payments: [{ mode: 'ESPECES' as const, value: 0 }],
      total: 0,
    };
    const result = TicketVerificationSchema.parse(ticket);
    expect(result.total).toBe(0);
  });
});
