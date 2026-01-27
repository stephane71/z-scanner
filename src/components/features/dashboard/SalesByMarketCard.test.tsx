/**
 * Tests for SalesByMarketCard component
 * Story 6.3: Sales by Market
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SalesByMarketCard, SalesByMarketLoadingSkeleton } from './SalesByMarketCard';
import type { MarketStats } from '@/hooks';

// Mock useSalesByMarket
vi.mock('@/hooks', () => ({
  useSalesByMarket: vi.fn(),
}));

// Import after mock
import { useSalesByMarket } from '@/hooks';

const mockUseSalesByMarket = vi.mocked(useSalesByMarket);

// Mock formatCurrency
vi.mock('@/lib/utils/format', () => ({
  formatCurrency: (centimes: number) => `${(centimes / 100).toFixed(2).replace('.', ',')} €`,
}));

describe('SalesByMarketCard', () => {
  const defaultUnassigned: MarketStats = {
    marketId: null,
    marketName: 'Non assigné',
    ticketCount: 0,
    revenue: 0,
  };

  it('renders loading skeleton when loading', () => {
    mockUseSalesByMarket.mockReturnValue({
      markets: [],
      unassigned: defaultUnassigned,
      isLoading: true,
    });

    render(<SalesByMarketCard userId="user-123" />);

    expect(screen.getByTestId('sales-by-market-skeleton')).toBeInTheDocument();
  });

  it('renders empty state when no markets and no unassigned tickets', () => {
    mockUseSalesByMarket.mockReturnValue({
      markets: [],
      unassigned: defaultUnassigned,
      isLoading: false,
    });

    render(<SalesByMarketCard userId="user-123" />);

    expect(screen.getByText(/Aucune vente/i)).toBeInTheDocument();
  });

  it('renders market list with names and revenue', () => {
    mockUseSalesByMarket.mockReturnValue({
      markets: [
        { marketId: 1, marketName: 'Marché de Paris', ticketCount: 5, revenue: 25000 },
        { marketId: 2, marketName: 'Marché de Lyon', ticketCount: 3, revenue: 15000 },
      ],
      unassigned: defaultUnassigned,
      isLoading: false,
    });

    render(<SalesByMarketCard userId="user-123" />);

    expect(screen.getByText('Marché de Paris')).toBeInTheDocument();
    expect(screen.getByText('Marché de Lyon')).toBeInTheDocument();
    expect(screen.getByText(/5 tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/3 tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/250,00 €/)).toBeInTheDocument();
    expect(screen.getByText(/150,00 €/)).toBeInTheDocument();
  });

  it('renders unassigned row when unassigned tickets exist', () => {
    mockUseSalesByMarket.mockReturnValue({
      markets: [{ marketId: 1, marketName: 'Market A', ticketCount: 2, revenue: 10000 }],
      unassigned: { marketId: null, marketName: 'Non assigné', ticketCount: 3, revenue: 5000 },
      isLoading: false,
    });

    render(<SalesByMarketCard userId="user-123" />);

    expect(screen.getByText('Non assigné')).toBeInTheDocument();
    expect(screen.getByText(/3 tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/50,00 €/)).toBeInTheDocument();
  });

  it('does not render unassigned row when no unassigned tickets', () => {
    mockUseSalesByMarket.mockReturnValue({
      markets: [{ marketId: 1, marketName: 'Market A', ticketCount: 2, revenue: 10000 }],
      unassigned: defaultUnassigned,
      isLoading: false,
    });

    render(<SalesByMarketCard userId="user-123" />);

    expect(screen.queryByText('Non assigné')).not.toBeInTheDocument();
  });

  it('renders card header with icon and title', () => {
    mockUseSalesByMarket.mockReturnValue({
      markets: [{ marketId: 1, marketName: 'Market A', ticketCount: 2, revenue: 10000 }],
      unassigned: defaultUnassigned,
      isLoading: false,
    });

    render(<SalesByMarketCard userId="user-123" />);

    expect(screen.getByText('Ventes par marché')).toBeInTheDocument();
  });

  it('shows only unassigned when all tickets are unassigned', () => {
    mockUseSalesByMarket.mockReturnValue({
      markets: [],
      unassigned: { marketId: null, marketName: 'Non assigné', ticketCount: 10, revenue: 50000 },
      isLoading: false,
    });

    render(<SalesByMarketCard userId="user-123" />);

    expect(screen.getByText('Non assigné')).toBeInTheDocument();
    expect(screen.getByText(/10 tickets/i)).toBeInTheDocument();
  });

  it('has accessible market row links', () => {
    mockUseSalesByMarket.mockReturnValue({
      markets: [{ marketId: 1, marketName: 'Market A', ticketCount: 2, revenue: 10000 }],
      unassigned: defaultUnassigned,
      isLoading: false,
    });

    render(<SalesByMarketCard userId="user-123" />);

    const link = screen.getByRole('link', { name: /Market A/i });
    // Uses 'markets' (plural) to match existing filter in TicketsPageClient
    expect(link).toHaveAttribute('href', '/tickets?markets=1');
  });
});

describe('SalesByMarketLoadingSkeleton', () => {
  it('renders skeleton elements', () => {
    render(<SalesByMarketLoadingSkeleton />);

    expect(screen.getByTestId('sales-by-market-skeleton')).toBeInTheDocument();
  });
});
