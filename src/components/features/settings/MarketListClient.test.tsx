import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketListClient } from './MarketListClient';

// Mock Supabase client
const mockGetUser = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

// Mock hooks
const mockUseMarkets = vi.fn();
vi.mock('@/hooks', () => ({
  useMarkets: (...args: unknown[]) => mockUseMarkets(...args),
}));

describe('MarketListClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    mockUseMarkets.mockReturnValue({
      markets: [],
      isLoading: false,
    });
  });

  it('shows loading skeleton while auth is loading', () => {
    // getUser never resolves
    mockGetUser.mockReturnValue(new Promise(() => {}));
    render(<MarketListClient />);

    expect(screen.getByTestId('market-list-skeleton')).toBeInTheDocument();
  });

  it('shows empty state when user has no markets', async () => {
    mockUseMarkets.mockReturnValue({ markets: [], isLoading: false });

    render(<MarketListClient />);

    await waitFor(() => {
      expect(screen.getByText(/aucun marché/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/ajoutez un marché/i)).toBeInTheDocument();
  });

  it('displays list of markets with names', async () => {
    mockUseMarkets.mockReturnValue({
      markets: [
        { id: 1, name: 'Marché Bastille', userId: 'user-123', createdAt: '2026-01-01' },
        { id: 2, name: 'Marché Aligre', userId: 'user-123', createdAt: '2026-01-02' },
      ],
      isLoading: false,
    });

    render(<MarketListClient />);

    await waitFor(() => {
      expect(screen.getByText('Marché Bastille')).toBeInTheDocument();
      expect(screen.getByText('Marché Aligre')).toBeInTheDocument();
    });
  });

  it('passes userId to useMarkets hook after auth resolves', async () => {
    render(<MarketListClient />);

    await waitFor(() => {
      expect(mockUseMarkets).toHaveBeenCalledWith('user-123');
    });
  });
});
