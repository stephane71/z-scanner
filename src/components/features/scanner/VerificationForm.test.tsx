/**
 * Unit tests for VerificationForm component
 * Story 3.4: Verification Screen - Task 5
 * Story 4.6: Added MarketField integration tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VerificationForm } from './VerificationForm';
import {
  TicketVerificationSchema,
  type TicketVerificationForm,
} from '@/lib/validation/ticket';
import type { OcrConfidence, Market } from '@/types';

// Mock hooks for MarketField and MarketPicker
const mockUseMarketById = vi.fn();
const mockUseMarkets = vi.fn();

vi.mock('@/hooks', () => ({
  useMarketById: (...args: unknown[]) => mockUseMarketById(...args),
  useMarkets: (...args: unknown[]) => mockUseMarkets(...args),
  addMarket: vi.fn(() => Promise.resolve(1)),
  queueCreate: vi.fn(() => Promise.resolve(1)),
}));

// Helper wrapper component that provides form context
function FormWrapper({
  defaultValues,
  confidence,
  className,
  userId,
}: {
  defaultValues?: Partial<TicketVerificationForm>;
  confidence?: OcrConfidence | null;
  className?: string;
  userId?: string;
}) {
  const form = useForm<TicketVerificationForm>({
    resolver: zodResolver(TicketVerificationSchema),
    defaultValues: {
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
      ...defaultValues,
    },
    mode: 'onBlur',
  });

  return (
    <VerificationForm
      form={form}
      confidence={confidence ?? null}
      className={className}
      userId={userId}
    />
  );
}

describe('VerificationForm', () => {
  describe('Rendering', () => {
    it('should render all field labels', () => {
      render(<FormWrapper />);

      expect(screen.getByText("Date d'impression")).toBeInTheDocument();
      expect(screen.getByText('Date dernière RAZ')).toBeInTheDocument();
      expect(screen.getByText('N° Ticket')).toBeInTheDocument();
      expect(screen.getByText('N° RAZ')).toBeInTheDocument();
      expect(screen.getByText('Modes de paiement')).toBeInTheDocument();
      // TOTAL TTC appears twice (hero + form label), use getAllByText
      expect(screen.getAllByText('TOTAL TTC').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Remises')).toBeInTheDocument();
      expect(screen.getByText('Annulations (€)')).toBeInTheDocument();
      expect(screen.getByText('Nb annulations')).toBeInTheDocument();
    });

    it('should render TotalHero with formatted amount', () => {
      render(<FormWrapper defaultValues={{ total: 1250 }} />);

      // TotalHero displays total in 36px
      expect(screen.getByText('12,50')).toBeInTheDocument();
    });

    it('should render date inputs', () => {
      render(<FormWrapper />);

      expect(screen.getByLabelText("Date d'impression")).toHaveAttribute(
        'type',
        'date'
      );
      expect(screen.getByLabelText('Date dernière RAZ')).toHaveAttribute(
        'type',
        'date'
      );
    });

    it('should render number inputs', () => {
      render(<FormWrapper />);

      expect(screen.getByLabelText('N° Ticket')).toHaveAttribute(
        'type',
        'number'
      );
      expect(screen.getByLabelText('N° RAZ')).toHaveAttribute('type', 'number');
      expect(screen.getByLabelText('Nb annulations')).toHaveAttribute(
        'type',
        'number'
      );
    });

    it('should render PaymentEditor', () => {
      render(<FormWrapper />);

      // PaymentEditor shows payment mode selector
      expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<FormWrapper className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Confidence Indicators', () => {
    it('should not show confidence indicators when all high', () => {
      const highConfidence: OcrConfidence = {
        type: 0.95,
        impressionDate: 0.95,
        lastResetDate: 0.90,
        resetNumber: 0.85,
        ticketNumber: 0.88,
        discountValue: 0.90,
        cancelValue: 0.90,
        cancelNumber: 0.90,
        total: 0.92,
        payments: 0.85,
      };

      render(<FormWrapper confidence={highConfidence} />);

      // No confidence indicators should be visible (all above 0.8)
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should show confidence indicator for low confidence field', () => {
      const lowConfidence: OcrConfidence = {
        type: 0.95,
        impressionDate: 0.95,
        lastResetDate: 0.90,
        resetNumber: 0.85,
        ticketNumber: 0.88,
        discountValue: 0.90,
        cancelValue: 0.90,
        cancelNumber: 0.90,
        total: 0.60, // Below threshold
        payments: 0.85,
      };

      render(<FormWrapper confidence={lowConfidence} />);

      // Should show TotalHero confidence indicator
      const indicators = screen.getAllByRole('status');
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('should show confidence indicator for medium confidence', () => {
      const mediumConfidence: OcrConfidence = {
        type: 0.95,
        impressionDate: 0.65, // Medium confidence
        lastResetDate: 0.90,
        resetNumber: 0.85,
        ticketNumber: 0.88,
        discountValue: 0.90,
        cancelValue: 0.90,
        cancelNumber: 0.90,
        total: 0.92,
        payments: 0.85,
      };

      render(<FormWrapper confidence={mediumConfidence} />);

      // Should show indicator for impressionDate field
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not show indicators when confidence is null', () => {
      render(<FormWrapper confidence={null} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Form Values', () => {
    it('should display default form values', () => {
      render(
        <FormWrapper
          defaultValues={{
            impressionDate: '2026-01-18',
            ticketNumber: 42,
            resetNumber: 10,
          }}
        />
      );

      expect(screen.getByLabelText("Date d'impression")).toHaveValue(
        '2026-01-18'
      );
      expect(screen.getByLabelText('N° Ticket')).toHaveValue(42);
      expect(screen.getByLabelText('N° RAZ')).toHaveValue(10);
    });

    it('should display payment entries', () => {
      render(
        <FormWrapper
          defaultValues={{
            payments: [
              { mode: 'CB', value: 1000 },
              { mode: 'ESPECES', value: 500 },
            ],
            total: 1500,
          }}
        />
      );

      // Should have two payment entries
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should have labels for all inputs', () => {
      render(<FormWrapper />);

      // All inputs should have associated labels
      expect(screen.getByLabelText("Date d'impression")).toBeInTheDocument();
      expect(screen.getByLabelText('Date dernière RAZ')).toBeInTheDocument();
      expect(screen.getByLabelText('N° Ticket')).toBeInTheDocument();
      expect(screen.getByLabelText('N° RAZ')).toBeInTheDocument();
      expect(screen.getByLabelText('Nb annulations')).toBeInTheDocument();
    });

    it('should have currency input aria-labels', () => {
      render(<FormWrapper />);

      expect(screen.getByLabelText('Total TTC')).toBeInTheDocument();
      expect(screen.getByLabelText('Remises')).toBeInTheDocument();
      expect(screen.getByLabelText('Annulations')).toBeInTheDocument();
    });
  });

  describe('MarketField Integration (Story 4.6)', () => {
    const mockMarket: Market & { id: number } = {
      id: 1,
      name: 'Marché Bastille',
      userId: 'user-123',
      createdAt: '2026-01-01T00:00:00Z',
    };

    beforeEach(() => {
      mockUseMarketById.mockReturnValue({ market: mockMarket, isLoading: false });
      mockUseMarkets.mockReturnValue({ markets: [mockMarket], isLoading: false });
    });

    it('should not render MarketField when userId is not provided', () => {
      render(<FormWrapper />);

      // MarketField should not be rendered without userId
      expect(screen.queryByText('Marché')).not.toBeInTheDocument();
      expect(screen.queryByText('Aucun marché')).not.toBeInTheDocument();
    });

    it('should render MarketField when userId is provided', () => {
      mockUseMarketById.mockReturnValue({ market: undefined, isLoading: false });

      render(<FormWrapper userId="user-123" />);

      // "Marché" label should be visible
      expect(screen.getByText('Marché')).toBeInTheDocument();
      // MarketField shows "Aucun marché" when no market selected
      expect(screen.getByText('Aucun marché')).toBeInTheDocument();
    });

    it('should display selected market name when marketId is set', () => {
      render(
        <FormWrapper
          userId="user-123"
          defaultValues={{ marketId: 1 }}
        />
      );

      // Should display the market name from useMarketById
      expect(screen.getByText('Marché Bastille')).toBeInTheDocument();
    });
  });
});
