/**
 * DateRangeFilter component tests
 * Story 4.3: Filter by Date
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangeFilter } from './DateRangeFilter';

describe('DateRangeFilter', () => {
  const mockOnApply = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Set system time for consistent date tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-22T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders filter button with calendar icon', () => {
    render(
      <DateRangeFilter
        onApply={mockOnApply}
        onClear={mockOnClear}
        currentStart={null}
        currentEnd={null}
      />
    );

    const button = screen.getByTestId('date-filter-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAccessibleName(/filtrer par date/i);
  });

  it('opens sheet when button is clicked', () => {
    render(
      <DateRangeFilter
        onApply={mockOnApply}
        onClear={mockOnClear}
        currentStart={null}
        currentEnd={null}
      />
    );

    fireEvent.click(screen.getByTestId('date-filter-button'));

    expect(screen.getByText('Filtrer par date')).toBeInTheDocument();
    expect(screen.getByText('Cette semaine')).toBeInTheDocument();
    expect(screen.getByText('Ce mois')).toBeInTheDocument();
    expect(screen.getByText('Ce trimestre')).toBeInTheDocument();
  });

  it('calls onApply with preset dates when Cette semaine is clicked', () => {
    render(
      <DateRangeFilter
        onApply={mockOnApply}
        onClear={mockOnClear}
        currentStart={null}
        currentEnd={null}
      />
    );

    fireEvent.click(screen.getByTestId('date-filter-button'));
    fireEvent.click(screen.getByText('Cette semaine'));

    // Verify onApply was called with two date strings (start and end of week)
    expect(mockOnApply).toHaveBeenCalledTimes(1);
    const [start, end] = mockOnApply.mock.calls[0];
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(end) >= new Date(start)).toBe(true); // End is after or equal to start
  });

  it('calls onApply with custom dates when form is submitted', () => {
    render(
      <DateRangeFilter
        onApply={mockOnApply}
        onClear={mockOnClear}
        currentStart={null}
        currentEnd={null}
      />
    );

    fireEvent.click(screen.getByTestId('date-filter-button'));

    // Fill in custom dates
    const startInput = screen.getByLabelText('Date de début');
    const endInput = screen.getByLabelText('Date de fin');

    fireEvent.change(startInput, { target: { value: '2026-01-15' } });
    fireEvent.change(endInput, { target: { value: '2026-01-20' } });

    // Click apply button
    fireEvent.click(screen.getByText('Appliquer'));

    expect(mockOnApply).toHaveBeenCalledWith('2026-01-15', '2026-01-20');
  });

  it('shows active indicator when filter is applied', () => {
    render(
      <DateRangeFilter
        onApply={mockOnApply}
        onClear={mockOnClear}
        currentStart="2026-01-15"
        currentEnd="2026-01-20"
      />
    );

    const button = screen.getByTestId('date-filter-button');
    expect(button).toHaveAttribute('data-active', 'true');
  });

  it('calls onApply with month dates when Ce mois is clicked', () => {
    render(
      <DateRangeFilter
        onApply={mockOnApply}
        onClear={mockOnClear}
        currentStart={null}
        currentEnd={null}
      />
    );

    fireEvent.click(screen.getByTestId('date-filter-button'));
    fireEvent.click(screen.getByText('Ce mois'));

    // Verify onApply was called with start and end of month
    expect(mockOnApply).toHaveBeenCalledTimes(1);
    const [start, end] = mockOnApply.mock.calls[0];
    expect(start).toBe('2026-01-01'); // First day of January
    expect(end).toBe('2026-01-31'); // Last day of January
  });
});
