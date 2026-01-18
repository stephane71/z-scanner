'use client';

/**
 * OcrResult Component
 * Displays OCR extraction results with confidence indicators
 * Based on Z-ticket (Statistique Totaux) data model
 */

import type { OcrResult as OcrResultType, ConfidenceLevel, Payment } from '@/lib/ocr/types';
import { getConfidenceLevel } from '@/lib/ocr/types';

interface OcrResultProps {
  /** OCR extraction result */
  result: OcrResultType;
  /** Callback when user wants to edit a field */
  onEdit?: (field: string) => void;
}

/**
 * Display confidence indicator with appropriate color
 */
function ConfidenceIndicator({ score }: { score: number }) {
  const level = getConfidenceLevel(score);

  const colors: Record<ConfidenceLevel, string> = {
    high: 'bg-green-600',
    medium: 'bg-yellow-500',
    low: 'bg-red-600',
  };

  const labels: Record<ConfidenceLevel, string> = {
    high: 'Confiance élevée',
    medium: 'Confiance moyenne',
    low: 'Confiance faible',
  };

  return (
    <div
      className="flex items-center gap-2"
      title={`${labels[level]} (${Math.round(score * 100)}%)`}
    >
      <div
        className={`w-3 h-3 rounded-full ${colors[level]}`}
        role="img"
        aria-label={labels[level]}
      />
      <span className="text-sm text-gray-500">{Math.round(score * 100)}%</span>
    </div>
  );
}

/**
 * Format amount from centimes to euros
 */
function formatAmount(centimes: number | null): string {
  if (centimes === null) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(centimes / 100);
}

/**
 * Format date for display
 */
function formatDate(date: string | null): string {
  if (!date) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
    }).format(new Date(date));
  } catch {
    return date;
  }
}

/**
 * Format payment method for display
 */
function formatPaymentMode(mode: string): string {
  const labels: Record<string, string> = {
    CB: 'Carte bancaire',
    ESPECES: 'Espèces',
    CHEQUE: 'Chèque',
    VIREMENT: 'Virement',
  };

  return labels[mode] ?? mode;
}

/**
 * Format number for display
 */
function formatNumber(num: number | null): string {
  if (num === null) return '—';
  return num.toString();
}

/**
 * Single field display component
 */
function FieldDisplay({
  label,
  value,
  confidence,
  isNull,
  isHero,
  onEdit,
  fieldKey,
}: {
  label: string;
  value: string;
  confidence: number;
  isNull: boolean;
  isHero?: boolean;
  onEdit?: (field: string) => void;
  fieldKey: string;
}) {
  return (
    <div
      className={`bg-white rounded-lg border p-4 ${
        isHero ? 'border-green-300 bg-green-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-500">
            {label}
          </label>
          <p
            className={`mt-1 ${
              isHero
                ? 'text-3xl font-bold text-green-700'
                : 'text-lg text-gray-900'
            } ${isNull ? 'text-gray-400 italic' : ''}`}
          >
            {value}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ConfidenceIndicator score={confidence} />

          {onEdit && (
            <button
              onClick={() => onEdit(fieldKey)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={`Modifier ${label}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Warning for low confidence */}
      {getConfidenceLevel(confidence) === 'low' && !isNull && (
        <p className="mt-2 text-sm text-amber-600">
          Vérifiez cette valeur, la lecture est incertaine.
        </p>
      )}
    </div>
  );
}

/**
 * Payment list display
 */
function PaymentsList({
  payments,
  confidence,
  onEdit,
}: {
  payments: Payment[];
  confidence: number;
  onEdit?: (field: string) => void;
}) {
  if (payments.length === 0) {
    return (
      <FieldDisplay
        label="Paiements"
        value="Aucun paiement détecté"
        confidence={confidence}
        isNull={true}
        onEdit={onEdit}
        fieldKey="payments"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <label className="block text-sm font-medium text-gray-500">
          Paiements
        </label>
        <div className="flex items-center gap-3">
          <ConfidenceIndicator score={confidence} />
          {onEdit && (
            <button
              onClick={() => onEdit('payments')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Modifier les paiements"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {payments.map((payment, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
          >
            <span className="text-gray-700">{formatPaymentMode(payment.mode)}</span>
            <span className="font-medium text-gray-900">
              {formatAmount(payment.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * OCR result display with confidence indicators
 */
export function OcrResult({ result, onEdit }: OcrResultProps) {
  // Check if any confidence is low
  const hasLowConfidence = Object.values(result.confidence).some((c) => c < 0.5);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Données extraites
      </h2>

      {/* Hero field: Total */}
      <FieldDisplay
        label="Total"
        value={formatAmount(result.total)}
        confidence={result.confidence.total}
        isNull={result.total === null}
        isHero={true}
        onEdit={onEdit}
        fieldKey="total"
      />

      {/* Main fields */}
      <div className="space-y-3">
        <FieldDisplay
          label="Date d'impression"
          value={formatDate(result.impressionDate)}
          confidence={result.confidence.impressionDate}
          isNull={result.impressionDate === null}
          onEdit={onEdit}
          fieldKey="impressionDate"
        />

        <FieldDisplay
          label="N° de ticket"
          value={formatNumber(result.ticketNumber)}
          confidence={result.confidence.ticketNumber}
          isNull={result.ticketNumber === null}
          onEdit={onEdit}
          fieldKey="ticketNumber"
        />

        <PaymentsList
          payments={result.payments}
          confidence={result.confidence.payments}
          onEdit={onEdit}
        />
      </div>

      {/* Secondary fields */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 py-2">
          Voir plus de détails
        </summary>
        <div className="space-y-3 mt-3">
          <FieldDisplay
            label="Dernière RAZ"
            value={formatDate(result.lastResetDate)}
            confidence={result.confidence.lastResetDate}
            isNull={result.lastResetDate === null}
            onEdit={onEdit}
            fieldKey="lastResetDate"
          />

          <FieldDisplay
            label="N° de RAZ"
            value={formatNumber(result.resetNumber)}
            confidence={result.confidence.resetNumber}
            isNull={result.resetNumber === null}
            onEdit={onEdit}
            fieldKey="resetNumber"
          />

          <FieldDisplay
            label="Remises"
            value={formatAmount(result.discountValue)}
            confidence={result.confidence.discountValue}
            isNull={result.discountValue === null}
            onEdit={onEdit}
            fieldKey="discountValue"
          />

          <FieldDisplay
            label="Montant annulé"
            value={formatAmount(result.cancelValue)}
            confidence={result.confidence.cancelValue}
            isNull={result.cancelValue === null}
            onEdit={onEdit}
            fieldKey="cancelValue"
          />

          <FieldDisplay
            label="Nb annulations"
            value={formatNumber(result.cancelNumber)}
            confidence={result.confidence.cancelNumber}
            isNull={result.cancelNumber === null}
            onEdit={onEdit}
            fieldKey="cancelNumber"
          />
        </div>
      </details>

      {/* Overall accuracy hint */}
      {hasLowConfidence && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            Certaines valeurs sont incertaines. Veuillez les vérifier avant de valider.
          </p>
        </div>
      )}
    </div>
  );
}
