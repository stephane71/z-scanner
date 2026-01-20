/**
 * Unit tests for TotalHero component
 * Story 3.4: Verification Screen - Task 4
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TotalHero } from './TotalHero';

describe('TotalHero', () => {
  describe('Rendering', () => {
    it('should render total amount in euros', () => {
      render(<TotalHero total={1250} />);

      expect(screen.getByText('12,50')).toBeInTheDocument();
      expect(screen.getByText('€')).toBeInTheDocument();
    });

    it('should render TOTAL TTC label', () => {
      render(<TotalHero total={1000} />);

      expect(screen.getByText('TOTAL TTC')).toBeInTheDocument();
    });

    it('should format large amounts with thousands separator', () => {
      render(<TotalHero total={123456} />);

      // French locale uses non-breaking space as thousands separator
      expect(screen.getByText(/1\s?234,56/)).toBeInTheDocument();
    });

    it('should format zero amount correctly', () => {
      render(<TotalHero total={0} />);

      expect(screen.getByText('0,00')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <TotalHero total={1000} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render total with 36px font size', () => {
      render(<TotalHero total={1000} />);

      const totalElement = screen.getByText('10,00');
      expect(totalElement).toHaveStyle({ fontSize: '36px' });
    });
  });

  describe('Confidence Indicator', () => {
    it('should not show confidence indicator when confidence is high (>= 0.8)', () => {
      render(<TotalHero total={1000} confidence={0.9} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should not show confidence indicator when confidence equals 0.8', () => {
      render(<TotalHero total={1000} confidence={0.8} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should show confidence indicator when confidence is medium (0.5-0.8)', () => {
      render(<TotalHero total={1000} confidence={0.6} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-label', 'Confiance moyenne');
      expect(screen.getByText('Confiance moyenne')).toBeInTheDocument();
    });

    it('should show confidence indicator when confidence is low (< 0.5)', () => {
      render(<TotalHero total={1000} confidence={0.3} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-label', 'Confiance faible');
      expect(screen.getByText('Confiance faible')).toBeInTheDocument();
    });

    it('should not show confidence indicator when confidence is not provided', () => {
      render(<TotalHero total={1000} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should apply yellow styling for medium confidence', () => {
      render(<TotalHero total={1000} confidence={0.6} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-yellow-100');
    });

    it('should apply red styling for low confidence', () => {
      render(<TotalHero total={1000} confidence={0.3} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-red-100');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for total amount', () => {
      render(<TotalHero total={2500} />);

      const totalElement = screen.getByLabelText('Total: 25,00 euros');
      expect(totalElement).toBeInTheDocument();
    });

    it('should have aria-hidden on decorative warning icon', () => {
      const { container } = render(<TotalHero total={1000} confidence={0.3} />);

      const svg = container.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small amounts (single centime)', () => {
      render(<TotalHero total={1} />);

      expect(screen.getByText('0,01')).toBeInTheDocument();
    });

    it('should handle very large amounts', () => {
      render(<TotalHero total={99999999} />);

      // French formatting with spaces
      expect(screen.getByText(/999\s?999,99/)).toBeInTheDocument();
    });

    it('should handle confidence at exact boundaries', () => {
      // Exactly 0.5 should be medium
      const { rerender } = render(<TotalHero total={1000} confidence={0.5} />);
      expect(screen.getByText('Confiance moyenne')).toBeInTheDocument();

      // Exactly 0.8 should not show indicator (high)
      rerender(<TotalHero total={1000} confidence={0.8} />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      // Just below 0.5 should be low
      rerender(<TotalHero total={1000} confidence={0.49} />);
      expect(screen.getByText('Confiance faible')).toBeInTheDocument();
    });
  });
});
