/**
 * TicketDetailClient component tests
 * Story 4.2: Ticket Detail View
 * Story 4.7: Ticket Cancellation (NF525 Compliant)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketDetailClient } from './TicketDetailClient';
import type { Ticket } from '@/types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: '1' })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock useTicketById
const mockUseTicketById = vi.fn();
vi.mock('@/hooks/useTickets', () => ({
  useTicketById: (id: number | undefined) => mockUseTicketById(id),
}));

// Mock feature components
vi.mock('@/components/features/tickets/DetailHeader', () => ({
  DetailHeader: ({ ticketNumber }: { ticketNumber: number }) => (
    <div data-testid="detail-header">Ticket #{ticketNumber}</div>
  ),
}));

vi.mock('@/components/features/tickets/TicketPhoto', () => ({
  TicketPhoto: () => <div data-testid="ticket-photo">Photo</div>,
  TicketPhotoSkeleton: () => <div data-testid="photo-skeleton">Photo Loading</div>,
}));

vi.mock('@/components/features/tickets/TicketFields', () => ({
  TicketFields: () => <div data-testid="ticket-fields">Fields</div>,
}));

vi.mock('@/components/features/tickets/NF525Info', () => ({
  NF525Info: () => <div data-testid="nf525-info">NF525 Info</div>,
}));

vi.mock('@/components/features/tickets/CancelledBanner', () => ({
  CancelledBanner: () => <div data-testid="cancelled-banner">Cancelled</div>,
}));

vi.mock('@/components/features/tickets/CancellationDialog', () => ({
  CancellationDialog: ({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: (reason: string) => Promise<void> }) => (
    open ? (
      <div data-testid="cancellation-dialog">
        <button onClick={() => onOpenChange(false)}>Dismiss</button>
        <button onClick={() => onConfirm('Test reason')}>Confirm</button>
      </div>
    ) : null
  ),
}));

// Mock useCancelTicket hook
const mockCancelTicket = vi.fn();
vi.mock('@/hooks', () => ({
  useCancelTicket: () => ({
    cancelTicket: mockCancelTicket,
    isLoading: false,
    error: null,
  }),
}));

const mockTicket: Ticket = {
  id: 1,
  userId: 'user-123',
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
  total: 12500,
  dataHash: 'abc123',
  createdAt: '2026-01-15T10:00:00Z',
  clientTimestamp: '2026-01-15T10:00:00Z',
  validatedAt: '2026-01-15T10:05:00Z',
};

describe('TicketDetailClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton while loading', () => {
    mockUseTicketById.mockReturnValue({ ticket: undefined, isLoading: true });

    render(<TicketDetailClient />);

    expect(screen.getByTestId('detail-skeleton')).toBeInTheDocument();
  });

  it('shows not found when ticket does not exist', () => {
    mockUseTicketById.mockReturnValue({ ticket: undefined, isLoading: false });

    render(<TicketDetailClient />);

    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(screen.getByText('Ticket non trouvé')).toBeInTheDocument();
    expect(screen.getByTestId('back-to-list')).toHaveAttribute('href', '/tickets');
  });

  it('renders ticket detail with all components', () => {
    mockUseTicketById.mockReturnValue({ ticket: mockTicket, isLoading: false });

    render(<TicketDetailClient />);

    expect(screen.getByTestId('detail-header')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-photo')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-fields')).toBeInTheDocument();
    expect(screen.getByTestId('nf525-info')).toBeInTheDocument();
  });

  it('shows NF525 info only for validated tickets', () => {
    mockUseTicketById.mockReturnValue({
      ticket: { ...mockTicket, status: 'draft', validatedAt: undefined },
      isLoading: false,
    });

    render(<TicketDetailClient />);

    expect(screen.queryByTestId('nf525-info')).not.toBeInTheDocument();
  });

  it('shows cancelled banner for cancelled tickets', () => {
    mockUseTicketById.mockReturnValue({
      ticket: {
        ...mockTicket,
        status: 'cancelled',
        cancelledAt: '2026-01-16T10:00:00Z',
        cancellationReason: 'Erreur de saisie',
      },
      isLoading: false,
    });

    render(<TicketDetailClient />);

    expect(screen.getByTestId('cancelled-banner')).toBeInTheDocument();
    expect(screen.queryByTestId('nf525-info')).not.toBeInTheDocument();
  });

  it('displays correct ticket number in header', () => {
    mockUseTicketById.mockReturnValue({ ticket: mockTicket, isLoading: false });

    render(<TicketDetailClient />);

    expect(screen.getByTestId('detail-header')).toHaveTextContent('Ticket #42');
  });

  it('uses ticket ID from URL params', () => {
    mockUseTicketById.mockReturnValue({ ticket: mockTicket, isLoading: false });

    render(<TicketDetailClient />);

    expect(mockUseTicketById).toHaveBeenCalledWith(1);
  });

  it('hides NF525 info for cancelled tickets even if validatedAt exists', () => {
    mockUseTicketById.mockReturnValue({
      ticket: {
        ...mockTicket,
        status: 'cancelled',
        validatedAt: '2026-01-15T10:05:00Z',
        cancelledAt: '2026-01-16T10:00:00Z',
        cancellationReason: 'Erreur',
      },
      isLoading: false,
    });

    render(<TicketDetailClient />);

    expect(screen.getByTestId('cancelled-banner')).toBeInTheDocument();
    // NF525 info should NOT show for cancelled tickets (status !== 'validated')
    expect(screen.queryByTestId('nf525-info')).not.toBeInTheDocument();
  });

  // Story 4.7: Cancel button visibility tests
  describe('Cancel Button (Story 4.7)', () => {
    it('shows cancel button for validated tickets', () => {
      mockUseTicketById.mockReturnValue({ ticket: mockTicket, isLoading: false });

      render(<TicketDetailClient />);

      expect(screen.getByRole('button', { name: /annuler ce ticket/i })).toBeInTheDocument();
    });

    it('hides cancel button for draft tickets', () => {
      mockUseTicketById.mockReturnValue({
        ticket: { ...mockTicket, status: 'draft', validatedAt: undefined },
        isLoading: false,
      });

      render(<TicketDetailClient />);

      expect(screen.queryByRole('button', { name: /annuler ce ticket/i })).not.toBeInTheDocument();
    });

    it('hides cancel button for cancelled tickets', () => {
      mockUseTicketById.mockReturnValue({
        ticket: {
          ...mockTicket,
          status: 'cancelled',
          cancelledAt: '2026-01-16T10:00:00Z',
          cancellationReason: 'Erreur',
        },
        isLoading: false,
      });

      render(<TicketDetailClient />);

      expect(screen.queryByRole('button', { name: /annuler ce ticket/i })).not.toBeInTheDocument();
    });

    it('opens cancellation dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();
      mockUseTicketById.mockReturnValue({ ticket: mockTicket, isLoading: false });

      render(<TicketDetailClient />);

      const cancelButton = screen.getByRole('button', { name: /annuler ce ticket/i });
      await user.click(cancelButton);

      expect(screen.getByTestId('cancellation-dialog')).toBeInTheDocument();
    });
  });
});
