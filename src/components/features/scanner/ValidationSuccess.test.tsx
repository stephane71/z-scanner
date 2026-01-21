/**
 * Unit tests for ValidationSuccess component
 * Story 3.6: Ticket Validation with NF525 Compliance
 *
 * Tests for:
 * - Component renders correctly with checkmark and message
 * - Timer fires after specified delay
 * - onComplete callback is called
 * - Animation classes are applied
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ValidationSuccess } from './ValidationSuccess';

describe('ValidationSuccess', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render success message "Conforme NF525"', () => {
    render(<ValidationSuccess onComplete={vi.fn()} />);

    expect(screen.getByText('Conforme NF525')).toBeInTheDocument();
  });

  it('should render subtitle "Ticket validé et archivé"', () => {
    render(<ValidationSuccess onComplete={vi.fn()} />);

    expect(screen.getByText('Ticket validé et archivé')).toBeInTheDocument();
  });

  it('should render checkmark icon', () => {
    render(<ValidationSuccess onComplete={vi.fn()} />);

    // The SVG checkmark should be present
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should display validation timestamp', () => {
    const mockDate = new Date('2026-01-21T15:00:00.000Z');
    vi.setSystemTime(mockDate);

    render(<ValidationSuccess onComplete={vi.fn()} />);

    // Should show formatted timestamp (French format)
    expect(screen.getByTestId('validation-timestamp')).toBeInTheDocument();
  });

  it('should call onComplete after default 2 seconds', () => {
    const onComplete = vi.fn();

    render(<ValidationSuccess onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should call onComplete after custom autoRedirectDelay', () => {
    const onComplete = vi.fn();

    render(
      <ValidationSuccess onComplete={onComplete} autoRedirectDelay={3000} />
    );

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should have animation classes on checkmark container', () => {
    render(<ValidationSuccess onComplete={vi.fn()} />);

    const checkmarkContainer = screen.getByTestId('checkmark-container');
    expect(checkmarkContainer).toHaveClass('animate-bounce');
  });

  it('should render as full-screen overlay', () => {
    render(<ValidationSuccess onComplete={vi.fn()} />);

    const overlay = screen.getByTestId('validation-overlay');
    expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50');
  });

  it('should have accessible role and labels', () => {
    render(<ValidationSuccess onComplete={vi.fn()} />);

    // Should have alert role for screen readers
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('should cleanup timer on unmount', () => {
    const onComplete = vi.fn();

    const { unmount } = render(<ValidationSuccess onComplete={onComplete} />);

    // Unmount before timer fires
    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should not have called onComplete
    expect(onComplete).not.toHaveBeenCalled();
  });
});
