/**
 * MarketFilterChip component tests
 * Story 4.4: Filter by Market
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarketFilterChip } from './MarketFilterChip';

describe('MarketFilterChip', () => {
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays single market name when one market selected', () => {
    render(
      <MarketFilterChip
        marketNames={['Marché Bastille']}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText('Marché Bastille')).toBeInTheDocument();
  });

  it('displays count when multiple markets selected', () => {
    render(
      <MarketFilterChip
        marketNames={['Marché Bastille', 'Marché Aligre', 'Marché Bio']}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText('3 marchés')).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    render(
      <MarketFilterChip
        marketNames={['Marché Bastille']}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByTestId('market-filter-chip-clear');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });
});
