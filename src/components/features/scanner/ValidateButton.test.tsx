/**
 * Unit tests for ValidateButton component
 * Story 3.4: Verification Screen - Task 7
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidateButton } from './ValidateButton';

describe('ValidateButton', () => {
  describe('Rendering', () => {
    it('should render VALIDER text', () => {
      render(<ValidateButton onClick={vi.fn()} />);

      expect(screen.getByText('VALIDER')).toBeInTheDocument();
    });

    it('should have 80px height as per UX spec', () => {
      render(<ValidateButton onClick={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ height: '80px' });
    });

    it('should have green background color', () => {
      render(<ValidateButton onClick={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-600');
    });

    it('should be full width', () => {
      render(<ValidateButton onClick={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('should apply custom className', () => {
      render(<ValidateButton onClick={vi.fn()} className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Interaction', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn();
      render(<ValidateButton onClick={onClick} />);

      fireEvent.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const onClick = vi.fn();
      render(<ValidateButton onClick={onClick} isValid={false} />);

      fireEvent.click(screen.getByRole('button'));

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const onClick = vi.fn();
      render(<ValidateButton onClick={onClick} isLoading />);

      fireEvent.click(screen.getByRole('button'));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Valid State', () => {
    it('should be enabled when isValid is true', () => {
      render(<ValidateButton onClick={vi.fn()} isValid={true} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when isValid is false', () => {
      render(<ValidateButton onClick={vi.fn()} isValid={false} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show reduced opacity when disabled', () => {
      render(<ValidateButton onClick={vi.fn()} isValid={false} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Loading State', () => {
    it('should be disabled when loading', () => {
      render(<ValidateButton onClick={vi.fn()} isLoading />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show "Validation..." text when loading', () => {
      render(<ValidateButton onClick={vi.fn()} isLoading />);

      expect(screen.getByText('Validation...')).toBeInTheDocument();
      expect(screen.queryByText('VALIDER')).not.toBeInTheDocument();
    });

    it('should show spinner when loading', () => {
      const { container } = render(<ValidateButton onClick={vi.fn()} isLoading />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should have aria-busy when loading', () => {
      render(<ValidateButton onClick={vi.fn()} isLoading />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Button Type', () => {
    it('should default to button type', () => {
      render(<ValidateButton onClick={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should accept submit type', () => {
      render(<ValidateButton onClick={vi.fn()} type="submit" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-disabled when disabled', () => {
      render(<ValidateButton onClick={vi.fn()} isValid={false} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should hide decorative SVGs from screen readers', () => {
      const { container } = render(<ValidateButton onClick={vi.fn()} />);

      const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });
});
