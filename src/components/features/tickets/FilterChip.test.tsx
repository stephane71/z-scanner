/**
 * FilterChip component tests
 * Story 4.3: Filter by Date
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterChip } from './FilterChip';

describe('FilterChip', () => {
  const mockOnClear = vi.fn();

  it('renders filter label with formatted dates', () => {
    render(
      <FilterChip
        startDate="2026-01-15"
        endDate="2026-01-22"
        onClear={mockOnClear}
      />
    );

    // Should display dates in French format: dd/MM
    expect(screen.getByText('15/01 - 22/01')).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    render(
      <FilterChip
        startDate="2026-01-15"
        endDate="2026-01-22"
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByTestId('filter-chip-clear');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('has accessible clear button', () => {
    render(
      <FilterChip
        startDate="2026-01-15"
        endDate="2026-01-22"
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByRole('button', { name: /effacer le filtre/i });
    expect(clearButton).toBeInTheDocument();
  });
});
