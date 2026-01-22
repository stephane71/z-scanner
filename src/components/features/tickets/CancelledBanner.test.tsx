/**
 * CancelledBanner component tests
 * Story 4.2: Ticket Detail View
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CancelledBanner } from './CancelledBanner';

describe('CancelledBanner', () => {
  const defaultProps = {
    reason: 'Erreur de saisie',
    cancelledAt: '2026-01-15T14:30:00.000Z',
  };

  it('renders cancelled status prominently', () => {
    render(<CancelledBanner {...defaultProps} />);

    expect(screen.getByText('Ticket annulé')).toBeInTheDocument();
    expect(screen.getByTestId('cancelled-banner')).toBeInTheDocument();
  });

  it('displays cancellation reason', () => {
    render(<CancelledBanner {...defaultProps} />);

    expect(screen.getByText('Motif :')).toBeInTheDocument();
    expect(screen.getByText('Erreur de saisie')).toBeInTheDocument();
  });

  it('displays formatted cancellation timestamp', () => {
    render(<CancelledBanner {...defaultProps} />);

    // Should show formatted date (dd/MM/yyyy HH:mm format)
    expect(screen.getByText(/Annulé le/)).toBeInTheDocument();
    expect(screen.getByText(/15\/01\/2026/)).toBeInTheDocument();
  });

  it('has alert role for accessibility', () => {
    render(<CancelledBanner {...defaultProps} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
