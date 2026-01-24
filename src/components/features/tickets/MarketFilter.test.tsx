/**
 * MarketFilter component tests
 * Story 4.4: Filter by Market
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarketFilter } from './MarketFilter';
import type { Market } from '@/types';

// Mock markets
const mockMarkets: Market[] = [
  {
    id: 1,
    userId: 'user-123',
    name: 'Marché Bastille',
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 2,
    userId: 'user-123',
    name: 'Marché Aligre',
    createdAt: '2026-01-01T11:00:00Z',
  },
  {
    id: 3,
    userId: 'user-123',
    name: 'Marché Bio',
    createdAt: '2026-01-01T12:00:00Z',
  },
];

// Mock useMarkets hook
vi.mock('@/hooks', () => ({
  useMarkets: vi.fn(() => ({
    markets: mockMarkets,
    isLoading: false,
  })),
}));

describe('MarketFilter', () => {
  const mockOnApply = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button with MapPin icon', () => {
    render(
      <MarketFilter
        userId="user-123"
        selectedMarketIds={[]}
        onApply={mockOnApply}

      />
    );

    const button = screen.getByRole('button', { name: /filtrer par marché/i });
    expect(button).toBeInTheDocument();
  });

  it('opens sheet when trigger button is clicked', async () => {
    render(
      <MarketFilter
        userId="user-123"
        selectedMarketIds={[]}
        onApply={mockOnApply}

      />
    );

    const button = screen.getByRole('button', { name: /filtrer par marché/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Filtrer par marché')).toBeInTheDocument();
    });
  });

  it('displays all markets with checkboxes', async () => {
    render(
      <MarketFilter
        userId="user-123"
        selectedMarketIds={[]}
        onApply={mockOnApply}

      />
    );

    fireEvent.click(screen.getByRole('button', { name: /filtrer par marché/i }));

    await waitFor(() => {
      expect(screen.getByText('Marché Bastille')).toBeInTheDocument();
      expect(screen.getByText('Marché Aligre')).toBeInTheDocument();
      expect(screen.getByText('Marché Bio')).toBeInTheDocument();
    });
  });

  it('shows "Tous les marchés" option', async () => {
    render(
      <MarketFilter
        userId="user-123"
        selectedMarketIds={[]}
        onApply={mockOnApply}

      />
    );

    fireEvent.click(screen.getByRole('button', { name: /filtrer par marché/i }));

    await waitFor(() => {
      expect(screen.getByText('Tous les marchés')).toBeInTheDocument();
    });
  });

  it('calls onApply with selected market IDs when Apply is clicked', async () => {
    render(
      <MarketFilter
        userId="user-123"
        selectedMarketIds={[]}
        onApply={mockOnApply}

      />
    );

    fireEvent.click(screen.getByRole('button', { name: /filtrer par marché/i }));

    await waitFor(() => {
      expect(screen.getByText('Marché Bastille')).toBeInTheDocument();
    });

    // Click on Marché Bastille to select it
    const bastilleCheckbox = screen.getByRole('checkbox', { name: /marché bastille/i });
    fireEvent.click(bastilleCheckbox);

    // Click Apply
    const applyButton = screen.getByRole('button', { name: /appliquer/i });
    fireEvent.click(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith([1]);
  });

  it('pre-selects markets based on selectedMarketIds prop', async () => {
    render(
      <MarketFilter
        userId="user-123"
        selectedMarketIds={[1, 2]}
        onApply={mockOnApply}

      />
    );

    fireEvent.click(screen.getByRole('button', { name: /filtrer par marché/i }));

    await waitFor(() => {
      const bastilleCheckbox = screen.getByRole('checkbox', { name: /marché bastille/i });
      const aligreCheckbox = screen.getByRole('checkbox', { name: /marché aligre/i });
      const bioCheckbox = screen.getByRole('checkbox', { name: /marché bio/i });

      expect(bastilleCheckbox).toBeChecked();
      expect(aligreCheckbox).toBeChecked();
      expect(bioCheckbox).not.toBeChecked();
    });
  });
});
