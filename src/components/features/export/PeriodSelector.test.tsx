/**
 * Tests for PeriodSelector component
 * Story 5.1: Export Page & Period Selection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PeriodSelector } from './PeriodSelector';

describe('PeriodSelector', () => {
  const mockOnPresetSelect = vi.fn();
  const mockOnCustomRangeChange = vi.fn();

  const defaultProps = {
    selectedPreset: null as 'this-month' | null,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    onPresetSelect: mockOnPresetSelect,
    onCustomRangeChange: mockOnCustomRangeChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-26T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('preset buttons', () => {
    it('renders all preset buttons', () => {
      render(<PeriodSelector {...defaultProps} />);

      expect(screen.getByTestId('preset-this-month')).toBeInTheDocument();
      expect(screen.getByTestId('preset-last-month')).toBeInTheDocument();
      expect(screen.getByTestId('preset-this-quarter')).toBeInTheDocument();
      expect(screen.getByTestId('preset-last-quarter')).toBeInTheDocument();
      expect(screen.getByTestId('preset-this-year')).toBeInTheDocument();
    });

    it('shows French labels', () => {
      render(<PeriodSelector {...defaultProps} />);

      expect(screen.getByText('Ce mois')).toBeInTheDocument();
      expect(screen.getByText('Mois dernier')).toBeInTheDocument();
      expect(screen.getByText('Ce trimestre')).toBeInTheDocument();
      expect(screen.getByText('Trim. dernier')).toBeInTheDocument();
      expect(screen.getByText('Cette année')).toBeInTheDocument();
    });

    it('calls onPresetSelect when preset clicked', () => {
      render(<PeriodSelector {...defaultProps} />);

      fireEvent.click(screen.getByTestId('preset-this-month'));

      expect(mockOnPresetSelect).toHaveBeenCalledWith('this-month', {
        start: '2026-01-01',
        end: '2026-01-31',
      });
    });

    it('highlights the selected preset', () => {
      render(<PeriodSelector {...defaultProps} selectedPreset="this-month" />);

      const thisMonthButton = screen.getByTestId('preset-this-month');
      // Check that it has the default variant (bg-primary class)
      expect(thisMonthButton).toHaveClass('bg-primary');
    });
  });

  describe('custom date inputs', () => {
    it('renders start and end date inputs', () => {
      render(<PeriodSelector {...defaultProps} />);

      expect(screen.getByTestId('custom-start-date')).toBeInTheDocument();
      expect(screen.getByTestId('custom-end-date')).toBeInTheDocument();
    });

    it('displays current date values', () => {
      render(<PeriodSelector {...defaultProps} />);

      expect(screen.getByTestId('custom-start-date')).toHaveValue('2026-01-01');
      expect(screen.getByTestId('custom-end-date')).toHaveValue('2026-01-31');
    });

    it('calls onCustomRangeChange when start date changes', () => {
      render(<PeriodSelector {...defaultProps} />);

      fireEvent.change(screen.getByTestId('custom-start-date'), {
        target: { value: '2026-01-15' },
      });

      expect(mockOnCustomRangeChange).toHaveBeenCalledWith(
        '2026-01-15',
        '2026-01-31'
      );
    });

    it('calls onCustomRangeChange when end date changes', () => {
      render(<PeriodSelector {...defaultProps} />);

      fireEvent.change(screen.getByTestId('custom-end-date'), {
        target: { value: '2026-02-28' },
      });

      expect(mockOnCustomRangeChange).toHaveBeenCalledWith(
        '2026-01-01',
        '2026-02-28'
      );
    });
  });

  describe('validation', () => {
    it('shows error when start date is after end date', () => {
      render(
        <PeriodSelector
          {...defaultProps}
          startDate="2026-02-15"
          endDate="2026-01-15"
        />
      );

      expect(screen.getByTestId('date-error')).toBeInTheDocument();
      expect(
        screen.getByText('La date de début doit être antérieure à la date de fin')
      ).toBeInTheDocument();
    });

    it('does not show error when dates are valid', () => {
      render(<PeriodSelector {...defaultProps} />);

      expect(screen.queryByTestId('date-error')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible labels for date inputs', () => {
      render(<PeriodSelector {...defaultProps} />);

      expect(screen.getByLabelText('Date de début')).toBeInTheDocument();
      expect(screen.getByLabelText('Date de fin')).toBeInTheDocument();
    });

    it('preset buttons have 48px minimum height for touch targets', () => {
      render(<PeriodSelector {...defaultProps} />);

      const button = screen.getByTestId('preset-this-month');
      expect(button).toHaveClass('min-h-[48px]');
    });
  });
});
