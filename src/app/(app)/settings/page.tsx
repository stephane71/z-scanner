import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Settings } from 'lucide-react';
import { MarketListClient, AccountSection, SyncSection, AboutSection } from '@/components/features/settings';

export const metadata: Metadata = {
  title: 'Paramètres - Z-Scanner',
  robots: 'noindex',
};

/**
 * Settings page - User account and app settings
 * Story 6.4: Settings Page
 *
 * Sections:
 * - Mon compte: User email and logout (AccountSection)
 * - Mes marchés: Market management (MarketListClient from Story 4.5)
 * - Synchronisation: Sync status and manual sync (SyncSection)
 * - À propos: App version, NF525 compliance, support (AboutSection)
 */
export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>

      {/* Mon compte section (Story 6.4) */}
      <Suspense
        fallback={
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Mon compte</h2>
            <div data-testid="account-section-fallback" className="space-y-4">
              <div className="h-16 bg-muted animate-pulse rounded-lg" />
              <div className="h-12 bg-muted animate-pulse rounded-lg" />
            </div>
          </section>
        }
      >
        <AccountSection />
      </Suspense>

      {/* Mes marchés section (Story 4.5) */}
      <Suspense
        fallback={
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Mes marchés</h2>
            <div data-testid="market-list-skeleton" className="space-y-3">
              <div className="h-12 bg-muted animate-pulse rounded-lg" />
              <div className="h-12 bg-muted animate-pulse rounded-lg" />
            </div>
          </section>
        }
      >
        <MarketListClient />
      </Suspense>

      {/* Synchronisation section (Story 6.4) */}
      <SyncSection />

      {/* À propos section (Story 6.4) */}
      <AboutSection />
    </div>
  );
}
