/**
 * Ticket form validation schema
 * Story 3.4: Verification Screen
 *
 * Zod validation schemas for Z-ticket form data.
 * Used with React Hook Form for inline validation.
 */

import { z } from 'zod';

/**
 * Payment mode validation
 */
export const PaymentModeSchema = z.enum(['CB', 'ESPECES', 'CHEQUE', 'VIREMENT'], {
  message: 'Mode de paiement invalide',
});

/**
 * Single payment entry validation
 */
export const PaymentSchema = z.object({
  mode: PaymentModeSchema,
  value: z
    .number({ message: 'Montant invalide' })
    .int('Le montant doit être un nombre entier (centimes)')
    .min(0, 'Le montant doit être positif'),
});

/**
 * Date string validation (YYYY-MM-DD format)
 */
const DateStringSchema = z
  .string({ message: 'Ce champ est obligatoire' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (AAAA-MM-JJ)')
  .refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: 'Date invalide' }
  );

/**
 * Positive integer validation
 */
const PositiveIntegerSchema = z
  .number({ message: 'Nombre invalide' })
  .int('Doit être un nombre entier')
  .min(0, 'Doit être positif');

/**
 * Non-negative currency amount (in centimes)
 */
const CurrencySchema = z
  .number({ message: 'Montant invalide' })
  .int('Le montant doit être un nombre entier (centimes)')
  .min(0, 'Le montant doit être positif');

/**
 * Full ticket verification form schema
 */
export const TicketVerificationSchema = z
  .object({
    type: z.literal('STATISTIQUES'),
    impressionDate: DateStringSchema,
    lastResetDate: DateStringSchema,
    resetNumber: PositiveIntegerSchema,
    ticketNumber: PositiveIntegerSchema.min(1, 'Le numéro de ticket doit être au moins 1'),
    discountValue: CurrencySchema,
    cancelValue: CurrencySchema,
    cancelNumber: PositiveIntegerSchema,
    payments: z
      .array(PaymentSchema, { message: 'Au moins un mode de paiement requis' })
      .min(1, 'Au moins un mode de paiement requis'),
    total: CurrencySchema.min(0, 'Le total doit être positif'),
  })
  .refine(
    (data) => {
      // Validate that total equals sum of payments
      const paymentsSum = data.payments.reduce((sum, p) => sum + p.value, 0);
      return data.total === paymentsSum;
    },
    {
      message: 'Le total doit correspondre à la somme des paiements',
      path: ['total'],
    }
  );

/**
 * Form input schema (for partial/intermediate validation)
 * Used for individual field validation on blur
 */
export const TicketFieldSchemas = {
  impressionDate: DateStringSchema,
  lastResetDate: DateStringSchema,
  resetNumber: PositiveIntegerSchema,
  ticketNumber: PositiveIntegerSchema.min(1, 'Le numéro de ticket doit être au moins 1'),
  discountValue: CurrencySchema,
  cancelValue: CurrencySchema,
  cancelNumber: PositiveIntegerSchema,
  total: CurrencySchema,
  payment: PaymentSchema,
} as const;

/**
 * Type inference from schemas
 */
export type PaymentMode = z.infer<typeof PaymentModeSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type TicketVerificationForm = z.infer<typeof TicketVerificationSchema>;

/**
 * French labels for payment modes
 */
export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  CB: 'Carte bancaire',
  ESPECES: 'Espèces',
  CHEQUE: 'Chèque',
  VIREMENT: 'Virement',
};

/**
 * French labels for form fields
 */
export const FIELD_LABELS: Record<keyof Omit<TicketVerificationForm, 'type'>, string> = {
  impressionDate: "Date d'impression",
  lastResetDate: 'Date dernière RAZ',
  resetNumber: 'N° RAZ',
  ticketNumber: 'N° Ticket',
  discountValue: 'Remises',
  cancelValue: 'Annulations (€)',
  cancelNumber: 'Nb annulations',
  payments: 'Modes de paiement',
  total: 'TOTAL TTC',
};
