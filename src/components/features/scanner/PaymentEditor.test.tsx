/**
 * Unit tests for PaymentEditor component
 * Story 3.4: Verification Screen - Task 6
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentEditor } from './PaymentEditor';
import type { Payment } from '@/lib/validation/ticket';

describe('PaymentEditor', () => {
  const defaultPayments: Payment[] = [{ mode: 'CB', value: 1000 }];

  describe('Rendering', () => {
    it('should render label', () => {
      render(<PaymentEditor payments={defaultPayments} onChange={vi.fn()} />);

      expect(screen.getByText('Modes de paiement')).toBeInTheDocument();
    });

    it('should render payment entries', () => {
      const payments: Payment[] = [
        { mode: 'CB', value: 1000 },
        { mode: 'ESPECES', value: 500 },
      ];
      render(<PaymentEditor payments={payments} onChange={vi.fn()} />);

      // Check for mode selectors
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(2);
    });

    it('should render add payment button', () => {
      render(<PaymentEditor payments={defaultPayments} onChange={vi.fn()} />);

      expect(
        screen.getByText('Ajouter un mode de paiement')
      ).toBeInTheDocument();
    });

    it('should display total of payments', () => {
      const payments: Payment[] = [
        { mode: 'CB', value: 1500 },
        { mode: 'ESPECES', value: 500 },
      ];
      render(<PaymentEditor payments={payments} onChange={vi.fn()} />);

      expect(screen.getByText('Total des paiements')).toBeInTheDocument();
      expect(screen.getByText(/20,00\s*€/)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <PaymentEditor
          payments={defaultPayments}
          onChange={vi.fn()}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Payment Mode Selection', () => {
    it('should display all payment modes in selector', () => {
      render(<PaymentEditor payments={defaultPayments} onChange={vi.fn()} />);

      const select = screen.getByRole('combobox');

      // Check options exist
      expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
      expect(screen.getByText('Espèces')).toBeInTheDocument();
      expect(screen.getByText('Chèque')).toBeInTheDocument();
      expect(screen.getByText('Virement')).toBeInTheDocument();
    });

    it('should call onChange when mode is changed', () => {
      const onChange = vi.fn();
      render(<PaymentEditor payments={defaultPayments} onChange={onChange} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'ESPECES' } });

      expect(onChange).toHaveBeenCalledWith([{ mode: 'ESPECES', value: 1000 }]);
    });
  });

  describe('Adding Payments', () => {
    it('should add new payment when add button is clicked', () => {
      const onChange = vi.fn();
      render(<PaymentEditor payments={defaultPayments} onChange={onChange} />);

      fireEvent.click(screen.getByText('Ajouter un mode de paiement'));

      expect(onChange).toHaveBeenCalledWith([
        { mode: 'CB', value: 1000 },
        { mode: 'CB', value: 0 },
      ]);
    });
  });

  describe('Removing Payments', () => {
    it('should not show remove button for single payment', () => {
      render(<PaymentEditor payments={defaultPayments} onChange={vi.fn()} />);

      expect(
        screen.queryByLabelText('Supprimer le paiement 1')
      ).not.toBeInTheDocument();
    });

    it('should show remove buttons when multiple payments', () => {
      const payments: Payment[] = [
        { mode: 'CB', value: 1000 },
        { mode: 'ESPECES', value: 500 },
      ];
      render(<PaymentEditor payments={payments} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Supprimer le paiement 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Supprimer le paiement 2')).toBeInTheDocument();
    });

    it('should remove payment when remove button is clicked', () => {
      const onChange = vi.fn();
      const payments: Payment[] = [
        { mode: 'CB', value: 1000 },
        { mode: 'ESPECES', value: 500 },
      ];
      render(<PaymentEditor payments={payments} onChange={onChange} />);

      fireEvent.click(screen.getByLabelText('Supprimer le paiement 1'));

      expect(onChange).toHaveBeenCalledWith([{ mode: 'ESPECES', value: 500 }]);
    });
  });

  describe('Updating Values', () => {
    it('should update payment value when currency input changes', () => {
      const onChange = vi.fn();
      render(<PaymentEditor payments={defaultPayments} onChange={onChange} />);

      // Find the currency input and simulate blur with new value
      const input = screen.getByLabelText('Montant du paiement 1');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '25,00' } });
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith([{ mode: 'CB', value: 2500 }]);
    });
  });

  describe('Error Display', () => {
    it('should display error message when provided', () => {
      render(
        <PaymentEditor
          payments={defaultPayments}
          onChange={vi.fn()}
          error="Au moins un mode de paiement requis"
        />
      );

      expect(
        screen.getByText('Au moins un mode de paiement requis')
      ).toBeInTheDocument();
    });

    it('should not display error when not provided', () => {
      render(<PaymentEditor payments={defaultPayments} onChange={vi.fn()} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should have alert role on error', () => {
      render(
        <PaymentEditor
          payments={defaultPayments}
          onChange={vi.fn()}
          error="Erreur"
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on mode selectors', () => {
      const payments: Payment[] = [
        { mode: 'CB', value: 1000 },
        { mode: 'ESPECES', value: 500 },
      ];
      render(<PaymentEditor payments={payments} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Mode de paiement 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Mode de paiement 2')).toBeInTheDocument();
    });

    it('should have aria-label on value inputs', () => {
      const payments: Payment[] = [
        { mode: 'CB', value: 1000 },
        { mode: 'ESPECES', value: 500 },
      ];
      render(<PaymentEditor payments={payments} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Montant du paiement 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Montant du paiement 2')).toBeInTheDocument();
    });

    it('should hide decorative SVGs from screen readers', () => {
      const payments: Payment[] = [
        { mode: 'CB', value: 1000 },
        { mode: 'ESPECES', value: 500 },
      ];
      const { container } = render(
        <PaymentEditor payments={payments} onChange={vi.fn()} />
      );

      const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });
});
