/**
 * TicketsPageClient component tests
 * Story 4.1: Ticket List (Historique)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TicketsPageClient } from './TicketsPageClient';
import type { Ticket } from '@/types';

// Mock Supabase client
const mockGetUser = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

// Mock useTickets
const mockUseTickets = vi.fn();
vi.mock('@/hooks/useTickets', () => ({
  useTickets: (...args: unknown[]) => mockUseTickets(...args),
}));

// Mock components
vi.mock('@/components/features/tickets/TicketList', () => ({
  TicketList: ({ tickets }: { tickets: Ticket[] }) => (
    <div data-testid="ticket-list">Tickets: {tickets.length}</div>
  ),
  TicketListSkeleton: () => <div data-testid="ticket-skeleton">Loading...</div>,
}));

vi.mock('@/components/features/tickets/EmptyState', () => ({
  EmptyState: () => <div data-testid="empty-state">No tickets</div>,
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
];

describe('TicketsPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton while auth is loading', () => {
    // Never resolve the promise to keep in loading state
    mockGetUser.mockReturnValue(new Promise(() => {}));
    mockUseTickets.mockReturnValue({ tickets: undefined, isLoading: true });

    render(<TicketsPageClient />);
    expect(screen.getByTestId('ticket-skeleton')).toBeInTheDocument();
  });

  it('shows message when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockUseTickets.mockReturnValue({ tickets: undefined, isLoading: true });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(screen.getByText(/Veuillez vous connecter/)).toBeInTheDocument();
    });
  });

  it('shows empty state when user has no tickets', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockUseTickets.mockReturnValue({ tickets: [], isLoading: false });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  it('shows ticket list when user has tickets', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockUseTickets.mockReturnValue({ tickets: mockTickets, isLoading: false });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(screen.getByTestId('ticket-list')).toBeInTheDocument();
      expect(screen.getByText('Tickets: 1')).toBeInTheDocument();
    });
  });

  it('passes userId to useTickets hook', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-abc' } } });
    mockUseTickets.mockReturnValue({ tickets: [], isLoading: false });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(mockUseTickets).toHaveBeenCalledWith('user-abc');
    });
  });

  it('eventually shows content after stabilization delay', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockUseTickets.mockReturnValue({ tickets: mockTickets, isLoading: false });

    render(<TicketsPageClient />);

    // Should eventually show ticket list after auth + stabilization delay
    await waitFor(
      () => {
        expect(screen.getByTestId('ticket-list')).toBeInTheDocument();
      },
      { timeout: 500 } // Allow time for auth + 100ms stabilization
    );
  });
});
