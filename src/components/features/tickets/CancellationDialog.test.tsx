/**
 * CancellationDialog component tests
 * Story 4.7: Ticket Cancellation (NF525 Compliant)
 *
 * Tests for the cancellation dialog that requires a reason
 * and confirms NF525-compliant ticket cancellation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CancellationDialog } from './CancellationDialog';

describe('CancellationDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering (AC #2)', () => {
    it('renders dialog title and warning message', () => {
      render(<CancellationDialog {...defaultProps} />);

      expect(screen.getByText('Annuler ce ticket')).toBeInTheDocument();
      expect(screen.getByText(/Attention/i)).toBeInTheDocument();
      expect(screen.getByText(/L'annulation est définitive/i)).toBeInTheDocument();
    });

    it('renders required textarea for cancellation reason', () => {
      render(<CancellationDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/raison/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('required');
    });

    it('renders dismiss and confirm buttons', () => {
      render(<CancellationDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /annuler$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirmer l'annulation/i })).toBeInTheDocument();
    });
  });

  describe('Reason Required Validation (AC #2)', () => {
    it('disables confirm button when reason is empty', () => {
      render(<CancellationDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: /confirmer l'annulation/i });
      expect(confirmButton).toBeDisabled();
    });

    it('enables confirm button when reason is entered', async () => {
      const user = userEvent.setup();
      render(<CancellationDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/raison/i);
      await user.type(textarea, 'Erreur de saisie');

      const confirmButton = screen.getByRole('button', { name: /confirmer l'annulation/i });
      expect(confirmButton).not.toBeDisabled();
    });

    it('disables confirm button when reason is only whitespace', async () => {
      const user = userEvent.setup();
      render(<CancellationDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/raison/i);
      await user.type(textarea, '   ');

      const confirmButton = screen.getByRole('button', { name: /confirmer l'annulation/i });
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Dismiss Behavior (AC #2)', () => {
    it('calls onOpenChange with false when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      render(<CancellationDialog {...defaultProps} />);

      const dismissButton = screen.getByRole('button', { name: /annuler$/i });
      await user.click(dismissButton);

      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Confirm Behavior (AC #3)', () => {
    it('calls onConfirm with reason when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(<CancellationDialog {...defaultProps} onConfirm={onConfirm} />);

      const textarea = screen.getByPlaceholderText(/raison/i);
      await user.type(textarea, 'Erreur de saisie');

      const confirmButton = screen.getByRole('button', { name: /confirmer l'annulation/i });
      await user.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledWith('Erreur de saisie');
    });

    it('closes dialog after successful confirmation', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      const onOpenChange = vi.fn();
      render(
        <CancellationDialog
          {...defaultProps}
          onConfirm={onConfirm}
          onOpenChange={onOpenChange}
        />
      );

      const textarea = screen.getByPlaceholderText(/raison/i);
      await user.type(textarea, 'Erreur de saisie');

      const confirmButton = screen.getByRole('button', { name: /confirmer l'annulation/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading state during cancellation', async () => {
      const user = userEvent.setup();
      // Create a promise that doesn't resolve immediately
      let resolveConfirm: () => void;
      const onConfirm = vi.fn().mockImplementation(() => new Promise<void>((resolve) => {
        resolveConfirm = resolve;
      }));
      render(<CancellationDialog {...defaultProps} onConfirm={onConfirm} />);

      const textarea = screen.getByPlaceholderText(/raison/i);
      await user.type(textarea, 'Erreur de saisie');

      const confirmButton = screen.getByRole('button', { name: /confirmer l'annulation/i });
      await user.click(confirmButton);

      // Should show loading indicator
      expect(screen.getByTestId('cancellation-loading')).toBeInTheDocument();
      expect(confirmButton).toBeDisabled();

      // Resolve the promise and wait for state updates to complete
      await act(async () => {
        resolveConfirm!();
      });
    });

    it('disables dismiss button during loading', async () => {
      const user = userEvent.setup();
      let resolveConfirm: () => void;
      const onConfirm = vi.fn().mockImplementation(() => new Promise<void>((resolve) => {
        resolveConfirm = resolve;
      }));
      render(<CancellationDialog {...defaultProps} onConfirm={onConfirm} />);

      const textarea = screen.getByPlaceholderText(/raison/i);
      await user.type(textarea, 'Erreur de saisie');

      const confirmButton = screen.getByRole('button', { name: /confirmer l'annulation/i });
      await user.click(confirmButton);

      const dismissButton = screen.getByRole('button', { name: /annuler$/i });
      expect(dismissButton).toBeDisabled();

      // Resolve the promise and wait for state updates to complete
      await act(async () => {
        resolveConfirm!();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when cancellation fails', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockRejectedValue(new Error('Network error'));
      render(<CancellationDialog {...defaultProps} onConfirm={onConfirm} />);

      const textarea = screen.getByPlaceholderText(/raison/i);
      await user.type(textarea, 'Test cancellation');

      const confirmButton = screen.getByRole('button', { name: /confirmer l'annulation/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Network error');
      });
    });
  });
});
