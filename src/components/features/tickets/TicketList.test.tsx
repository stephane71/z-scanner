/**
 * TicketList component tests
 * Story 4.1: Ticket List (Historique)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketList } from './TicketList';
import type { Ticket } from '@/types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock TicketCard to simplify testing
vi.mock('./TicketCard', () => ({
  TicketCard: ({
    ticket,
    onClick,
  }: {
    ticket: Ticket;
    onClick?: () => void;
  }) => (
    <button
      data-testid={`ticket-card-${ticket.id}`}
      onClick={onClick}
    >
      Ticket {ticket.id}
    </button>
  ),
}));

const mockTickets: Ticket[] = [
  {
    id: 1,
    userId: 'user-123',
    status: 'validated',
    type: 'STATISTIQUES',
    impressionDate: '2026-01-15',
    lastResetDate: '2026-01-01',
    resetNumber: 1,
    ticketNumber: 42,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: [],
    total: 1250,
    dataHash: 'abc123',
    createdAt: '2026-01-15T10:00:00Z',
    clientTimestamp: '2026-01-15T10:00:00Z',
  },
  {
    id: 2,
    userId: 'user-123',
    status: 'draft',
    type: 'STATISTIQUES',
    impressionDate: '2026-01-14',
    lastResetDate: '2026-01-01',
    resetNumber: 1,
    ticketNumber: 41,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: [],
    total: 2500,
    dataHash: 'def456',
    createdAt: '2026-01-14T10:00:00Z',
    clientTimestamp: '2026-01-14T10:00:00Z',
  },
];

describe('TicketList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeleton when loading', () => {
    render(<TicketList tickets={[]} isLoading={true} />);
    expect(screen.getByTestId('ticket-list-skeleton')).toBeInTheDocument();
  });

  it('renders correct number of skeleton cards', () => {
    render(<TicketList tickets={[]} isLoading={true} />);
    const skeletons = screen.getAllByTestId('ticket-skeleton');
    expect(skeletons).toHaveLength(5);
  });

  it('renders ticket cards when not loading', () => {
    render(<TicketList tickets={mockTickets} isLoading={false} />);
    expect(screen.getByTestId('ticket-list')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-card-2')).toBeInTheDocument();
  });

  it('navigates to ticket detail on click', () => {
    render(<TicketList tickets={mockTickets} isLoading={false} />);

    fireEvent.click(screen.getByTestId('ticket-card-1'));
    expect(mockPush).toHaveBeenCalledWith('/tickets/1');
  });

  it('renders empty list when no tickets', () => {
    render(<TicketList tickets={[]} isLoading={false} />);
    expect(screen.getByTestId('ticket-list')).toBeInTheDocument();
    expect(screen.queryByTestId('ticket-card-1')).not.toBeInTheDocument();
  });
});
