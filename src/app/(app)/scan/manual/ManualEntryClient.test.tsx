/**
 * Unit tests for ManualEntryClient component
 * Story 3.5: Manual Entry Fallback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// Mock modules before importing the component
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockGetUser = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

const mockTicketsAdd = vi.fn();
vi.mock('@/lib/db', () => ({
  db: {
    tickets: {
      add: (data: unknown) => mockTicketsAdd(data),
    },
  },
}));

import { ManualEntryClient } from './ManualEntryClient';

describe('ManualEntryClient', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
    });

    mockTicketsAdd.mockResolvedValue(42); // ticket ID
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should show loading while fetching user', async () => {
      // Make user fetch slow
      mockGetUser.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<ManualEntryClient />);

      // Should show loading spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render header after user loads', async () => {
      render(<ManualEntryClient />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /saisie manuelle/i })
        ).toBeInTheDocument();
      });
    });

    it('should render form after user loads', async () => {
      render(<ManualEntryClient />);

      await waitFor(() => {
        expect(screen.getByLabelText(/date d'impression/i)).toBeInTheDocument();
      });
    });

    it('should render submit button', async () => {
      render(<ManualEntryClient />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /créer le ticket/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('authentication errors', () => {
    it('should show error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      render(<ManualEntryClient />);

      await waitFor(() => {
        expect(screen.getByText(/non authentifié/i)).toBeInTheDocument();
      });
    });

    it('should show login link when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      render(<ManualEntryClient />);

      await waitFor(() => {
        const loginLink = screen.getByRole('link', { name: /se connecter/i });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');
      });
    });

    it('should show error when auth check fails', async () => {
      mockGetUser.mockRejectedValue(new Error('Auth error'));

      render(<ManualEntryClient />);

      await waitFor(
        () => {
          expect(
            screen.getByText(/erreur lors de la vérification/i)
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('form submission', () => {
    it('should create ticket and navigate on submit', async () => {
      render(<ManualEntryClient />);

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/date d'impression/i)).toBeInTheDocument();
      });

      // Fill in valid form data that satisfies validation
      // Note: The validation requires total === sum of payments
      const ticketNumberInput = screen.getByLabelText(/n° ticket/i);
      fireEvent.change(ticketNumberInput, { target: { value: '1' } });

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /créer le ticket/i,
      });
      fireEvent.click(submitButton);

      // Should create ticket
      await waitFor(() => {
        expect(mockTicketsAdd).toHaveBeenCalled();
      });

      // Should navigate to verification
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/scan/verify/42');
      });
    });

    it('should include correct ocrStatus in ticket', async () => {
      render(<ManualEntryClient />);

      await waitFor(() => {
        expect(screen.getByLabelText(/date d'impression/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /créer le ticket/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockTicketsAdd).toHaveBeenCalled();
        const ticketData = mockTicketsAdd.mock.calls[0][0];
        expect(ticketData.ocrStatus).toBe('manual_entry');
      });
    });

    it('should handle ticket creation failure and display error', async () => {
      mockTicketsAdd.mockRejectedValue(new Error('Database error'));

      render(<ManualEntryClient />);

      await waitFor(() => {
        expect(screen.getByLabelText(/date d'impression/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /créer le ticket/i,
      });
      fireEvent.click(submitButton);

      // The error should be logged and the user should stay on the page
      await waitFor(() => {
        expect(mockTicketsAdd).toHaveBeenCalled();
      });

      // Should display error message to user (AC #4: inline error messages)
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Database error')).toBeInTheDocument();
      });

      // Should not navigate on error
      expect(mockPush).not.toHaveBeenCalledWith('/scan/verify/42');
    });

    it('should allow dismissing save error', async () => {
      mockTicketsAdd.mockRejectedValue(new Error('Database error'));

      render(<ManualEntryClient />);

      await waitFor(() => {
        expect(screen.getByLabelText(/date d'impression/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /créer le ticket/i,
      });
      fireEvent.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Click dismiss button
      const closeButton = screen.getByLabelText(/fermer/i);
      fireEvent.click(closeButton);

      // Error should be dismissed
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    it('should have back link to scanner', async () => {
      render(<ManualEntryClient />);

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /retour/i });
        expect(backLink).toHaveAttribute('href', '/scan');
      });
    });
  });
});
