/**
 * SyncSection Component Tests
 * Story 6.4: Settings Page - Task 2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SyncSection } from './SyncSection';

// Mock hooks
const mockManualSync = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/hooks', () => ({
  useSyncEngine: vi.fn(() => ({
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
    manualSync: mockManualSync,
    syncError: null,
    lastSyncResult: null,
  })),
  useToast: vi.fn(() => ({
    toastSuccess: mockToastSuccess,
    toastError: mockToastError,
  })),
}));

// Import after mock setup
import { useSyncEngine } from '@/hooks';

describe('SyncSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section title "Synchronisation"', () => {
    render(<SyncSection />);

    expect(screen.getByText('Synchronisation')).toBeInTheDocument();
  });

  it('shows "Tout synchronisé" when no pending items', () => {
    render(<SyncSection />);

    expect(screen.getByText('Tout synchronisé')).toBeInTheDocument();
    expect(screen.getByTestId('sync-check-icon')).toBeInTheDocument();
  });

  it('shows pending count when items are waiting', () => {
    vi.mocked(useSyncEngine).mockReturnValue({
      isSyncing: false,
      pendingCount: 3,
      failedCount: 0,
      manualSync: mockManualSync,
      syncError: null,
      lastSyncResult: null,
    });

    render(<SyncSection />);

    expect(screen.getByText(/3 élément\(s\) en attente/)).toBeInTheDocument();
  });

  it('disables sync button when nothing to sync', () => {
    vi.mocked(useSyncEngine).mockReturnValue({
      isSyncing: false,
      pendingCount: 0,
      failedCount: 0,
      manualSync: mockManualSync,
      syncError: null,
      lastSyncResult: null,
    });

    render(<SyncSection />);

    const button = screen.getByRole('button', { name: /synchroniser maintenant/i });
    expect(button).toBeDisabled();
  });

  it('enables sync button when items are pending', () => {
    vi.mocked(useSyncEngine).mockReturnValue({
      isSyncing: false,
      pendingCount: 2,
      failedCount: 0,
      manualSync: mockManualSync,
      syncError: null,
      lastSyncResult: null,
    });

    render(<SyncSection />);

    const button = screen.getByRole('button', { name: /synchroniser maintenant/i });
    expect(button).not.toBeDisabled();
  });

  it('triggers manualSync when button is clicked', async () => {
    mockManualSync.mockResolvedValue(undefined);
    vi.mocked(useSyncEngine).mockReturnValue({
      isSyncing: false,
      pendingCount: 1,
      failedCount: 0,
      manualSync: mockManualSync,
      syncError: null,
      lastSyncResult: null,
    });

    render(<SyncSection />);

    const button = screen.getByRole('button', { name: /synchroniser maintenant/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockManualSync).toHaveBeenCalled();
    });
  });

  it('shows loading spinner when syncing', () => {
    vi.mocked(useSyncEngine).mockReturnValue({
      isSyncing: true,
      pendingCount: 1,
      failedCount: 0,
      manualSync: mockManualSync,
      syncError: null,
      lastSyncResult: null,
    });

    render(<SyncSection />);

    // Check for spinner by button text changing to "Synchronisation..."
    expect(screen.getByText('Synchronisation...')).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows success toast after sync completes', async () => {
    mockManualSync.mockResolvedValue(undefined);
    vi.mocked(useSyncEngine).mockReturnValue({
      isSyncing: false,
      pendingCount: 1,
      failedCount: 0,
      manualSync: mockManualSync,
      syncError: null,
      lastSyncResult: null,
    });

    render(<SyncSection />);

    const button = screen.getByRole('button', { name: /synchroniser maintenant/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Synchronisation terminée');
    });
  });

  it('shows error toast when sync fails', async () => {
    mockManualSync.mockRejectedValue(new Error('Network error'));
    vi.mocked(useSyncEngine).mockReturnValue({
      isSyncing: false,
      pendingCount: 1,
      failedCount: 0,
      manualSync: mockManualSync,
      syncError: null,
      lastSyncResult: null,
    });

    render(<SyncSection />);

    const button = screen.getByRole('button', { name: /synchroniser maintenant/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        'Synchronisation échouée',
        'Réessayez plus tard'
      );
    });
  });

  it('shows failed count when items have failed', () => {
    vi.mocked(useSyncEngine).mockReturnValue({
      isSyncing: false,
      pendingCount: 0,
      failedCount: 2,
      manualSync: mockManualSync,
      syncError: null,
      lastSyncResult: null,
    });

    render(<SyncSection />);

    expect(screen.getByText(/2 échec\(s\)/)).toBeInTheDocument();
  });
});
