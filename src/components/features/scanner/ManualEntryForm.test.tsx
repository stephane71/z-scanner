/**
 * Unit tests for ManualEntryForm component
 * Story 3.5: Manual Entry Fallback
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ManualEntryForm } from './ManualEntryForm';
import {
  TicketVerificationSchema,
  type TicketVerificationForm,
} from '@/lib/validation/ticket';

// Get today's date in YYYY-MM-DD format for tests
const getToday = () => new Date().toISOString().split('T')[0];

// Wrapper component to provide form context
function TestWrapper() {
  const today = getToday();
  const form = useForm<TicketVerificationForm>({
    resolver: zodResolver(TicketVerificationSchema),
    defaultValues: {
      type: 'STATISTIQUES',
      impressionDate: today,
      lastResetDate: today,
      resetNumber: 0,
      ticketNumber: 1,
      discountValue: 0,
      cancelValue: 0,
      cancelNumber: 0,
      payments: [{ mode: 'CB', value: 0 }],
      total: 0,
    },
  });

  return <ManualEntryForm form={form} />;
}

describe('ManualEntryForm', () => {
  it('should render total hero', () => {
    render(<TestWrapper />);

    // TotalHero displays the total amount - there may be multiple (hero + form field)
    expect(screen.getAllByText(/TOTAL TTC/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should render impression date field', () => {
    render(<TestWrapper />);

    expect(screen.getByLabelText(/date d'impression/i)).toBeInTheDocument();
  });

  it('should render last reset date field', () => {
    render(<TestWrapper />);

    expect(screen.getByLabelText(/date dernière raz/i)).toBeInTheDocument();
  });

  it('should render ticket number field', () => {
    render(<TestWrapper />);

    expect(screen.getByLabelText(/n° ticket/i)).toBeInTheDocument();
  });

  it('should render reset number field', () => {
    render(<TestWrapper />);

    expect(screen.getByLabelText(/n° raz/i)).toBeInTheDocument();
  });

  it('should render payments section', () => {
    render(<TestWrapper />);

    expect(screen.getByText(/modes de paiement/i)).toBeInTheDocument();
  });

  it('should render total field', () => {
    render(<TestWrapper />);

    // Total is rendered via CurrencyInput which uses aria-label
    expect(screen.getByLabelText(/total ttc/i)).toBeInTheDocument();
  });

  it('should not show confidence indicators (no OCR)', () => {
    render(<TestWrapper />);

    // ConfidenceIndicator shows percentage badges for low confidence
    // Since confidence is null, none should be displayed
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    // Use a wrapper to test className
    function TestWrapperWithClass() {
      const today = getToday();
      const form = useForm<TicketVerificationForm>({
        resolver: zodResolver(TicketVerificationSchema),
        defaultValues: {
          type: 'STATISTIQUES',
          impressionDate: today,
          lastResetDate: today,
          resetNumber: 0,
          ticketNumber: 1,
          discountValue: 0,
          cancelValue: 0,
          cancelNumber: 0,
          payments: [{ mode: 'CB', value: 0 }],
          total: 0,
        },
      });
      return <ManualEntryForm form={form} className="test-class" />;
    }

    const { container } = render(<TestWrapperWithClass />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
