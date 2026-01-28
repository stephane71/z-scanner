/**
 * AccountSection Component Tests
 * Story 6.4: Settings Page - Task 1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AccountSection } from './AccountSection';

// Mock Supabase client
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

// Mock LogoutButton
vi.mock('@/components/features/auth/LogoutButton', () => ({
  LogoutButton: () => <button data-testid="logout-button">Se déconnecter</button>,
}));

describe('AccountSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    // Keep the promise pending to show loading state
    mockGetUser.mockReturnValue(new Promise(() => {}));

    render(<AccountSection />);

    // Should show skeleton while loading
    expect(screen.getByTestId('account-section-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
  });

  it('displays user email after loading', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'stephane@example.com' } },
      error: null,
    });

    render(<AccountSection />);

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('stephane@example.com');
  });

  it('renders LogoutButton below email', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null,
    });

    render(<AccountSection />);

    await waitFor(() => {
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    // LogoutButton should be rendered
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('shows section title "Mon compte"', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null,
    });

    render(<AccountSection />);

    await waitFor(() => {
      expect(screen.getByText('Mon compte')).toBeInTheDocument();
    });
  });

  it('handles error gracefully when user fetch fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' },
    });

    render(<AccountSection />);

    await waitFor(() => {
      // Should show LogoutButton even when email is not available
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    // Should not display email when error occurs
    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
  });

  it('renders user icon', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null,
    });

    render(<AccountSection />);

    await waitFor(() => {
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });
  });
});
