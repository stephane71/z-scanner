/**
 * AnalyticsPageClient Component Tests
 * Story 6.3 Enhancement: Dedicated analytics page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AnalyticsPageClient } from './AnalyticsPageClient';

// Mock hooks
const mockUserId = 'test-user-id';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: mockUserId } },
      }),
    },
  }),
}));

// Mock dashboard components
vi.mock('@/components/features/dashboard', () => ({
  DashboardSummaryCard: ({ userId }: { userId: string }) => (
    <div data-testid="dashboard-summary-card">DashboardSummaryCard: {userId}</div>
  ),
  SalesByPeriodCard: ({ userId }: { userId: string }) => (
    <div data-testid="sales-by-period-card">SalesByPeriodCard: {userId}</div>
  ),
  SalesByMarketCard: ({ userId }: { userId: string }) => (
    <div data-testid="sales-by-market-card">SalesByMarketCard: {userId}</div>
  ),
}));

describe('AnalyticsPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    render(<AnalyticsPageClient />);

    // Should show skeleton initially (auth is loading)
    expect(screen.queryByTestId('dashboard-summary-card')).not.toBeInTheDocument();
  });

  it('renders all dashboard components after auth', async () => {
    render(<AnalyticsPageClient />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-summary-card')).toBeInTheDocument();
    });

    expect(screen.getByTestId('sales-by-period-card')).toBeInTheDocument();
    expect(screen.getByTestId('sales-by-market-card')).toBeInTheDocument();
  });

  it('passes userId to all dashboard cards', async () => {
    render(<AnalyticsPageClient />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-summary-card')).toHaveTextContent(mockUserId);
    });

    expect(screen.getByTestId('sales-by-period-card')).toHaveTextContent(mockUserId);
    expect(screen.getByTestId('sales-by-market-card')).toHaveTextContent(mockUserId);
  });
});

