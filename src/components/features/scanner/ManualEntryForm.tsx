'use client';

/**
 * ManualEntryForm - Form wrapper for manual ticket entry
 * Story 3.5: Manual Entry Fallback
 *
 * Thin wrapper around VerificationForm for manual entry.
 * Displays all Z-ticket fields without OCR confidence indicators.
 */

import type { UseFormReturn } from 'react-hook-form';
import { VerificationForm } from './VerificationForm';
import type { TicketVerificationForm } from '@/lib/validation/ticket';

interface ManualEntryFormProps {
  /** React Hook Form instance */
  form: UseFormReturn<TicketVerificationForm>;
  /** Optional className for styling */
  className?: string;
}

/**
 * Manual entry form - reuses VerificationForm with no confidence data
 */
export function ManualEntryForm({ form, className = '' }: ManualEntryFormProps) {
  return (
    <VerificationForm
      form={form}
      confidence={null} // No OCR = no confidence indicators
      className={className}
    />
  );
}

export type { ManualEntryFormProps };
