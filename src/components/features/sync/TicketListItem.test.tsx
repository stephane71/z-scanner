/**
 * Unit tests for TicketListItem component
 * Tests ticket list item with integrated sync badge
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { db } from '@/lib/db';
import { TicketListItem } from './TicketListItem';
import type { Ticket } from '@/types';

// Sample ticket for testing
const createMockTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 1,
  dataHash: 'test-hash',
  userId: 'user-1',
  status: 'validated',
  createdAt: '2026-01-15T14:30:00.000Z',
  clientTimestamp: '2026-01-15T14:30:00.000Z',
  type: 'STATISTIQUES',
  impressionDate: '2026-01-15',
  lastResetDate: '2026-01-01',
  resetNumber: 1,
  ticketNumber: 42,
  discountValue: 0,
  cancelValue: 0,
  cancelNumber: 0,
  payments: [{ mode: 'CB', value: 2500 }],
  total: 2500,
  ...overrides,
});

describe('TicketListItem', () => {
  beforeEach(async () => {
    await db.syncQueue.clear();
  });

  afterEach(async () => {
    await db.syncQueue.clear();
  });

  it('should render ticket number', () => {
    const ticket = createMockTicket();
    render(<TicketListItem ticket={ticket} />);

    expect(screen.getByText('Ticket #42')).toBeInTheDocument();
  });

  it('should render formatted date', () => {
    const ticket = createMockTicket({ impressionDate: '2026-01-15' });
    render(<TicketListItem ticket={ticket} />);

    expect(screen.getByText('15/01/2026')).toBeInTheDocument();
  });

  it('should render formatted total amount', () => {
    const ticket = createMockTicket({ total: 2500 }); // 25.00 EUR
    render(<TicketListItem ticket={ticket} />);

    // French format: 25,00 €
    expect(screen.getByText('25,00 €')).toBeInTheDocument();
  });

  it('should show sync badge when ticket has pending sync', async () => {
    const ticket = createMockTicket();

    // Add pending sync for this ticket
    await db.syncQueue.add({
      action: 'create',
      entityType: 'ticket',
      entityId: ticket.id!,
      payload: '{}',
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    render(<TicketListItem ticket={ticket} />);

    await waitFor(() => {
      expect(screen.getByTestId('ticket-sync-badge')).toBeInTheDocument();
      expect(screen.getByText('Non synchronisé')).toBeInTheDocument();
    });
  });

  it('should not show sync badge when ticket is synced', async () => {
    const ticket = createMockTicket();

    // Add completed sync (not pending)
    await db.syncQueue.add({
      action: 'create',
      entityType: 'ticket',
      entityId: ticket.id!,
      payload: '{}',
      status: 'completed',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    const { container } = render(<TicketListItem ticket={ticket} />);

    await waitFor(() => {
      expect(container.querySelector('[data-testid="ticket-sync-badge"]')).toBeNull();
    });
  });

  it('should call onClick when clicked', async () => {
    const ticket = createMockTicket();
    const handleClick = vi.fn();

    render(<TicketListItem ticket={ticket} onClick={handleClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have accessible label', () => {
    const ticket = createMockTicket({ ticketNumber: 42 });
    render(<TicketListItem ticket={ticket} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toContain('Ticket 42');
  });

  it('should handle ticket without ticketNumber', () => {
    const ticket = createMockTicket({ ticketNumber: undefined });
    render(<TicketListItem ticket={ticket} />);

    expect(screen.getByText('Ticket #N/A')).toBeInTheDocument();
  });

  it('should fallback to createdAt if impressionDate is missing', () => {
    const ticket = createMockTicket({
      impressionDate: undefined,
      createdAt: '2026-01-20T10:00:00.000Z',
    });
    render(<TicketListItem ticket={ticket} />);

    expect(screen.getByText('20/01/2026')).toBeInTheDocument();
  });
});
