'use client';

/**
 * PaymentEditor - Dynamic payment entries editor
 * Story 3.4: Verification Screen
 *
 * Allows adding/removing payment entries.
 * Payment mode selector (CB, ESPECES, CHEQUE, VIREMENT).
 * Value input in centimes (display as euros).
 */

import { CurrencyInput } from '@/components/ui/currency-input';
import { PAYMENT_MODE_LABELS, type PaymentMode, type Payment } from '@/lib/validation/ticket';

interface PaymentEditorProps {
  /** Current payments array */
  payments: Payment[];
  /** Callback when payments change */
  onChange: (payments: Payment[]) => void;
  /** Error message to display */
  error?: string;
  /** Optional className for styling */
  className?: string;
}

const PAYMENT_MODES: PaymentMode[] = ['CB', 'ESPECES', 'CHEQUE', 'VIREMENT'];

export function PaymentEditor({
  payments,
  onChange,
  error,
  className = '',
}: PaymentEditorProps) {
  const addPayment = () => {
    onChange([...payments, { mode: 'CB', value: 0 }]);
  };

  const removePayment = (index: number) => {
    if (payments.length <= 1) return; // Keep at least one payment
    const newPayments = payments.filter((_, i) => i !== index);
    onChange(newPayments);
  };

  const updatePaymentMode = (index: number, mode: PaymentMode) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], mode };
    onChange(newPayments);
  };

  const updatePaymentValue = (index: number, value: number) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], value };
    onChange(newPayments);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        Modes de paiement
      </label>

      {/* Payment entries */}
      <div className="space-y-2">
        {payments.map((payment, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-lg bg-gray-50 p-3"
          >
            {/* Mode selector */}
            <select
              value={payment.mode}
              onChange={(e) => updatePaymentMode(index, e.target.value as PaymentMode)}
              className="h-12 flex-1 rounded-md border border-gray-300 bg-white px-3 text-base focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/50"
              aria-label={`Mode de paiement ${index + 1}`}
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {PAYMENT_MODE_LABELS[mode]}
                </option>
              ))}
            </select>

            {/* Value input */}
            <div className="w-32">
              <CurrencyInput
                value={payment.value}
                onChange={(value) => updatePaymentValue(index, value)}
                aria-label={`Montant du paiement ${index + 1}`}
              />
            </div>

            {/* Remove button (only if more than one payment) */}
            {payments.length > 1 && (
              <button
                type="button"
                onClick={() => removePayment(index)}
                className="flex h-12 w-12 items-center justify-center rounded-md border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                aria-label={`Supprimer le paiement ${index + 1}`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add payment button */}
      <button
        type="button"
        onClick={addPayment}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 hover:border-green-500 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/50"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Ajouter un mode de paiement
      </button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Total display */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
        <span className="text-sm font-medium text-gray-500">
          Total des paiements
        </span>
        <span className="text-lg font-bold text-gray-900">
          {(payments.reduce((sum, p) => sum + p.value, 0) / 100).toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} €
        </span>
      </div>
    </div>
  );
}

export type { PaymentEditorProps };
