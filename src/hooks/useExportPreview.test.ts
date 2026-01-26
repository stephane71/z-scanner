/**
 * Tests for useExportPreview hook
 * Story 5.1: Export Page & Period Selection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useExportPreview } from './useExportPreview';

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    tickets: {
      where: vi.fn(),
    },
  },
}));

import { useLiveQuery } from 'dexie-react-hooks';

const mockUseLiveQuery = useLiveQuery as unknown as ReturnType<typeof vi.fn>;

describe('useExportPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state when query is undefined', () => {
    mockUseLiveQuery.mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useExportPreview('user-123', '2026-01-01', '2026-01-31')
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.ticketCount).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('returns ticket count and total when data is loaded', () => {
    mockUseLiveQuery.mockReturnValue({ count: 15, total: 123450 });

    const { result } = renderHook(() =>
      useExportPreview('user-123', '2026-01-01', '2026-01-31')
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.ticketCount).toBe(15);
    expect(result.current.totalAmount).toBe(123450);
  });

  it('returns zero count when no tickets match', () => {
    mockUseLiveQuery.mockReturnValue({ count: 0, total: 0 });

    const { result } = renderHook(() =>
      useExportPreview('user-123', '2026-01-01', '2026-01-31')
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.ticketCount).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('calls useLiveQuery with correct dependencies', () => {
    mockUseLiveQuery.mockReturnValue({ count: 0, total: 0 });

    renderHook(() => useExportPreview('user-123', '2026-01-01', '2026-01-31'));

    expect(mockUseLiveQuery).toHaveBeenCalledWith(
      expect.any(Function),
      ['user-123', '2026-01-01', '2026-01-31']
    );
  });

  it('updates when date range changes', () => {
    mockUseLiveQuery.mockReturnValue({ count: 5, total: 50000 });

    const { result, rerender } = renderHook(
      ({ startDate, endDate }) =>
        useExportPreview('user-123', startDate, endDate),
      { initialProps: { startDate: '2026-01-01', endDate: '2026-01-31' } }
    );

    expect(result.current.ticketCount).toBe(5);

    // Change date range
    mockUseLiveQuery.mockReturnValue({ count: 10, total: 100000 });
    rerender({ startDate: '2026-02-01', endDate: '2026-02-28' });

    expect(mockUseLiveQuery).toHaveBeenLastCalledWith(
      expect.any(Function),
      ['user-123', '2026-02-01', '2026-02-28']
    );
  });
});
