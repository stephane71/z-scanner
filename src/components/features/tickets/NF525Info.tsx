'use client';

/**
 * NF525Info - NF525 compliance information display
 * Story 4.2: Ticket Detail View
 *
 * Shows NF525 badge (larger version), validation timestamp,
 * and dataHash with copy functionality. This provides visible
 * proof of compliance for audit purposes.
 */

import { useState } from 'react';
import { ShieldCheck, Copy, Check, Info } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format';

interface NF525InfoProps {
  /** SHA-256 hash for NF525 compliance */
  dataHash: string;
  /** ISO 8601 timestamp when ticket was validated */
  validatedAt: string;
}

export function NF525Info({ dataHash, validatedAt }: NF525InfoProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const truncatedHash = `${dataHash.slice(0, 8)}...${dataHash.slice(-8)}`;

  async function copyHash() {
    try {
      await navigator.clipboard.writeText(dataHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail if clipboard is unavailable
    }
  }

  return (
    <div
      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      data-testid="nf525-info"
    >
      {/* NF525 Badge - larger version */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
          <ShieldCheck
            className="w-5 h-5 text-blue-700"
            aria-hidden="true"
          />
        </div>
        <div>
          <span className="text-sm font-semibold text-blue-700">
            Conforme NF525
          </span>
        </div>
      </div>

      {/* Validation timestamp */}
      <div className="text-sm text-blue-600 mb-3">
        <span className="font-medium">Validé le :</span>{' '}
        {formatDateTime(validatedAt)}
      </div>

      {/* DataHash with copy */}
      <div className="flex items-start gap-2">
        <div className="flex-1 relative">
          <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
            <span className="font-medium">Empreinte (SHA-256) :</span>
            <button
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-blue-500 hover:text-blue-700"
              aria-label="Information sur l'empreinte"
              data-testid="info-button"
            >
              <Info className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
          {/* Tooltip explaining dataHash */}
          {showTooltip && (
            <div
              className="absolute left-0 top-full mt-1 z-10 p-2 bg-white border border-blue-200 rounded-lg shadow-lg text-xs text-blue-700 max-w-[280px]"
              data-testid="hash-tooltip"
            >
              L&apos;empreinte SHA-256 garantit l&apos;intégrité des données du ticket.
              Toute modification invaliderait cette empreinte, assurant la conformité NF525.
              <button
                type="button"
                onClick={() => setShowTooltip(false)}
                className="block mt-1 text-blue-500 hover:text-blue-700 underline"
              >
                Fermer
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={copyHash}
            className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            title="Copier l'empreinte complète"
            data-testid="copy-hash-button"
          >
            {truncatedHash}
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { NF525InfoProps };
