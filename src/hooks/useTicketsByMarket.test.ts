/**
 * useTicketsByMarket hook tests
 * Story 4.4: Filter by Market
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTicketsByMarket } from './useTicketsByMarket';
import type { Ticket } from '@/types';

// Capture the query function for testing
let capturedQueryFn: (() => Promise<Ticket[]>) | null = null;

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (queryFn: () => Promise<Ticket[]>, deps: unknown[]) => {
    capturedQueryFn = queryFn;
    // Return undefined initially to simulate loading
    return undefined;
  },
}));

// Mock db
const mockTickets: Ticket[] = [
  {
    id: 1,
    userId: 'user-123',
    marketId: 1,
    status: 'validated',
    type: 'STATISTIQUES',
    impressionDate: '2026-01-15',
    lastResetDate: '2026-01-01',
    resetNumber: 1,
    ticketNumber: 42,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: [],
    total: 1250,
    dataHash: 'abc123',
    createdAt: '2026-01-15T10:00:00Z',
    clientTimestamp: '2026-01-15T10:00:00Z',
  },
  {
    id: 2,
    userId: 'user-123',
    marketId: 2,
    status: 'validated',
    type: 'STATISTIQUES',
    impressionDate: '2026-01-10',
    lastResetDate: '2026-01-01',
    resetNumber: 1,
    ticketNumber: 43,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: [],
    total: 2500,
    dataHash: 'def456',
    createdAt: '2026-01-10T10:00:00Z',
    clientTimestamp: '2026-01-10T10:00:00Z',
  },
  {
    id: 3,
    userId: 'user-123',
    marketId: 1,
    status: 'validated',
    type: 'STATISTIQUES',
    impressionDate: '2026-01-20',
    lastResetDate: '2026-01-01',
    resetNumber: 1,
    ticketNumber: 44,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: [],
    total: 3000,
    dataHash: 'ghi789',
    createdAt: '2026-01-20T10:00:00Z',
    clientTimestamp: '2026-01-20T10:00:00Z',
  },
  {
    id: 4,
    userId: 'user-123',
    marketId: undefined,
    status: 'validated',
    type: 'STATISTIQUES',
    impressionDate: '2026-01-18',
    lastResetDate: '2026-01-01',
    resetNumber: 1,
    ticketNumber: 45,
    discountValue: 0,
    cancelValue: 0,
    cancelNumber: 0,
    payments: [],
    total: 1000,
    dataHash: 'jkl012',
    createdAt: '2026-01-18T10:00:00Z',
    clientTimestamp: '2026-01-18T10:00:00Z',
  },
];

vi.mock('@/lib/db', () => ({
  db: {
    tickets: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mockTickets)),
        })),
      })),
    },
  },
}));

describe('useTicketsByMarket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedQueryFn = null;
  });

  it('returns all tickets when no filters are applied', async () => {
    renderHook(() => useTicketsByMarket('user-123', null, null, []));

    expect(capturedQueryFn).not.toBeNull();
    const result = await capturedQueryFn!();

    // Should return all 4 tickets, sorted by createdAt descending
    expect(result).toHaveLength(4);
    expect(result[0].id).toBe(3); // Most recent createdAt
  });

  it('filters tickets by single market', async () => {
    renderHook(() => useTicketsByMarket('user-123', null, null, [1]));

    expect(capturedQueryFn).not.toBeNull();
    const result = await capturedQueryFn!();

    // Should return only tickets with marketId = 1
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.marketId === 1)).toBe(true);
  });

  it('filters tickets by multiple markets', async () => {
    renderHook(() => useTicketsByMarket('user-123', null, null, [1, 2]));

    expect(capturedQueryFn).not.toBeNull();
    const result = await capturedQueryFn!();

    // Should return tickets with marketId = 1 or 2
    expect(result).toHaveLength(3);
    expect(result.every((t) => t.marketId === 1 || t.marketId === 2)).toBe(true);
  });

  it('combines date and market filters', async () => {
    renderHook(() =>
      useTicketsByMarket('user-123', '2026-01-12', '2026-01-25', [1])
    );

    expect(capturedQueryFn).not.toBeNull();
    const result = await capturedQueryFn!();

    // Should return only tickets with marketId = 1 AND within date range
    // id=1: date=2026-01-15, marketId=1 ✓
    // id=3: date=2026-01-20, marketId=1 ✓
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.marketId === 1)).toBe(true);
  });

  it('returns empty array when no tickets match filters', async () => {
    renderHook(() => useTicketsByMarket('user-123', null, null, [999]));

    expect(capturedQueryFn).not.toBeNull();
    const result = await capturedQueryFn!();

    expect(result).toHaveLength(0);
  });
});
