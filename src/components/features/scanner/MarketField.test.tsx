import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarketField } from './MarketField';
import type { Market } from '@/types';

// Mock hooks
const mockUseMarketById = vi.fn();

vi.mock('@/hooks', () => ({
  useMarketById: (...args: unknown[]) => mockUseMarketById(...args),
}));

describe('MarketField', () => {
  const mockOnClick = vi.fn();

  const mockMarket: Market & { id: number } = {
    id: 1,
    name: 'Marché Bastille',
    userId: 'user-123',
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMarketById.mockReturnValue({ market: mockMarket, isLoading: false });
  });

  it('renders "Aucun marché" when no market is selected', () => {
    mockUseMarketById.mockReturnValue({ market: undefined, isLoading: false });

    render(
      <MarketField
        value={undefined}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Aucun marché')).toBeInTheDocument();
  });

  it('renders selected market name when a market is selected', () => {
    render(
      <MarketField
        value={1}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Marché Bastille')).toBeInTheDocument();
  });

  it('calls onClick when the field is clicked', async () => {
    const user = userEvent.setup();

    render(
      <MarketField
        value={1}
        onClick={mockOnClick}
      />
    );

    await user.click(screen.getByRole('button'));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders MapPin icon', () => {
    render(
      <MarketField
        value={undefined}
        onClick={mockOnClick}
      />
    );

    // The MapPin icon should be present
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders chevron indicator', () => {
    render(
      <MarketField
        value={undefined}
        onClick={mockOnClick}
      />
    );

    // Should have two SVGs: MapPin and ChevronRight
    const button = screen.getByRole('button');
    const svgs = button.querySelectorAll('svg');
    expect(svgs.length).toBe(2);
  });

  it('shows loading placeholder while market is loading', () => {
    mockUseMarketById.mockReturnValue({ market: undefined, isLoading: true });

    render(
      <MarketField
        value={1}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('shows "Marché supprimé" when market was deleted', () => {
    // Market has a value but market was deleted (not found in DB)
    mockUseMarketById.mockReturnValue({ market: undefined, isLoading: false });

    render(
      <MarketField
        value={1}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Marché supprimé')).toBeInTheDocument();
  });
});
