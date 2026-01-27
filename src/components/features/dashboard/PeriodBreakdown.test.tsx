/**
 * Tests for PeriodBreakdown component
 * Story 6.2: Sales by Period
 *
 * Expandable/collapsible component showing daily/weekly breakdown
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PeriodBreakdown, type BreakdownItem } from './PeriodBreakdown';

// Mock formatCurrency
vi.mock('@/lib/utils/format', () => ({
  formatCurrency: vi.fn((centimes: number) => {
    const euros = (centimes / 100).toFixed(2).replace('.', ',');
    return `${euros} €`;
  }),
}));

describe('PeriodBreakdown', () => {
  const mockItems: BreakdownItem[] = [
    { label: 'Lundi', ticketCount: 2, revenue: 5000 },
    { label: 'Mardi', ticketCount: 3, revenue: 7500 },
    { label: 'Mercredi', ticketCount: 0, revenue: 0 },
  ];

  describe('Collapsed state', () => {
    it('renders trigger button with label', () => {
      render(
        <PeriodBreakdown title="Détail journalier" items={mockItems} comparisonLabel="par jour" />
      );

      expect(screen.getByRole('button', { name: /détail/i })).toBeInTheDocument();
    });

    it('does not show breakdown items when collapsed', () => {
      render(
        <PeriodBreakdown title="Détail journalier" items={mockItems} comparisonLabel="par jour" />
      );

      // Items should not be visible initially
      expect(screen.queryByText('Lundi')).not.toBeInTheDocument();
      expect(screen.queryByText('Mardi')).not.toBeInTheDocument();
    });

    it('shows chevron pointing down when collapsed', () => {
      render(
        <PeriodBreakdown title="Détail journalier" items={mockItems} comparisonLabel="par jour" />
      );

      const button = screen.getByRole('button', { name: /détail/i });
      expect(button).toHaveAttribute('data-state', 'closed');
    });
  });

  describe('Expanded state', () => {
    it('shows breakdown items when expanded', () => {
      render(
        <PeriodBreakdown title="Détail journalier" items={mockItems} comparisonLabel="par jour" />
      );

      // Click to expand
      const trigger = screen.getByRole('button', { name: /détail/i });
      fireEvent.click(trigger);

      // Items should now be visible
      expect(screen.getByText('Lundi')).toBeInTheDocument();
      expect(screen.getByText('Mardi')).toBeInTheDocument();
      expect(screen.getByText('Mercredi')).toBeInTheDocument();
    });

    it('displays ticket counts for each breakdown item', () => {
      render(
        <PeriodBreakdown title="Détail journalier" items={mockItems} comparisonLabel="par jour" />
      );

      fireEvent.click(screen.getByRole('button', { name: /détail/i }));

      expect(screen.getByText('2 tickets')).toBeInTheDocument();
      expect(screen.getByText('3 tickets')).toBeInTheDocument();
      expect(screen.getByText('0 tickets')).toBeInTheDocument();
    });

    it('displays formatted revenue for each breakdown item', () => {
      render(
        <PeriodBreakdown title="Détail journalier" items={mockItems} comparisonLabel="par jour" />
      );

      fireEvent.click(screen.getByRole('button', { name: /détail/i }));

      // 5000 centimes = 50.00 € (displayed as 50,00 €)
      expect(screen.getByText('50,00 €')).toBeInTheDocument();
      expect(screen.getByText('75,00 €')).toBeInTheDocument();
      expect(screen.getByText('0,00 €')).toBeInTheDocument();
    });

    it('collapses when clicked again', () => {
      render(
        <PeriodBreakdown title="Détail journalier" items={mockItems} comparisonLabel="par jour" />
      );

      const trigger = screen.getByRole('button', { name: /détail/i });

      // Expand
      fireEvent.click(trigger);
      expect(screen.getByText('Lundi')).toBeInTheDocument();

      // Collapse
      fireEvent.click(trigger);
      expect(screen.queryByText('Lundi')).not.toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders with empty items array', () => {
      render(<PeriodBreakdown title="Détail" items={[]} comparisonLabel="par jour" />);

      const trigger = screen.getByRole('button', { name: /détail/i });
      fireEvent.click(trigger);

      // Should show empty message
      expect(screen.getByText(/aucune donnée/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible trigger button', () => {
      render(
        <PeriodBreakdown title="Détail journalier" items={mockItems} comparisonLabel="par jour" />
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates aria-expanded when expanded', () => {
      render(
        <PeriodBreakdown title="Détail journalier" items={mockItems} comparisonLabel="par jour" />
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('has 48px minimum touch target', () => {
      render(
        <PeriodBreakdown title="Détail journalier" items={mockItems} comparisonLabel="par jour" />
      );

      const trigger = screen.getByRole('button');
      expect(trigger.className).toMatch(/min-h-\[48px\]/);
    });
  });
});
