/**
 * Unit tests for VerificationHeader component
 * Story 3.4: Verification Screen - Task 2
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VerificationHeader } from './VerificationHeader';

describe('VerificationHeader', () => {
  describe('Rendering', () => {
    it('should render the verification title', () => {
      render(<VerificationHeader onBack={vi.fn()} />);

      expect(screen.getByText('Vérification')).toBeInTheDocument();
    });

    it('should render the back button with aria-label', () => {
      render(<VerificationHeader onBack={vi.fn()} />);

      const backButton = screen.getByLabelText('Retour');
      expect(backButton).toBeInTheDocument();
    });

    it('should render the NF525 badge', () => {
      render(<VerificationHeader onBack={vi.fn()} />);

      expect(screen.getByText('NF525')).toBeInTheDocument();
    });

    it('should have sticky positioning', () => {
      render(<VerificationHeader onBack={vi.fn()} />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0');
    });
  });

  describe('Interaction', () => {
    it('should call onBack when back button is clicked', () => {
      const onBack = vi.fn();
      render(<VerificationHeader onBack={onBack} />);

      const backButton = screen.getByLabelText('Retour');
      fireEvent.click(backButton);

      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible back button', () => {
      render(<VerificationHeader onBack={vi.fn()} />);

      const backButton = screen.getByLabelText('Retour');
      expect(backButton).toHaveAttribute('aria-label', 'Retour');
    });

    it('should hide decorative SVGs from screen readers', () => {
      const { container } = render(<VerificationHeader onBack={vi.fn()} />);

      const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });
});
