/**
 * Unit tests for OcrResult component
 * Story 3.3: OCR Processing (Claude 3.5 Haiku API)
 * Based on Z-ticket (Statistique Totaux) data model
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OcrResult } from './OcrResult';
import type { OcrResult as OcrResultType } from '@/lib/ocr/types';
import { createEmptyConfidence } from '@/lib/ocr/types';

describe('OcrResult', () => {
  const mockResult: OcrResultType = {
    type: 'STATISTIQUES',
    impressionDate: '2026-01-18',
    lastResetDate: '2026-01-15',
    resetNumber: 42,
    ticketNumber: 123,
    discountValue: 500,
    cancelValue: 250,
    cancelNumber: 2,
    payments: [
      { mode: 'CB', value: 3500 },
      { mode: 'ESPECES', value: 750 },
    ],
    total: 4250,
    confidence: {
      type: 0.98,
      impressionDate: 0.95,
      lastResetDate: 0.92,
      resetNumber: 0.90,
      ticketNumber: 0.88,
      discountValue: 0.85,
      cancelValue: 0.82,
      cancelNumber: 0.80,
      payments: 0.90,
      total: 0.95,
    },
  };

  it('should render header and main fields', () => {
    render(<OcrResult result={mockResult} />);

    expect(screen.getByText('Données extraites')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText("Date d'impression")).toBeInTheDocument();
    expect(screen.getByText('N° de ticket')).toBeInTheDocument();
    expect(screen.getByText('Paiements')).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<OcrResult result={mockResult} />);

    // French date format
    expect(screen.getByText(/18 janvier 2026/i)).toBeInTheDocument();
  });

  it('should format total amount correctly', () => {
    render(<OcrResult result={mockResult} />);

    // Format: 42,50 €
    expect(screen.getByText(/42,50/)).toBeInTheDocument();
  });

  it('should display payment methods with amounts', () => {
    render(<OcrResult result={mockResult} />);

    expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
    expect(screen.getByText('Espèces')).toBeInTheDocument();
    expect(screen.getByText(/35,00/)).toBeInTheDocument(); // CB amount
    expect(screen.getByText(/7,50/)).toBeInTheDocument(); // ESPECES amount
  });

  it('should display ticket number', () => {
    render(<OcrResult result={mockResult} />);

    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('should show confidence percentages', () => {
    render(<OcrResult result={mockResult} />);

    // Confidence percentages should be displayed
    // Total and impressionDate both have 95%
    expect(screen.getAllByText('95%').length).toBeGreaterThanOrEqual(1);
    // Ticket number has 88%
    expect(screen.getByText('88%')).toBeInTheDocument();
  });

  it('should display dash for null values', () => {
    const nullResult: OcrResultType = {
      type: null,
      impressionDate: null,
      lastResetDate: null,
      resetNumber: null,
      ticketNumber: null,
      discountValue: null,
      cancelValue: null,
      cancelNumber: null,
      payments: [],
      total: null,
      confidence: createEmptyConfidence(),
    };

    render(<OcrResult result={nullResult} />);

    // Should have dashes for null values
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(3);
  });

  it('should show edit buttons when onEdit is provided', () => {
    const onEdit = vi.fn();
    render(<OcrResult result={mockResult} onEdit={onEdit} />);

    // Main fields should have edit buttons
    const editButtons = screen.getAllByRole('button', { name: /modifier/i });
    expect(editButtons.length).toBeGreaterThanOrEqual(4);
  });

  it('should call onEdit with correct field when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<OcrResult result={mockResult} onEdit={onEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /modifier/i });
    fireEvent.click(editButtons[0]); // First button is for total

    expect(onEdit).toHaveBeenCalledWith('total');
  });

  it('should show warning for low confidence values', () => {
    const lowConfidenceResult: OcrResultType = {
      ...mockResult,
      confidence: {
        ...mockResult.confidence,
        total: 0.3, // Low confidence
      },
    };

    render(<OcrResult result={lowConfidenceResult} />);

    expect(
      screen.getByText(/Vérifiez cette valeur/i)
    ).toBeInTheDocument();
  });

  it('should show overall warning when any field has low confidence', () => {
    const lowConfidenceResult: OcrResultType = {
      ...mockResult,
      confidence: {
        ...mockResult.confidence,
        impressionDate: 0.3, // Low confidence
      },
    };

    render(<OcrResult result={lowConfidenceResult} />);

    expect(
      screen.getByText(/Certaines valeurs sont incertaines/i)
    ).toBeInTheDocument();
  });

  it('should highlight total as hero field', () => {
    const { container } = render(<OcrResult result={mockResult} />);

    // Hero field should have larger text (text-3xl)
    const heroValue = container.querySelector('.text-3xl');
    expect(heroValue).toBeInTheDocument();
  });

  it('should show empty payments message when no payments', () => {
    const noPaymentsResult: OcrResultType = {
      ...mockResult,
      payments: [],
    };

    render(<OcrResult result={noPaymentsResult} />);

    expect(screen.getByText('Aucun paiement détecté')).toBeInTheDocument();
  });

  it('should have expandable details section', () => {
    render(<OcrResult result={mockResult} />);

    expect(screen.getByText('Voir plus de détails')).toBeInTheDocument();
  });

  describe('payment mode formatting', () => {
    it('should format CB correctly', () => {
      render(<OcrResult result={mockResult} />);
      expect(screen.getByText('Carte bancaire')).toBeInTheDocument();
    });

    it('should format ESPECES correctly', () => {
      render(<OcrResult result={mockResult} />);
      expect(screen.getByText('Espèces')).toBeInTheDocument();
    });

    it('should format CHEQUE correctly', () => {
      const result: OcrResultType = {
        ...mockResult,
        payments: [{ mode: 'CHEQUE', value: 1000 }],
      };
      render(<OcrResult result={result} />);
      expect(screen.getByText('Chèque')).toBeInTheDocument();
    });

    it('should format VIREMENT correctly', () => {
      const result: OcrResultType = {
        ...mockResult,
        payments: [{ mode: 'VIREMENT', value: 1000 }],
      };
      render(<OcrResult result={result} />);
      expect(screen.getByText('Virement')).toBeInTheDocument();
    });
  });
});
