/**
 * App Layout - Layout for authenticated (app) routes
 * Story 3.8: Sync Queue & Indicator - SyncIndicator integration
 * Story 3.9: Background Sync Engine - Auto-sync with toast notifications
 * Story 3.10: Will add BottomNavigation
 *
 * Provides:
 * - SyncEngineProvider for background sync with toast notifications
 * - Floating sync indicator (top-right, doesn't affect layout)
 * - Main content area (full page, pages manage their own headers)
 * - (Future) Bottom navigation for main app sections
 */

import { AppHeader } from '@/components/features/sync/AppHeader';
import { SyncEngineProvider } from '@/components/features/sync/SyncEngineProvider';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SyncEngineProvider>
      {/* Floating sync indicator - doesn't affect page layout */}
      <AppHeader />
      {/* Pages manage their own layout and headers */}
      {children}
      {/* BottomNavigation will be added in Story 3.10 */}
    </SyncEngineProvider>
  );
}
