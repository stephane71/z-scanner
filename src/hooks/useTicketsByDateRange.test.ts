/**
 * useTicketsByDateRange hook tests
 * Story 4.3: Filter by Date
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Ticket } from '@/types';

// Mock tickets data
const mockTickets: Ticket[] = [
  {
    id: 1,
    userId: 'user-123',
    impressionDate: '2026-01-15',
    total: 1500,
    ticketNumber: 1,
    status: 'validated',
    createdAt: '2026-01-15T10:00:00.000Z',
    payments: [],
  },
  {
    id: 2,
    userId: 'user-123',
    impressionDate: '2026-01-20',
    total: 2500,
    ticketNumber: 2,
    status: 'validated',
    createdAt: '2026-01-20T14:00:00.000Z',
    payments: [],
  },
  {
    id: 3,
    userId: 'user-123',
    impressionDate: '2026-01-10',
    total: 3500,
    ticketNumber: 3,
    status: 'validated',
    createdAt: '2026-01-10T09:00:00.000Z',
    payments: [],
  },
];

// Track the query function for assertions
let capturedQueryFn: (() => Promise<Ticket[]>) | null = null;
let mockReturnValue: Ticket[] | undefined = undefined;

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((queryFn) => {
    capturedQueryFn = queryFn;
    return mockReturnValue;
  }),
}));

// Mock db
const mockToArray = vi.fn();
const mockSortBy = vi.fn();
const mockReverse = vi.fn(() => ({ sortBy: mockSortBy }));
const mockEquals = vi.fn(() => ({
  toArray: mockToArray,
  reverse: mockReverse,
}));
const mockWhere = vi.fn(() => ({ equals: mockEquals }));

vi.mock('@/lib/db', () => ({
  db: {
    tickets: {
      where: (field: string) => mockWhere(field),
    },
  },
}));

// Import after mocks
import { useTicketsByDateRange } from './useTicketsByDateRange';

describe('useTicketsByDateRange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedQueryFn = null;
    mockReturnValue = undefined;
    mockToArray.mockResolvedValue(mockTickets);
    mockSortBy.mockResolvedValue([...mockTickets].reverse());
  });

  it('returns all tickets when no date filter is applied', () => {
    mockReturnValue = mockTickets;

    const { result } = renderHook(() =>
      useTicketsByDateRange('user-123', null, null)
    );

    expect(result.current.tickets).toEqual(mockTickets);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns loading state when tickets is undefined', () => {
    mockReturnValue = undefined;

    const { result } = renderHook(() =>
      useTicketsByDateRange('user-123', null, null)
    );

    expect(result.current.tickets).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('query function returns empty array for empty userId', async () => {
    mockReturnValue = undefined;

    renderHook(() => useTicketsByDateRange('', null, null));

    // Execute the captured query function
    expect(capturedQueryFn).not.toBeNull();
    const queryResult = await capturedQueryFn!();
    expect(queryResult).toEqual([]);
  });

  it('query function filters tickets by date range', async () => {
    mockReturnValue = undefined;
    mockToArray.mockResolvedValue(mockTickets);

    renderHook(() =>
      useTicketsByDateRange('user-123', '2026-01-12', '2026-01-18')
    );

    // Execute the captured query function
    expect(capturedQueryFn).not.toBeNull();
    const queryResult = await capturedQueryFn!();

    // Should only include ticket from 2026-01-15 (within range 01-12 to 01-18)
    expect(queryResult).toHaveLength(1);
    expect(queryResult[0].impressionDate).toBe('2026-01-15');
  });
});
