/**
 * TicketsPageClient component tests
 * Story 4.1: Ticket List (Historique)
 * Story 4.3: Filter by Date (with URL persistence)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

// Mock Next.js navigation hooks
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/tickets',
  useSearchParams: () => mockSearchParams,
}));

// Mock useTicketsByDateRange
const mockUseTicketsByDateRange = vi.fn();
vi.mock('@/hooks/useTicketsByDateRange', () => ({
  useTicketsByDateRange: (...args: unknown[]) => mockUseTicketsByDateRange(...args),
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

vi.mock('@/components/features/tickets/DateFilterEmpty', () => ({
  DateFilterEmpty: () => <div data-testid="date-filter-empty">No tickets in range</div>,
}));

vi.mock('@/components/features/tickets/DateRangeFilter', () => ({
  DateRangeFilter: ({
    onApply,
    onClear,
    currentStart,
    currentEnd,
  }: {
    onApply: (s: string, e: string) => void;
    onClear: () => void;
    currentStart: string | null;
    currentEnd: string | null;
  }) => (
    <div data-testid="date-range-filter">
      <button onClick={() => onApply('2026-01-01', '2026-01-15')}>Apply Filter</button>
      <button onClick={onClear}>Clear</button>
      <span>Start: {currentStart || 'none'}</span>
      <span>End: {currentEnd || 'none'}</span>
    </div>
  ),
}));

vi.mock('@/components/features/tickets/FilterChip', () => ({
  FilterChip: ({
    startDate,
    endDate,
    onClear,
  }: {
    startDate: string;
    endDate: string;
    onClear: () => void;
  }) => (
    <div data-testid="filter-chip">
      {startDate} - {endDate}
      <button onClick={onClear}>Clear chip</button>
    </div>
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
];

describe('TicketsPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it('shows loading skeleton while auth is loading', () => {
    // Never resolve the promise to keep in loading state
    mockGetUser.mockReturnValue(new Promise(() => {}));
    mockUseTicketsByDateRange.mockReturnValue({ tickets: undefined, isLoading: true });

    render(<TicketsPageClient />);
    expect(screen.getByTestId('ticket-skeleton')).toBeInTheDocument();
  });

  it('shows message when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockUseTicketsByDateRange.mockReturnValue({ tickets: undefined, isLoading: true });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(screen.getByText(/Veuillez vous connecter/)).toBeInTheDocument();
    });
  });

  it('shows empty state when user has no tickets', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockUseTicketsByDateRange.mockReturnValue({ tickets: [], isLoading: false });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  it('shows ticket list when user has tickets', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockUseTicketsByDateRange.mockReturnValue({ tickets: mockTickets, isLoading: false });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(screen.getByTestId('ticket-list')).toBeInTheDocument();
      expect(screen.getByText('Tickets: 1')).toBeInTheDocument();
    });
  });

  it('passes userId and null dates to useTicketsByDateRange hook initially', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-abc' } } });
    mockUseTicketsByDateRange.mockReturnValue({ tickets: [], isLoading: false });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(mockUseTicketsByDateRange).toHaveBeenCalledWith('user-abc', null, null);
    });
  });

  it('eventually shows content after stabilization delay', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockUseTicketsByDateRange.mockReturnValue({ tickets: mockTickets, isLoading: false });

    render(<TicketsPageClient />);

    // Should eventually show ticket list after auth + stabilization delay
    await waitFor(
      () => {
        expect(screen.getByTestId('ticket-list')).toBeInTheDocument();
      },
      { timeout: 500 } // Allow time for auth + 100ms stabilization
    );
  });

  // Story 4.3: Filter by Date tests
  describe('Date filtering (Story 4.3)', () => {
    it('renders DateRangeFilter component', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByDateRange.mockReturnValue({ tickets: mockTickets, isLoading: false });

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('date-range-filter')).toBeInTheDocument();
      });
    });

    it('updates URL when filter is applied', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByDateRange.mockReturnValue({ tickets: mockTickets, isLoading: false });

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('date-range-filter')).toBeInTheDocument();
      });

      // Apply filter
      fireEvent.click(screen.getByText('Apply Filter'));

      // Should update URL with filter params
      expect(mockPush).toHaveBeenCalledWith(
        '/tickets?start=2026-01-01&end=2026-01-15',
        { scroll: false }
      );
    });

    it('shows FilterChip when URL has filter params', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByDateRange.mockReturnValue({ tickets: mockTickets, isLoading: false });

      // Set URL params before render
      mockSearchParams = new URLSearchParams('start=2026-01-01&end=2026-01-15');

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('filter-chip')).toBeInTheDocument();
        expect(screen.getByText('2026-01-01 - 2026-01-15')).toBeInTheDocument();
      });
    });

    it('shows DateFilterEmpty when filter returns no results', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByDateRange.mockReturnValue({ tickets: [], isLoading: false });

      // Set URL params for active filter
      mockSearchParams = new URLSearchParams('start=2026-01-01&end=2026-01-15');

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('date-filter-empty')).toBeInTheDocument();
        // FilterChip should still be visible
        expect(screen.getByTestId('filter-chip')).toBeInTheDocument();
      });
    });

    it('clears URL params when filter is cleared', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByDateRange.mockReturnValue({ tickets: mockTickets, isLoading: false });

      // Set URL params for active filter
      mockSearchParams = new URLSearchParams('start=2026-01-01&end=2026-01-15');

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('filter-chip')).toBeInTheDocument();
      });

      // Clear filter via chip
      fireEvent.click(screen.getByText('Clear chip'));

      // Should update URL without filter params
      expect(mockPush).toHaveBeenCalledWith('/tickets', { scroll: false });
    });

    it('reads filter from URL params and passes to hook', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByDateRange.mockReturnValue({ tickets: mockTickets, isLoading: false });

      // Set URL params
      mockSearchParams = new URLSearchParams('start=2026-01-10&end=2026-01-20');

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(mockUseTicketsByDateRange).toHaveBeenCalledWith(
          'user-123',
          '2026-01-10',
          '2026-01-20'
        );
      });
    });
  });
});
