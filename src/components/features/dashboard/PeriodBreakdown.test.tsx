/**
 * Tests for PeriodBreakdown component
 * Story 6.2: Sales by Period
 *
 * Controlled expandable/collapsible component showing daily/weekly breakdown
 * Parent manages accordion state (only one open at a time).
 */

import { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  PeriodBreakdown,
  PeriodBreakdownTrigger,
  PeriodBreakdownContent,
  type BreakdownItem,
} from './PeriodBreakdown';

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

  // Wrapper component to test controlled behavior
  function ControlledBreakdown({
    items,
    title = 'Détail journalier',
    comparisonLabel = 'par jour',
    initialOpen = false,
  }: {
    items: BreakdownItem[];
    title?: string;
    comparisonLabel?: string;
    initialOpen?: boolean;
  }) {
    const [isOpen, setIsOpen] = useState(initialOpen);
    return (
      <PeriodBreakdown
        title={title}
        items={items}
        comparisonLabel={comparisonLabel}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
    );
  }

  describe('Collapsed state', () => {
    it('renders trigger button with label', () => {
      render(<ControlledBreakdown items={mockItems} />);

      expect(screen.getByRole('button', { name: /détail/i })).toBeInTheDocument();
    });

    it('does not show breakdown items when collapsed', () => {
      render(<ControlledBreakdown items={mockItems} />);

      // Items should not be visible initially
      expect(screen.queryByText('Lundi')).not.toBeInTheDocument();
      expect(screen.queryByText('Mardi')).not.toBeInTheDocument();
    });

    it('shows chevron pointing down when collapsed', () => {
      render(<ControlledBreakdown items={mockItems} />);

      const button = screen.getByRole('button', { name: /détail/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Expanded state', () => {
    it('shows breakdown items when expanded', () => {
      render(<ControlledBreakdown items={mockItems} />);

      // Click to expand
      const trigger = screen.getByRole('button', { name: /détail/i });
      fireEvent.click(trigger);

      // Items should now be visible
      expect(screen.getByText('Lundi')).toBeInTheDocument();
      expect(screen.getByText('Mardi')).toBeInTheDocument();
      expect(screen.getByText('Mercredi')).toBeInTheDocument();
    });

    it('displays ticket counts for each breakdown item', () => {
      render(<ControlledBreakdown items={mockItems} />);

      fireEvent.click(screen.getByRole('button', { name: /détail/i }));

      expect(screen.getByText('2 tickets')).toBeInTheDocument();
      expect(screen.getByText('3 tickets')).toBeInTheDocument();
      expect(screen.getByText('0 tickets')).toBeInTheDocument();
    });

    it('displays formatted revenue for each breakdown item', () => {
      render(<ControlledBreakdown items={mockItems} />);

      fireEvent.click(screen.getByRole('button', { name: /détail/i }));

      // 5000 centimes = 50.00 € (displayed as 50,00 €)
      expect(screen.getByText('50,00 €')).toBeInTheDocument();
      expect(screen.getByText('75,00 €')).toBeInTheDocument();
      expect(screen.getByText('0,00 €')).toBeInTheDocument();
    });

    it('collapses when clicked again', () => {
      render(<ControlledBreakdown items={mockItems} />);

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
      render(<ControlledBreakdown items={[]} title="Détail" />);

      const trigger = screen.getByRole('button', { name: /détail/i });
      fireEvent.click(trigger);

      // Should show empty message
      expect(screen.getByText(/aucune donnée/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible trigger button', () => {
      render(<ControlledBreakdown items={mockItems} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates aria-expanded when expanded', () => {
      render(<ControlledBreakdown items={mockItems} />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('has 48px minimum touch target', () => {
      render(<ControlledBreakdown items={mockItems} />);

      const trigger = screen.getByRole('button');
      expect(trigger.className).toMatch(/min-h-\[48px\]/);
    });
  });

  describe('PeriodBreakdownTrigger (standalone)', () => {
    it('calls onToggle when clicked', () => {
      const mockToggle = vi.fn();
      render(
        <PeriodBreakdownTrigger
          title="Détail"
          isOpen={false}
          onToggle={mockToggle}
          comparisonLabel="par jour"
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('shows open state styling when isOpen is true', () => {
      render(
        <PeriodBreakdownTrigger
          title="Détail"
          isOpen={true}
          onToggle={() => {}}
          comparisonLabel="par jour"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button.className).toContain('bg-muted/50');
    });
  });

  describe('PeriodBreakdownContent (standalone)', () => {
    it('renders items directly without trigger', () => {
      render(<PeriodBreakdownContent items={mockItems} />);

      expect(screen.getByText('Lundi')).toBeInTheDocument();
      expect(screen.getByText('2 tickets')).toBeInTheDocument();
      expect(screen.getByText('50,00 €')).toBeInTheDocument();
    });

    it('renders empty state message when items empty', () => {
      render(<PeriodBreakdownContent items={[]} />);

      expect(screen.getByText(/aucune donnée/i)).toBeInTheDocument();
    });
  });
});
