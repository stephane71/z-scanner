/**
 * TicketCard component tests
 * Story 4.1: Ticket List (Historique)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketCard } from './TicketCard';
import type { Ticket } from '@/types';

// Mock hooks
vi.mock('@/hooks/usePhoto', () => ({
  usePhoto: vi.fn(() => ({ photo: null, isLoading: false })),
}));

vi.mock('@/hooks/useMarkets', () => ({
  useMarketById: vi.fn(() => ({ market: undefined, isLoading: false })),
}));

// Mock TicketSyncBadge
vi.mock('@/components/features/sync', () => ({
  TicketSyncBadge: ({ ticketId }: { ticketId: number }) => (
    <span data-testid={`sync-badge-${ticketId}`}>Sync Badge</span>
  ),
}));

// Mock NF525Badge
vi.mock('./NF525Badge', () => ({
  NF525Badge: () => <span data-testid="nf525-badge">NF525</span>,
}));

const mockTicket: Ticket = {
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
  payments: [{ mode: 'CARTE_BANCAIRE', value: 1250 }],
  total: 1250,
  dataHash: 'abc123',
  createdAt: '2026-01-15T10:00:00Z',
  clientTimestamp: '2026-01-15T10:00:00Z',
};

describe('TicketCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ticket date formatted as dd/MM/yyyy', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByText('15/01/2026')).toBeInTheDocument();
  });

  it('renders ticket number with # prefix', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByText('#42')).toBeInTheDocument();
  });

  it('renders total amount in euro format', () => {
    render(<TicketCard ticket={mockTicket} />);
    // 1250 centimes = 12,50 €
    expect(screen.getByText('12,50 €')).toBeInTheDocument();
  });

  it('renders NF525 badge for validated tickets', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByTestId('nf525-badge')).toBeInTheDocument();
  });

  it('does not render NF525 badge for draft tickets', () => {
    const draftTicket = { ...mockTicket, status: 'draft' as const };
    render(<TicketCard ticket={draftTicket} />);
    expect(screen.queryByTestId('nf525-badge')).not.toBeInTheDocument();
  });

  it('renders TicketSyncBadge with ticketId', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByTestId('sync-badge-1')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<TicketCard ticket={mockTicket} onClick={handleClick} />);

    fireEvent.click(screen.getByTestId('ticket-card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has touch-friendly min-height', () => {
    render(<TicketCard ticket={mockTicket} />);
    const card = screen.getByTestId('ticket-card');
    expect(card).toHaveClass('min-h-[72px]');
  });

  it('renders placeholder when no photo', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByText('Photo')).toBeInTheDocument();
  });
});

describe('TicketCard with market', () => {
  it('renders market name when assigned', async () => {
    const { useMarketById } = await import('@/hooks/useMarkets');
    vi.mocked(useMarketById).mockReturnValue({
      market: { id: 1, userId: 'user-123', name: 'Marché St-Pierre', createdAt: '2026-01-01' },
      isLoading: false,
    });

    const ticketWithMarket = { ...mockTicket, marketId: 1 };
    render(<TicketCard ticket={ticketWithMarket} />);

    expect(screen.getByText('Marché St-Pierre')).toBeInTheDocument();
  });
});

describe('TicketCard with photo', () => {
  it('renders photo thumbnail when available', async () => {
    const { usePhoto } = await import('@/hooks/usePhoto');
    const mockBlob = new Blob(['test'], { type: 'image/webp' });
    vi.mocked(usePhoto).mockReturnValue({
      photo: {
        id: 1,
        ticketId: 1,
        blob: mockBlob,
        thumbnail: mockBlob,
        createdAt: '2026-01-15T10:00:00Z',
      },
      isLoading: false,
    });

    render(<TicketCard ticket={mockTicket} />);

    const img = screen.getByAltText('Photo du ticket');
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe('IMG');
  });
});

// Story 4.7: Cancelled ticket display tests
describe('TicketCard cancelled display (Story 4.7)', () => {
  const cancelledTicket: Ticket = {
    ...mockTicket,
    status: 'cancelled',
    cancelledAt: '2026-01-16T10:00:00Z',
    cancellationReason: 'Erreur de saisie',
  };

  it('renders "Annulé" badge for cancelled tickets', () => {
    render(<TicketCard ticket={cancelledTicket} />);
    expect(screen.getByText('Annulé')).toBeInTheDocument();
  });

  it('does not render NF525 badge for cancelled tickets', () => {
    render(<TicketCard ticket={cancelledTicket} />);
    expect(screen.queryByTestId('nf525-badge')).not.toBeInTheDocument();
  });

  it('applies muted/faded styling to cancelled ticket card', () => {
    render(<TicketCard ticket={cancelledTicket} />);
    const card = screen.getByTestId('ticket-card');
    expect(card).toHaveClass('opacity-60');
  });

  it('renders total with line-through for cancelled tickets', () => {
    render(<TicketCard ticket={cancelledTicket} />);
    const totalElement = screen.getByText('12,50 €');
    expect(totalElement).toHaveClass('line-through');
  });
});
