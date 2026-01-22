'use client';

/**
 * AppHeader - Floating sync status indicator for authenticated app pages
 * Story 3.8: Sync Queue & Indicator
 *
 * Design notes:
 * - Floating overlay that doesn't affect page layout
 * - Positioned below typical header height (top-14 = 56px)
 * - Only visible when there's sync status to show
 * - Compact pill design to minimize obstruction
 * - Does NOT interfere with page-specific headers (verify, scan, etc.)
 */

import { SyncIndicator } from './SyncIndicator';
import { usePendingSyncCount } from '@/hooks/usePendingSyncCount';

export function AppHeader() {
  const pendingCount = usePendingSyncCount();

  // Only render when there's sync status to show
  // This keeps the UI clean when everything is synced
  if (pendingCount === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-14 right-3 z-50 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm border border-gray-200"
      role="status"
      aria-live="polite"
    >
      <SyncIndicator />
    </div>
  );
}
