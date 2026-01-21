/**
 * Integration tests for VerifyPageClient
 * Story 3.6: Ticket Validation with NF525 Compliance
 *
 * Tests for:
 * - Validation flow: form → validate → success overlay → redirect
 * - Error handling for auth failures
 * - Protection against validating non-draft tickets
 * - User feedback during validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VerifyPageClient } from './VerifyPageClient';
import { db } from '@/lib/db';
import type { Ticket } from '@/types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Supabase client
const mockGetUser = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

// Mock haptic feedback
vi.mock('@/lib/utils/haptic', () => ({
  triggerHaptic: vi.fn(),
}));

// Mock computeTicketHash
vi.mock('@/lib/crypto', () => ({
  computeTicketHash: vi.fn(() => 'mockedhash123456789'),
}));

describe('VerifyPageClient', () => {
  const mockUserId = 'user-test-123';
  let testTicketId: number;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset router mock
    mockPush.mockReset();

    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
    });

    // Clear database
    await db.tickets.clear();
    await db.syncQueue.clear();
    await db.photos.clear();

    // Create a draft ticket for testing
    const draftTicket: Omit<Ticket, 'id'> = {
      dataHash: '',
      userId: mockUserId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      clientTimestamp: new Date().toISOString(),
      type: 'STATISTIQUES',
      impressionDate: '2026-01-21',
      lastResetDate: '2026-01-21',
      resetNumber: 1,
      ticketNumber: 42,
      discountValue: 0,
      cancelValue: 0,
      cancelNumber: 0,
      payments: [{ mode: 'CB', value: 12500 }],
      total: 12500,
      ocrStatus: 'pending_validation',
    };

    testTicketId = (await db.tickets.add(draftTicket as Ticket)) as number;
  });

  afterEach(async () => {
    // Clear database after each test
    await db.tickets.clear();
    await db.syncQueue.clear();
  });

  it('should render loading spinner initially', async () => {
    const { container } = render(<VerifyPageClient ticketId={testTicketId} />);

    // Should show loading spinner while fetching data
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render verification form after loading', async () => {
    render(<VerifyPageClient ticketId={testTicketId} />);

    // Wait for form to load and button to appear
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /valider/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should redirect to /scan for already validated tickets', async () => {
    // Update ticket to validated status
    await db.tickets.update(testTicketId, { status: 'validated' });

    render(<VerifyPageClient ticketId={testTicketId} />);

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/scan');
      },
      { timeout: 3000 }
    );
  });

  it('should show auth error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    render(<VerifyPageClient ticketId={testTicketId} />);

    await waitFor(
      () => {
        expect(screen.getByText(/non authentifié/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should show auth error when getUser fails', async () => {
    mockGetUser.mockRejectedValue(new Error('Auth failed'));

    render(<VerifyPageClient ticketId={testTicketId} />);

    await waitFor(
      () => {
        expect(screen.getByText(/erreur d'authentification/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should disable validate button when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    render(<VerifyPageClient ticketId={testTicketId} />);

    await waitFor(
      () => {
        const button = screen.getByRole('button', { name: /valider/i });
        expect(button).toBeDisabled();
      },
      { timeout: 3000 }
    );
  });

  it('should update ticket status to validated after clicking validate', async () => {
    const user = userEvent.setup();

    render(<VerifyPageClient ticketId={testTicketId} />);

    // Wait for form to load
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /valider/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait a bit for auth to complete
    await waitFor(
      () => {
        const button = screen.getByRole('button', { name: /valider/i });
        expect(button).not.toBeDisabled();
      },
      { timeout: 3000 }
    );

    // Click validate button
    const validateButton = screen.getByRole('button', { name: /valider/i });
    await act(async () => {
      await user.click(validateButton);
    });

    // Wait for validation to complete
    await waitFor(
      async () => {
        const ticket = await db.tickets.get(testTicketId);
        expect(ticket?.status).toBe('validated');
      },
      { timeout: 5000 }
    );
  });

  it('should add entry to sync queue after validation', async () => {
    const user = userEvent.setup();

    render(<VerifyPageClient ticketId={testTicketId} />);

    // Wait for form to load and be enabled
    await waitFor(
      () => {
        const button = screen.getByRole('button', { name: /valider/i });
        expect(button).not.toBeDisabled();
      },
      { timeout: 3000 }
    );

    // Click validate button
    const validateButton = screen.getByRole('button', { name: /valider/i });
    await act(async () => {
      await user.click(validateButton);
    });

    // Wait for sync queue entry
    await waitFor(
      async () => {
        const syncItems = await db.syncQueue.toArray();
        expect(syncItems.length).toBeGreaterThan(0);
        expect(syncItems[0].action).toBe('validate');
      },
      { timeout: 5000 }
    );
  });

  it('should show ValidationSuccess overlay after successful validation', async () => {
    const user = userEvent.setup();

    render(<VerifyPageClient ticketId={testTicketId} />);

    // Wait for form to load and be enabled
    await waitFor(
      () => {
        const button = screen.getByRole('button', { name: /valider/i });
        expect(button).not.toBeDisabled();
      },
      { timeout: 3000 }
    );

    // Click validate button
    const validateButton = screen.getByRole('button', { name: /valider/i });
    await act(async () => {
      await user.click(validateButton);
    });

    // Should show success overlay after validation completes
    await waitFor(
      () => {
        expect(screen.getByText('Conforme NF525')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('should redirect to /scan for invalid ticket ID', async () => {
    render(<VerifyPageClient ticketId={0} />);

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/scan');
      },
      { timeout: 3000 }
    );
  });

  it('should redirect to /scan for negative ticket ID', async () => {
    render(<VerifyPageClient ticketId={-1} />);

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/scan');
      },
      { timeout: 3000 }
    );
  });
});
