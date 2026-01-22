'use client';

/**
 * SyncIndicator - Floating sync status indicator
 * Story 3.8: Sync Queue & Indicator
 *
 * Displays a subtle indicator showing pending tickets to sync.
 * Uses muted styling per UX spec (offline is normal, not alarming).
 *
 * States:
 * - Hidden: All synced (clean state)
 * - Pending: Shows sync icon with ticket count
 * - Syncing: Shows spinner with "Sync..." message
 */

import { CloudUpload, RefreshCw } from 'lucide-react';
import { usePendingSyncCount } from '@/hooks/usePendingSyncCount';

interface SyncIndicatorProps {
  /** Whether sync is currently in progress */
  isSyncing?: boolean;
}

export function SyncIndicator({ isSyncing = false }: SyncIndicatorProps) {
  const pendingCount = usePendingSyncCount();

  // Hidden when all synced (clean state per UX spec)
  if (pendingCount === 0 && !isSyncing) {
    return null;
  }

  // Syncing state - show spinner
  if (isSyncing) {
    return (
      <div
        data-testid="sync-indicator"
        className="flex items-center gap-1.5 text-xs text-gray-600"
        role="status"
        aria-label="Synchronisation en cours"
      >
        <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        <span>Sync...</span>
      </div>
    );
  }

  // Pending state - show count with sync icon
  return (
    <div
      data-testid="sync-indicator"
      className="flex items-center gap-1.5 text-xs text-gray-600"
      role="status"
      aria-label={`${pendingCount} ticket${pendingCount > 1 ? 's' : ''} à synchroniser`}
    >
      <CloudUpload className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{pendingCount}</span>
    </div>
  );
}

export type { SyncIndicatorProps };
