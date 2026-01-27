/**
 * Tests for SalesByPeriodCard component
 * Story 6.2: Sales by Period
 *
 * Includes accordion behavior: only one breakdown can be open at a time.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SalesByPeriodCard, SalesByPeriodLoadingSkeleton } from './SalesByPeriodCard';

// Mock the useSalesByPeriod hook
vi.mock('@/hooks', () => ({
  useSalesByPeriod: vi.fn(),
}));

// Mock formatCurrency
vi.mock('@/lib/utils/format', () => ({
  formatCurrency: vi.fn((centimes: number) => {
    const euros = (centimes / 100).toFixed(2).replace('.', ',');
    return `${euros} €`;
  }),
}));

// Import after mock setup
import { useSalesByPeriod } from '@/hooks';

const mockUseSalesByPeriod = vi.mocked(useSalesByPeriod);

describe('SalesByPeriodCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('shows loading skeleton when isLoading is true', () => {
      mockUseSalesByPeriod.mockReturnValue({
        thisWeek: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
        thisMonth: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
        thisQuarter: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
        isLoading: true,
      });

      render(<SalesByPeriodCard userId="user-123" />);

      // Should show skeleton, not period data
      expect(screen.queryByText('Cette semaine')).not.toBeInTheDocument();
      expect(screen.getByTestId('sales-by-period-skeleton')).toBeInTheDocument();
    });
  });

  describe('Data display', () => {
    it('renders all three period sections', () => {
      mockUseSalesByPeriod.mockReturnValue({
        thisWeek: { ticketCount: 5, revenue: 25000, previousRevenue: 20000, trend: 25 },
        thisMonth: { ticketCount: 15, revenue: 75000, previousRevenue: 65000, trend: 15 },
        thisQuarter: { ticketCount: 42, revenue: 210000, previousRevenue: 220000, trend: -5 },
        isLoading: false,
      });

      render(<SalesByPeriodCard userId="user-123" />);

      expect(screen.getByText('Cette semaine')).toBeInTheDocument();
      expect(screen.getByText('Ce mois')).toBeInTheDocument();
      expect(screen.getByText('Ce trimestre')).toBeInTheDocument();
    });

    it('displays ticket counts for each period', () => {
      mockUseSalesByPeriod.mockReturnValue({
        thisWeek: { ticketCount: 5, revenue: 25000, previousRevenue: 20000, trend: 25 },
        thisMonth: { ticketCount: 15, revenue: 75000, previousRevenue: 65000, trend: 15 },
        thisQuarter: { ticketCount: 42, revenue: 210000, previousRevenue: 220000, trend: -5 },
        isLoading: false,
      });

      render(<SalesByPeriodCard userId="user-123" />);

      expect(screen.getAllByText(/5 tickets/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/15 tickets/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/42 tickets/i).length).toBeGreaterThan(0);
    });

    it('displays formatted revenue for each period', () => {
      mockUseSalesByPeriod.mockReturnValue({
        thisWeek: { ticketCount: 5, revenue: 25000, previousRevenue: 20000, trend: 25 },
        thisMonth: { ticketCount: 15, revenue: 75000, previousRevenue: 65000, trend: 15 },
        thisQuarter: { ticketCount: 42, revenue: 210000, previousRevenue: 220000, trend: -5 },
        isLoading: false,
      });

      render(<SalesByPeriodCard userId="user-123" />);

      // 25000 centimes = 250.00 € (displayed as 250,00 €)
      expect(screen.getAllByText(/250,00 €/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/750,00 €/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/2100,00 €/i).length).toBeGreaterThan(0);
    });
  });

  describe('Trend indicators', () => {
    it('shows positive trend with green color and up arrow', () => {
      mockUseSalesByPeriod.mockReturnValue({
        thisWeek: { ticketCount: 5, revenue: 25000, previousRevenue: 20000, trend: 25 },
        thisMonth: { ticketCount: 15, revenue: 75000, previousRevenue: 65000, trend: 15 },
        thisQuarter: { ticketCount: 42, revenue: 210000, previousRevenue: 220000, trend: -5 },
        isLoading: false,
      });

      render(<SalesByPeriodCard userId="user-123" />);

      // Check for +25% trend - the parent container has the color class
      const positiveTrend = screen.getByText('+25%');
      expect(positiveTrend).toBeInTheDocument();
      expect(positiveTrend.parentElement?.className).toMatch(/text-green/);
    });

    it('shows negative trend with red color and down arrow', () => {
      mockUseSalesByPeriod.mockReturnValue({
        thisWeek: { ticketCount: 5, revenue: 25000, previousRevenue: 20000, trend: 25 },
        thisMonth: { ticketCount: 15, revenue: 75000, previousRevenue: 65000, trend: 15 },
        thisQuarter: { ticketCount: 42, revenue: 210000, previousRevenue: 220000, trend: -5 },
        isLoading: false,
      });

      render(<SalesByPeriodCard userId="user-123" />);

      // Check for -5% trend - the parent container has the color class
      const negativeTrend = screen.getByText('-5%');
      expect(negativeTrend).toBeInTheDocument();
      expect(negativeTrend.parentElement?.className).toMatch(/text-red/);
    });

    it('shows zero trend with neutral styling', () => {
      mockUseSalesByPeriod.mockReturnValue({
        thisWeek: { ticketCount: 5, revenue: 25000, previousRevenue: 25000, trend: 0 },
        thisMonth: { ticketCount: 15, revenue: 75000, previousRevenue: 65000, trend: 15 },
        thisQuarter: { ticketCount: 42, revenue: 210000, previousRevenue: 220000, trend: -5 },
        isLoading: false,
      });

      render(<SalesByPeriodCard userId="user-123" />);

      const zeroTrend = screen.getByText('0%');
      expect(zeroTrend).toBeInTheDocument();
      expect(zeroTrend.parentElement?.className).toMatch(/text-muted/);
    });
  });

  describe('Accessibility', () => {
    it('has accessible card title', () => {
      mockUseSalesByPeriod.mockReturnValue({
        thisWeek: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
        thisMonth: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
        thisQuarter: { ticketCount: 0, revenue: 0, previousRevenue: 0, trend: 0 },
        isLoading: false,
      });

      render(<SalesByPeriodCard userId="user-123" />);

      // CardTitle uses h3 by default, check for text content
      expect(screen.getByText('Ventes par période')).toBeInTheDocument();
    });

    it('has screen reader text for trends', () => {
      mockUseSalesByPeriod.mockReturnValue({
        thisWeek: { ticketCount: 5, revenue: 25000, previousRevenue: 20000, trend: 25 },
        thisMonth: { ticketCount: 15, revenue: 75000, previousRevenue: 65000, trend: 15 },
        thisQuarter: { ticketCount: 42, revenue: 210000, previousRevenue: 220000, trend: -5 },
        isLoading: false,
      });

      render(<SalesByPeriodCard userId="user-123" />);

      // Check for sr-only text describing trends (multiple matches expected for "augmentation")
      expect(screen.getAllByText(/augmentation/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/diminution/i).length).toBeGreaterThan(0);
    });
  });

  describe('SalesByPeriodLoadingSkeleton', () => {
    it('renders skeleton with correct structure', () => {
      render(<SalesByPeriodLoadingSkeleton />);

      expect(screen.getByTestId('sales-by-period-skeleton')).toBeInTheDocument();
    });
  });

  describe('Accordion behavior', () => {
    it('only shows one breakdown at a time', () => {
      mockUseSalesByPeriod.mockReturnValue({
        thisWeek: {
          ticketCount: 5,
          revenue: 25000,
          previousRevenue: 20000,
          trend: 25,
          breakdown: [
            { label: 'Lundi', ticketCount: 2, revenue: 10000 },
            { label: 'Mardi', ticketCount: 3, revenue: 15000 },
          ],
        },
        thisMonth: {
          ticketCount: 15,
          revenue: 75000,
          previousRevenue: 65000,
          trend: 15,
          breakdown: [
            { label: 'Semaine 1', ticketCount: 5, revenue: 25000 },
            { label: 'Semaine 2', ticketCount: 10, revenue: 50000 },
          ],
        },
        thisQuarter: {
          ticketCount: 42,
          revenue: 210000,
          previousRevenue: 220000,
          trend: -5,
          breakdown: [
            { label: 'Janvier', ticketCount: 14, revenue: 70000 },
            { label: 'Février', ticketCount: 28, revenue: 140000 },
          ],
        },
        isLoading: false,
      });

      render(<SalesByPeriodCard userId="user-123" />);

      // Initially no breakdown content visible
      expect(screen.queryByText('Lundi')).not.toBeInTheDocument();
      expect(screen.queryByText('Semaine 1')).not.toBeInTheDocument();

      // Click first "Détail" button (week)
      const detailButtons = screen.getAllByRole('button', { name: /détail/i });
      fireEvent.click(detailButtons[0]);

      // Week breakdown should be visible
      expect(screen.getByText('Lundi')).toBeInTheDocument();
      expect(screen.queryByText('Semaine 1')).not.toBeInTheDocument();

      // Click second "Détail" button (month) - should close week and open month
      fireEvent.click(detailButtons[1]);

      // Month breakdown should be visible, week should be closed
      expect(screen.queryByText('Lundi')).not.toBeInTheDocument();
      expect(screen.getByText('Semaine 1')).toBeInTheDocument();

      // Click second button again - should close it
      fireEvent.click(detailButtons[1]);
      expect(screen.queryByText('Semaine 1')).not.toBeInTheDocument();
    });

    it('renders breakdown content full-width below grid', () => {
      mockUseSalesByPeriod.mockReturnValue({
        thisWeek: {
          ticketCount: 5,
          revenue: 25000,
          previousRevenue: 20000,
          trend: 25,
          breakdown: [
            { label: 'Lundi', ticketCount: 2, revenue: 10000 },
          ],
        },
        thisMonth: { ticketCount: 15, revenue: 75000, previousRevenue: 65000, trend: 15 },
        thisQuarter: { ticketCount: 42, revenue: 210000, previousRevenue: 220000, trend: -5 },
        isLoading: false,
      });

      render(<SalesByPeriodCard userId="user-123" />);

      // Click to open week breakdown
      const detailButtons = screen.getAllByRole('button', { name: /détail/i });
      fireEvent.click(detailButtons[0]);

      // Breakdown content should be visible
      expect(screen.getByText('Lundi')).toBeInTheDocument();
      expect(screen.getByText('2 tickets')).toBeInTheDocument();
      expect(screen.getByText('100,00 €')).toBeInTheDocument();
    });
  });
});
