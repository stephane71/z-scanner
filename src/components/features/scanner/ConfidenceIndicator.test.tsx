/**
 * Unit tests for ConfidenceIndicator component
 * Story 3.4: Verification Screen - Task 8
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfidenceIndicator, getConfidenceBorderClass } from './ConfidenceIndicator';

describe('ConfidenceIndicator', () => {
  describe('High Confidence (>= 0.8)', () => {
    it('should render high confidence styling for 0.9', () => {
      const { container } = render(<ConfidenceIndicator confidence={0.9} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-green-100');
    });

    it('should render high confidence styling for exactly 0.8', () => {
      const { container } = render(<ConfidenceIndicator confidence={0.8} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-green-100');
    });

    it('should show checkmark icon', () => {
      const { container } = render(<ConfidenceIndicator confidence={0.9} />);

      // Check SVG contains checkmark path
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-green-600');
    });

    it('should have correct aria-label for high confidence', () => {
      render(<ConfidenceIndicator confidence={0.9} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute(
        'aria-label',
        'Confiance élevée (supérieure à 80%)'
      );
    });

    it('should show "Élevée" label when showLabel is true', () => {
      render(<ConfidenceIndicator confidence={0.9} showLabel />);

      expect(screen.getByText('Élevée')).toBeInTheDocument();
    });
  });

  describe('Medium Confidence (0.5 - 0.8)', () => {
    it('should render medium confidence styling for 0.6', () => {
      render(<ConfidenceIndicator confidence={0.6} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-yellow-100');
    });

    it('should render medium confidence styling for exactly 0.5', () => {
      render(<ConfidenceIndicator confidence={0.5} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-yellow-100');
    });

    it('should render medium confidence styling for 0.79', () => {
      render(<ConfidenceIndicator confidence={0.79} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-yellow-100');
    });

    it('should show warning icon', () => {
      const { container } = render(<ConfidenceIndicator confidence={0.6} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-yellow-600');
    });

    it('should have correct aria-label for medium confidence', () => {
      render(<ConfidenceIndicator confidence={0.6} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute(
        'aria-label',
        'Confiance moyenne (entre 50% et 80%)'
      );
    });

    it('should show "Moyenne" label when showLabel is true', () => {
      render(<ConfidenceIndicator confidence={0.6} showLabel />);

      expect(screen.getByText('Moyenne')).toBeInTheDocument();
    });
  });

  describe('Low Confidence (< 0.5)', () => {
    it('should render low confidence styling for 0.3', () => {
      render(<ConfidenceIndicator confidence={0.3} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-red-100');
    });

    it('should render low confidence styling for 0.49', () => {
      render(<ConfidenceIndicator confidence={0.49} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-red-100');
    });

    it('should render low confidence styling for 0', () => {
      render(<ConfidenceIndicator confidence={0} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-red-100');
    });

    it('should show error icon', () => {
      const { container } = render(<ConfidenceIndicator confidence={0.3} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-red-600');
    });

    it('should have correct aria-label for low confidence', () => {
      render(<ConfidenceIndicator confidence={0.3} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute(
        'aria-label',
        'Confiance faible (inférieure à 50%)'
      );
    });

    it('should show "Faible" label when showLabel is true', () => {
      render(<ConfidenceIndicator confidence={0.3} showLabel />);

      expect(screen.getByText('Faible')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size by default', () => {
      const { container } = render(<ConfidenceIndicator confidence={0.9} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4');
    });

    it('should render medium size when specified', () => {
      const { container } = render(<ConfidenceIndicator confidence={0.9} size="md" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-5', 'w-5');
    });
  });

  describe('Tooltip', () => {
    it('should show percentage in title attribute', () => {
      render(<ConfidenceIndicator confidence={0.85} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('title', '85% de confiance');
    });

    it('should round percentage to nearest integer', () => {
      render(<ConfidenceIndicator confidence={0.666} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('title', '67% de confiance');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      render(<ConfidenceIndicator confidence={0.9} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should hide decorative SVGs from screen readers', () => {
      const { container } = render(<ConfidenceIndicator confidence={0.9} />);

      const svg = container.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ConfidenceIndicator confidence={0.9} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('getConfidenceBorderClass', () => {
  it('should return green border for high confidence', () => {
    expect(getConfidenceBorderClass(0.9)).toBe('border-green-600');
  });

  it('should return yellow border for medium confidence', () => {
    expect(getConfidenceBorderClass(0.6)).toBe('border-yellow-600');
  });

  it('should return red border for low confidence', () => {
    expect(getConfidenceBorderClass(0.3)).toBe('border-red-600');
  });

  it('should handle boundary values correctly', () => {
    expect(getConfidenceBorderClass(0.8)).toBe('border-green-600');
    expect(getConfidenceBorderClass(0.5)).toBe('border-yellow-600');
    expect(getConfidenceBorderClass(0.49)).toBe('border-red-600');
  });
});
