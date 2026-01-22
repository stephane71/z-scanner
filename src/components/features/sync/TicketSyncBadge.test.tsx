/**
 * Unit tests for TicketSyncBadge component
 * Tests individual ticket sync status badge display
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { db } from '@/lib/db';
import { TicketSyncBadge } from './TicketSyncBadge';

describe('TicketSyncBadge', () => {
  beforeEach(async () => {
    await db.syncQueue.clear();
  });

  afterEach(async () => {
    await db.syncQueue.clear();
  });

  it('should not render when ticket has no pending sync items', async () => {
    const { container } = render(<TicketSyncBadge ticketId={1} />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should render when ticket has pending sync item', async () => {
    // Add a pending sync item for this ticket
    await db.syncQueue.add({
      action: 'create',
      entityType: 'ticket',
      entityId: 1,
      payload: '{}',
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    render(<TicketSyncBadge ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByTestId('ticket-sync-badge')).toBeInTheDocument();
    });
  });

  it('should display "Non synchronisé" text in French', async () => {
    await db.syncQueue.add({
      action: 'create',
      entityType: 'ticket',
      entityId: 1,
      payload: '{}',
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    render(<TicketSyncBadge ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Non synchronisé')).toBeInTheDocument();
    });
  });

  it('should use amber styling (warning but not error)', async () => {
    await db.syncQueue.add({
      action: 'create',
      entityType: 'ticket',
      entityId: 1,
      payload: '{}',
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    render(<TicketSyncBadge ticketId={1} />);

    await waitFor(() => {
      const badge = screen.getByTestId('ticket-sync-badge');
      expect(badge).toHaveClass('text-amber-600');
      expect(badge).toHaveClass('bg-amber-50');
    });
  });

  it('should not render for different ticket ID', async () => {
    await db.syncQueue.add({
      action: 'create',
      entityType: 'ticket',
      entityId: 999, // Different ticket
      payload: '{}',
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    const { container } = render(<TicketSyncBadge ticketId={1} />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should not render when sync item is completed', async () => {
    await db.syncQueue.add({
      action: 'create',
      entityType: 'ticket',
      entityId: 1,
      payload: '{}',
      status: 'completed', // Already synced
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    const { container } = render(<TicketSyncBadge ticketId={1} />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should update reactively when sync completes', async () => {
    const id = await db.syncQueue.add({
      action: 'create',
      entityType: 'ticket',
      entityId: 1,
      payload: '{}',
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    const { container } = render(<TicketSyncBadge ticketId={1} />);

    // Badge should be visible initially
    await waitFor(() => {
      expect(screen.getByTestId('ticket-sync-badge')).toBeInTheDocument();
    });

    // Mark as completed
    await db.syncQueue.update(id, { status: 'completed' });

    // Badge should disappear
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should show badge for in-progress items (still not synced)', async () => {
    await db.syncQueue.add({
      action: 'create',
      entityType: 'ticket',
      entityId: 1,
      payload: '{}',
      status: 'in-progress', // Syncing but not complete
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    render(<TicketSyncBadge ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByTestId('ticket-sync-badge')).toBeInTheDocument();
    });
  });

  it('should check photo entities as well as tickets', async () => {
    await db.syncQueue.add({
      action: 'create',
      entityType: 'photo',
      entityId: 1, // Photo linked to ticket 1
      payload: JSON.stringify({ ticketId: 1 }),
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    render(<TicketSyncBadge ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByTestId('ticket-sync-badge')).toBeInTheDocument();
    });
  });
});
