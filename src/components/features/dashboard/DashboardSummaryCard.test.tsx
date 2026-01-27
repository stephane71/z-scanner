/**
 * Tests for DashboardSummaryCard component
 * Story 6.1: Activity Dashboard
 *
 * Tests cover:
 * - Loading skeleton state
 * - Displays correct data when loaded
 * - Empty state with encouraging message
 * - Accessibility requirements
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardSummaryCard } from './DashboardSummaryCard';

// Mock the useDashboardStats hook
vi.mock('@/hooks', () => ({
  useDashboardStats: vi.fn(),
}));

// Import the mock to control it
import { useDashboardStats } from '@/hooks';
const mockUseDashboardStats = vi.mocked(useDashboardStats);

describe('DashboardSummaryCard', () => {
  it('renders loading skeleton when isLoading is true', () => {
    mockUseDashboardStats.mockReturnValue({
      ticketsThisMonth: 0,
      revenueThisMonth: 0,
      marketsVisited: 0,
      isLoading: true,
    });

    render(<DashboardSummaryCard userId="user-123" />);

    // Should show skeleton elements
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
  });

  it('renders data correctly when loaded', () => {
    mockUseDashboardStats.mockReturnValue({
      ticketsThisMonth: 15,
      revenueThisMonth: 123450, // 1234.50 €
      marketsVisited: 3,
      isLoading: false,
    });

    render(<DashboardSummaryCard userId="user-123" />);

    // Should display ticket count (visual element has aria-hidden)
    expect(screen.getByText('15')).toBeInTheDocument();
    // Check for "tickets" label - use getAllByText since sr-only and visual label both contain it
    const ticketsLabels = screen.getAllByText(/tickets/i);
    expect(ticketsLabels.length).toBeGreaterThan(0);

    // Should display revenue formatted (both sr-only and visual)
    const revenueLabels = screen.getAllByText(/1[\s\u00a0]?234,50[\s\u00a0]?€/);
    expect(revenueLabels.length).toBeGreaterThan(0);

    // Should display markets count and label
    expect(screen.getByText('3')).toBeInTheDocument();
    const marchesLabels = screen.getAllByText(/marchés/i);
    expect(marchesLabels.length).toBeGreaterThan(0);
  });

  it('renders empty state when no tickets exist', () => {
    mockUseDashboardStats.mockReturnValue({
      ticketsThisMonth: 0,
      revenueThisMonth: 0,
      marketsVisited: 0,
      isLoading: false,
    });

    render(<DashboardSummaryCard userId="user-123" />);

    // Should show encouraging message
    expect(screen.getByText(/prêt à commencer/i)).toBeInTheDocument();
    expect(screen.getByText(/scannez votre premier ticket/i)).toBeInTheDocument();

    // Should show CTA link to scan page
    const scanLink = screen.getByTestId('dashboard-scan-cta');
    expect(scanLink).toBeInTheDocument();
    expect(scanLink).toHaveAttribute('href', '/scan');
    expect(scanLink).toHaveTextContent(/scanner un ticket/i);
  });

  it('renders card title correctly', () => {
    mockUseDashboardStats.mockReturnValue({
      ticketsThisMonth: 5,
      revenueThisMonth: 5000,
      marketsVisited: 1,
      isLoading: false,
    });

    render(<DashboardSummaryCard userId="user-123" />);

    expect(screen.getByText(/mon activité ce mois/i)).toBeInTheDocument();
  });

  it('calls useDashboardStats with correct userId', () => {
    mockUseDashboardStats.mockReturnValue({
      ticketsThisMonth: 0,
      revenueThisMonth: 0,
      marketsVisited: 0,
      isLoading: false,
    });

    render(<DashboardSummaryCard userId="test-user-id" />);

    expect(mockUseDashboardStats).toHaveBeenCalledWith('test-user-id');
  });

  it('renders single market correctly (singular)', () => {
    mockUseDashboardStats.mockReturnValue({
      ticketsThisMonth: 1,
      revenueThisMonth: 1000,
      marketsVisited: 1,
      isLoading: false,
    });

    render(<DashboardSummaryCard userId="user-123" />);

    // Should show "marché" (singular)
    expect(screen.getByText(/marché$/i)).toBeInTheDocument();
  });

  it('renders single ticket correctly (singular)', () => {
    mockUseDashboardStats.mockReturnValue({
      ticketsThisMonth: 1,
      revenueThisMonth: 1000,
      marketsVisited: 1,
      isLoading: false,
    });

    render(<DashboardSummaryCard userId="user-123" />);

    // Should show "ticket" (singular)
    expect(screen.getByText(/ticket$/i)).toBeInTheDocument();
  });
});
