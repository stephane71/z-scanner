/**
 * TicketsPageClient component tests
 * Story 4.1: Ticket List (Historique)
 * Story 4.3: Filter by Date (with URL persistence)
 * Story 4.4: Filter by Market (with URL persistence)
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

// Mock hooks from barrel
const mockUseTicketsByMarket = vi.fn();
const mockUseMarkets = vi.fn();
vi.mock('@/hooks', () => ({
  useTicketsByMarket: (...args: unknown[]) => mockUseTicketsByMarket(...args),
  useMarkets: (...args: unknown[]) => mockUseMarkets(...args),
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

vi.mock('@/components/features/tickets/MarketFilter', () => ({
  MarketFilter: ({
    userId,
    selectedMarketIds,
    onApply,
  }: {
    userId: string;
    selectedMarketIds: number[];
    onApply: (ids: number[]) => void;
  }) => (
    <div data-testid="market-filter">
      <span>User: {userId}</span>
      <span>Selected: {selectedMarketIds.join(',') || 'none'}</span>
      <button onClick={() => onApply([1, 2])}>Apply Markets</button>
    </div>
  ),
}));

vi.mock('@/components/features/tickets/MarketFilterChip', () => ({
  MarketFilterChip: ({
    marketNames,
    onClear,
  }: {
    marketNames: string[];
    onClear: () => void;
  }) => (
    <div data-testid="market-filter-chip">
      {marketNames.length === 1 ? marketNames[0] : `${marketNames.length} marchés`}
      <button onClick={onClear}>Clear market chip</button>
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

// Mock markets data
const mockMarkets = [
  { id: 1, userId: 'user-123', name: 'Marché Bastille', createdAt: '2026-01-01' },
  { id: 2, userId: 'user-123', name: 'Marché Aligre', createdAt: '2026-01-01' },
  { id: 3, userId: 'user-123', name: 'Marché Bio', createdAt: '2026-01-01' },
];

describe('TicketsPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    // Default mock for useMarkets
    mockUseMarkets.mockReturnValue({ markets: mockMarkets, isLoading: false });
  });

  it('shows loading skeleton while auth is loading', () => {
    // Never resolve the promise to keep in loading state
    mockGetUser.mockReturnValue(new Promise(() => {}));
    mockUseTicketsByMarket.mockReturnValue({ tickets: undefined, isLoading: true });

    render(<TicketsPageClient />);
    expect(screen.getByTestId('ticket-skeleton')).toBeInTheDocument();
  });

  it('shows message when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockUseTicketsByMarket.mockReturnValue({ tickets: undefined, isLoading: true });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(screen.getByText(/Veuillez vous connecter/)).toBeInTheDocument();
    });
  });

  it('shows empty state when user has no tickets', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockUseTicketsByMarket.mockReturnValue({ tickets: [], isLoading: false });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  it('shows ticket list when user has tickets', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(screen.getByTestId('ticket-list')).toBeInTheDocument();
      expect(screen.getByText('Tickets: 1')).toBeInTheDocument();
    });
  });

  it('passes userId, null dates, and empty marketIds to hook initially', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-abc' } } });
    mockUseTicketsByMarket.mockReturnValue({ tickets: [], isLoading: false });

    render(<TicketsPageClient />);

    await waitFor(() => {
      expect(mockUseTicketsByMarket).toHaveBeenCalledWith('user-abc', null, null, []);
    });
  });

  it('eventually shows content after stabilization delay', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

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
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('date-range-filter')).toBeInTheDocument();
      });
    });

    it('updates URL when filter is applied', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

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
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

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
      mockUseTicketsByMarket.mockReturnValue({ tickets: [], isLoading: false });

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
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

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
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

      // Set URL params
      mockSearchParams = new URLSearchParams('start=2026-01-10&end=2026-01-20');

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(mockUseTicketsByMarket).toHaveBeenCalledWith(
          'user-123',
          '2026-01-10',
          '2026-01-20',
          []
        );
      });
    });
  });

  // Story 4.4: Filter by Market tests
  describe('Market filtering (Story 4.4)', () => {
    it('renders MarketFilter component', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('market-filter')).toBeInTheDocument();
      });
    });

    it('updates URL when market filter is applied', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('market-filter')).toBeInTheDocument();
      });

      // Apply market filter
      fireEvent.click(screen.getByText('Apply Markets'));

      // URLSearchParams encodes commas as %2C; decoded value is "1,2"
      expect(mockPush).toHaveBeenCalledWith(
        '/tickets?markets=1%2C2',
        { scroll: false }
      );
    });

    it('shows MarketFilterChip when URL has market params', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

      // Set URL params before render
      mockSearchParams = new URLSearchParams('markets=1');

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('market-filter-chip')).toBeInTheDocument();
        expect(screen.getByText('Marché Bastille')).toBeInTheDocument();
      });
    });

    it('clears market URL params when filter is cleared', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

      // Set URL params for active filter
      mockSearchParams = new URLSearchParams('markets=1,2');

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('market-filter-chip')).toBeInTheDocument();
      });

      // Clear filter via chip
      fireEvent.click(screen.getByText('Clear market chip'));

      // Should update URL without market params
      expect(mockPush).toHaveBeenCalledWith('/tickets', { scroll: false });
    });

    it('reads market filter from URL and passes to hook', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

      // Set URL params
      mockSearchParams = new URLSearchParams('markets=1,3');

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(mockUseTicketsByMarket).toHaveBeenCalledWith(
          'user-123',
          null,
          null,
          [1, 3]
        );
      });
    });

    it('shows empty state when market filter returns no results', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByMarket.mockReturnValue({ tickets: [], isLoading: false });

      // Set URL params for active market filter
      mockSearchParams = new URLSearchParams('markets=1');

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('date-filter-empty')).toBeInTheDocument();
        // Market filter chip should still be visible
        expect(screen.getByTestId('market-filter-chip')).toBeInTheDocument();
      });
    });
  });

  // Combined filters tests
  describe('Combined date and market filtering', () => {
    it('handles combined date and market filter in URL', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

      // Set URL params with both filters
      mockSearchParams = new URLSearchParams('start=2026-01-01&end=2026-01-15&markets=1,2');

      render(<TicketsPageClient />);

      await waitFor(() => {
        // Both chips should be visible
        expect(screen.getByTestId('filter-chip')).toBeInTheDocument();
        expect(screen.getByTestId('market-filter-chip')).toBeInTheDocument();

        // Hook should receive all params
        expect(mockUseTicketsByMarket).toHaveBeenCalledWith(
          'user-123',
          '2026-01-01',
          '2026-01-15',
          [1, 2]
        );
      });
    });

    it('preserves market filter when clearing date filter', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

      // Set URL params with both filters
      mockSearchParams = new URLSearchParams('start=2026-01-01&end=2026-01-15&markets=1');

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('filter-chip')).toBeInTheDocument();
      });

      // Clear date filter
      fireEvent.click(screen.getByText('Clear chip'));

      // Should keep market params
      expect(mockPush).toHaveBeenCalledWith('/tickets?markets=1', { scroll: false });
    });

    it('preserves date filter when clearing market filter', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockUseTicketsByMarket.mockReturnValue({ tickets: mockTickets, isLoading: false });

      // Set URL params with both filters
      mockSearchParams = new URLSearchParams('start=2026-01-01&end=2026-01-15&markets=1');

      render(<TicketsPageClient />);

      await waitFor(() => {
        expect(screen.getByTestId('market-filter-chip')).toBeInTheDocument();
      });

      // Clear market filter
      fireEvent.click(screen.getByText('Clear market chip'));

      // Should keep date params
      expect(mockPush).toHaveBeenCalledWith(
        '/tickets?start=2026-01-01&end=2026-01-15',
        { scroll: false }
      );
    });
  });
});
