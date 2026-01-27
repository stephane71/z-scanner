/**
 * Tests for MarketRow component
 * Story 6.3: Sales by Market
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketRow } from './MarketRow';
import type { MarketStats } from '@/hooks';

// Mock formatCurrency
vi.mock('@/lib/utils/format', () => ({
  formatCurrency: (centimes: number) => `${(centimes / 100).toFixed(2).replace('.', ',')} €`,
}));

describe('MarketRow', () => {
  const defaultStats: MarketStats = {
    marketId: 1,
    marketName: 'Marché de Paris',
    ticketCount: 5,
    revenue: 25000,
  };

  it('renders market name', () => {
    render(<MarketRow stats={defaultStats} />);

    expect(screen.getByText('Marché de Paris')).toBeInTheDocument();
  });

  it('renders ticket count', () => {
    render(<MarketRow stats={defaultStats} />);

    expect(screen.getByText(/5 tickets/)).toBeInTheDocument();
  });

  it('renders revenue formatted', () => {
    render(<MarketRow stats={defaultStats} />);

    expect(screen.getByText(/250,00 €/)).toBeInTheDocument();
  });

  it('links to filtered ticket list with market ID using markets param', () => {
    render(<MarketRow stats={defaultStats} />);

    const link = screen.getByRole('link');
    // Uses 'markets' (plural) to match existing filter in TicketsPageClient
    expect(link).toHaveAttribute('href', '/tickets?markets=1');
  });

  it('links to unassigned filter using markets=0 marker', () => {
    const unassignedStats: MarketStats = {
      marketId: null,
      marketName: 'Non assigné',
      ticketCount: 3,
      revenue: 15000,
    };

    render(<MarketRow stats={unassignedStats} isUnassigned />);

    const link = screen.getByRole('link');
    // Uses markets=0 as marker for unassigned tickets
    expect(link).toHaveAttribute('href', '/tickets?markets=0');
  });

  it('has accessible aria-label', () => {
    render(<MarketRow stats={defaultStats} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Marché de Paris: 5 tickets, 250,00 €');
  });

  it('uses singular "ticket" when count is 1', () => {
    const singleTicket: MarketStats = {
      marketId: 1,
      marketName: 'Market A',
      ticketCount: 1,
      revenue: 1000,
    };

    render(<MarketRow stats={singleTicket} />);

    expect(screen.getByText(/1 ticket$/)).toBeInTheDocument();
  });

  it('has minimum 48px touch target height', () => {
    render(<MarketRow stats={defaultStats} />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('min-h-[48px]');
  });
});
