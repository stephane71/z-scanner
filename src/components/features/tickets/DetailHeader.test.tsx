/**
 * DetailHeader component tests
 * Story 4.2: Ticket Detail View
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetailHeader } from './DetailHeader';

// Mock TicketSyncBadge
vi.mock('@/components/features/sync', () => ({
  TicketSyncBadge: ({ ticketId }: { ticketId: number }) => (
    <span data-testid="ticket-sync-badge">Sync Badge {ticketId}</span>
  ),
}));

describe('DetailHeader', () => {
  it('renders ticket number in title', () => {
    render(<DetailHeader ticketNumber={42} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Ticket #42'
    );
  });

  it('renders back button linking to /tickets', () => {
    render(<DetailHeader ticketNumber={1} />);

    const backLink = screen.getByTestId('back-button');
    expect(backLink).toHaveAttribute('href', '/tickets');
  });

  it('has accessible back button with aria-label', () => {
    render(<DetailHeader ticketNumber={1} />);

    const backLink = screen.getByLabelText('Retour à la liste des tickets');
    expect(backLink).toBeInTheDocument();
  });

  it('renders sync badge when ticketId is provided', () => {
    render(<DetailHeader ticketNumber={42} ticketId={123} />);

    expect(screen.getByTestId('ticket-sync-badge')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-sync-badge')).toHaveTextContent('Sync Badge 123');
  });

  it('does not render sync badge when ticketId is not provided', () => {
    render(<DetailHeader ticketNumber={42} />);

    expect(screen.queryByTestId('ticket-sync-badge')).not.toBeInTheDocument();
  });
});
