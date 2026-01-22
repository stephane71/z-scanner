/**
 * TicketFields component tests
 * Story 4.2: Ticket Detail View
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketFields } from './TicketFields';
import type { Ticket } from '@/types';

// Mock useMarketById
const mockUseMarketById = vi.fn();
vi.mock('@/hooks/useMarkets', () => ({
  useMarketById: (id: number | undefined) => mockUseMarketById(id),
}));

describe('TicketFields', () => {
  const mockTicket: Ticket = {
    id: 1,
    userId: 'user-123',
    status: 'validated',
    type: 'STATISTIQUES',
    impressionDate: '2026-01-15',
    lastResetDate: '2026-01-01',
    resetNumber: 5,
    ticketNumber: 42,
    discountValue: 500, // 5.00 €
    cancelValue: 0,
    cancelNumber: 0,
    payments: [
      { mode: 'ESPECES', value: 5000 },
      { mode: 'CB', value: 7500 },
    ],
    total: 12500, // 125.00 €
    dataHash: 'abc123def456',
    createdAt: '2026-01-15T10:00:00Z',
    clientTimestamp: '2026-01-15T10:00:00Z',
    validatedAt: '2026-01-15T10:05:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMarketById.mockReturnValue({ market: undefined, isLoading: false });
  });

  it('displays total in hero style', () => {
    render(<TicketFields ticket={mockTicket} />);

    const total = screen.getByTestId('ticket-total');
    expect(total).toHaveTextContent('125,00');
    expect(total).toHaveClass('text-4xl'); // Hero size
  });

  it('displays formatted impression date', () => {
    render(<TicketFields ticket={mockTicket} />);

    expect(screen.getByText('15/01/2026')).toBeInTheDocument();
  });

  it('displays ticket number with hash prefix', () => {
    render(<TicketFields ticket={mockTicket} />);

    expect(screen.getByText('#42')).toBeInTheDocument();
  });

  it('displays payments breakdown', () => {
    render(<TicketFields ticket={mockTicket} />);

    expect(screen.getByText('ESPECES')).toBeInTheDocument();
    expect(screen.getByText('50,00 €')).toBeInTheDocument();
    expect(screen.getByText('CB')).toBeInTheDocument();
    expect(screen.getByText('75,00 €')).toBeInTheDocument();
  });

  it('displays discount value when > 0', () => {
    render(<TicketFields ticket={mockTicket} />);

    expect(screen.getByText('Remises')).toBeInTheDocument();
    expect(screen.getByText('-5,00 €')).toBeInTheDocument();
  });

  it('displays market name when assigned', () => {
    mockUseMarketById.mockReturnValue({
      market: { id: 1, name: 'Marché de Rungis', userId: 'user-123' },
      isLoading: false,
    });

    render(<TicketFields ticket={{ ...mockTicket, marketId: 1 }} />);

    expect(screen.getByText('Marché de Rungis')).toBeInTheDocument();
  });
});
