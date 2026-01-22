/**
 * Unit tests for AppHeader component
 * Tests header with sync indicator integration
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { db } from '@/lib/db';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  beforeEach(async () => {
    await db.syncQueue.clear();
  });

  afterEach(async () => {
    await db.syncQueue.clear();
  });

  it('should not render when no pending sync items', async () => {
    const { container } = render(<AppHeader />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should render floating indicator when there are pending sync items', async () => {
    await db.syncQueue.add({
      action: 'create',
      entityType: 'ticket',
      entityId: 1,
      payload: '{}',
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    render(<AppHeader />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  it('should show SyncIndicator with pending count', async () => {
    await db.syncQueue.add({
      action: 'validate',
      entityType: 'ticket',
      entityId: 1,
      payload: '{}',
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    render(<AppHeader />);

    await waitFor(() => {
      expect(screen.getByTestId('sync-indicator')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('should have fixed positioning below header area', async () => {
    await db.syncQueue.add({
      action: 'validate',
      entityType: 'ticket',
      entityId: 1,
      payload: '{}',
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    render(<AppHeader />);

    await waitFor(() => {
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('fixed');
      expect(indicator).toHaveClass('top-14');
      expect(indicator).toHaveClass('right-3');
    });
  });

  it('should hide when sync completes', async () => {
    const id = await db.syncQueue.add({
      action: 'create',
      entityType: 'ticket',
      entityId: 1,
      payload: '{}',
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    const { container } = render(<AppHeader />);

    // Indicator should be visible initially
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    // Mark as completed
    await db.syncQueue.update(id, { status: 'completed' });

    // Indicator should hide
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
