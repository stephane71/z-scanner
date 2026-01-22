/**
 * Unit tests for SyncIndicator component
 * Tests header sync status indicator with pending count display
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { db } from '@/lib/db';
import { SyncIndicator } from './SyncIndicator';

// Mock usePendingSyncCount to control test values
vi.mock('@/hooks/usePendingSyncCount', () => ({
  usePendingSyncCount: vi.fn(),
}));

import { usePendingSyncCount } from '@/hooks/usePendingSyncCount';
const mockUsePendingSyncCount = vi.mocked(usePendingSyncCount);

describe('SyncIndicator', () => {
  beforeEach(async () => {
    await db.syncQueue.clear();
    mockUsePendingSyncCount.mockReturnValue(0);
  });

  afterEach(async () => {
    await db.syncQueue.clear();
    vi.clearAllMocks();
  });

  it('should not render when count is 0', () => {
    mockUsePendingSyncCount.mockReturnValue(0);
    const { container } = render(<SyncIndicator />);

    // Component should render nothing (null)
    expect(container.firstChild).toBeNull();
  });

  it('should render when there are pending items', () => {
    mockUsePendingSyncCount.mockReturnValue(3);
    render(<SyncIndicator />);

    expect(screen.getByTestId('sync-indicator')).toBeInTheDocument();
  });

  it('should display pending count', () => {
    mockUsePendingSyncCount.mockReturnValue(2);
    render(<SyncIndicator />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display count for 1 item', () => {
    mockUsePendingSyncCount.mockReturnValue(1);
    render(<SyncIndicator />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should display sync icon', () => {
    mockUsePendingSyncCount.mockReturnValue(1);
    render(<SyncIndicator />);

    // Check for SVG icon (CloudUpload)
    const indicator = screen.getByTestId('sync-indicator');
    expect(indicator.querySelector('svg')).toBeInTheDocument();
  });

  it('should use muted non-alarming styling', () => {
    mockUsePendingSyncCount.mockReturnValue(1);
    render(<SyncIndicator />);

    const indicator = screen.getByTestId('sync-indicator');
    // Should have gray text (not red/alarming)
    expect(indicator).toHaveClass('text-gray-600');
  });

  it('should show syncing state when isSyncing is true', () => {
    mockUsePendingSyncCount.mockReturnValue(2);
    render(<SyncIndicator isSyncing={true} />);

    expect(screen.getByText('Sync...')).toBeInTheDocument();
  });

  it('should show spinner animation when syncing', () => {
    mockUsePendingSyncCount.mockReturnValue(2);
    render(<SyncIndicator isSyncing={true} />);

    const indicator = screen.getByTestId('sync-indicator');
    const svg = indicator.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('should have accessible role and label', () => {
    mockUsePendingSyncCount.mockReturnValue(3);
    render(<SyncIndicator />);

    const indicator = screen.getByTestId('sync-indicator');
    expect(indicator).toHaveAttribute('role', 'status');
    expect(indicator).toHaveAttribute('aria-label');
  });
});
