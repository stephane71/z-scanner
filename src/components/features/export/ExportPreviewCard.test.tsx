/**
 * Tests for ExportPreviewCard component
 * Story 5.1: Export Page & Period Selection
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExportPreviewCard } from './ExportPreviewCard';

describe('ExportPreviewCard', () => {
  const defaultProps = {
    ticketCount: 15,
    totalAmount: 123450, // 1234.50 €
    isLoading: false,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
  };

  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      render(<ExportPreviewCard {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('export-preview-skeleton')).toBeInTheDocument();
      expect(screen.getByText("Aperçu de l'export")).toBeInTheDocument();
    });

    it('does not show ticket count when loading', () => {
      render(<ExportPreviewCard {...defaultProps} isLoading={true} />);

      expect(screen.queryByText('15 tickets')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders empty message when no tickets', () => {
      render(<ExportPreviewCard {...defaultProps} ticketCount={0} totalAmount={0} />);

      expect(screen.getByTestId('export-preview-empty')).toBeInTheDocument();
      expect(screen.getByText('Aucun ticket pour cette période')).toBeInTheDocument();
      expect(screen.getByText('Sélectionnez une autre période')).toBeInTheDocument();
    });
  });

  describe('data display', () => {
    it('renders ticket count', () => {
      render(<ExportPreviewCard {...defaultProps} />);

      expect(screen.getByTestId('export-preview-card')).toBeInTheDocument();
      expect(screen.getByText('15 tickets')).toBeInTheDocument();
    });

    it('renders singular ticket when count is 1', () => {
      render(<ExportPreviewCard {...defaultProps} ticketCount={1} />);

      expect(screen.getByText('1 ticket')).toBeInTheDocument();
    });

    it('renders formatted total amount', () => {
      render(<ExportPreviewCard {...defaultProps} />);

      // formatCurrency(123450) = "1 234,50 €" in French locale
      expect(screen.getByText(/Total :/)).toBeInTheDocument();
      expect(screen.getByText(/1\s?234,50/)).toBeInTheDocument();
    });

    it('renders formatted date range', () => {
      render(<ExportPreviewCard {...defaultProps} />);

      // formatDate converts to dd/MM/yyyy
      expect(screen.getByText(/Du 01\/01\/2026 au 31\/01\/2026/)).toBeInTheDocument();
    });

    it('renders the header with icon', () => {
      render(<ExportPreviewCard {...defaultProps} />);

      expect(screen.getByText("Aperçu de l'export")).toBeInTheDocument();
    });
  });
});
