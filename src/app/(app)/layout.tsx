/**
 * App Layout - Layout for authenticated (app) routes
 * Story 3.8: Sync Queue & Indicator - SyncIndicator integration
 * Story 3.9: Background Sync Engine - Auto-sync with toast notifications
 * Story 3.10: App Layout & Bottom Navigation - BottomNavigation integration
 *
 * Provides:
 * - SyncEngineProvider for background sync with toast notifications
 * - Floating sync indicator (top-right, doesn't affect layout)
 * - Main content area with bottom padding for navigation
 * - Bottom navigation bar for main app sections
 */

import { AppHeader } from '@/components/features/sync/AppHeader';
import { SyncEngineProvider } from '@/components/features/sync/SyncEngineProvider';
import { BottomNavigation } from '@/components/features/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SyncEngineProvider>
      {/* Floating sync indicator - doesn't affect page layout */}
      <AppHeader />
      {/* Main content with bottom padding for navigation (64px nav + safe area) */}
      <main className="pb-20">{children}</main>
      {/* Bottom navigation bar - fixed at bottom */}
      <BottomNavigation />
    </SyncEngineProvider>
  );
}
