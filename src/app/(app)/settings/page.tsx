import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Settings } from 'lucide-react';
import { LogoutButton } from '@/components/features/auth/LogoutButton';
import { MarketListClient } from '@/components/features/settings';

export const metadata: Metadata = {
  title: 'Paramètres - Z-Scanner',
  robots: 'noindex',
};

/**
 * Settings page - User account and app settings
 * Story 3.10: App Layout & Bottom Navigation
 * Story 4.5: Market Management (CRUD)
 *
 * Currently includes:
 * - Mes marchés (Story 4.5)
 * - Logout button (Story 2.4)
 *
 * Will include in future:
 * - Synchronisation manual retry (Story 6.4)
 * - À propos section (Story 6.4)
 */
export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>

      {/* Mon compte section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Mon compte</h2>
        <div className="space-y-4">
          <LogoutButton />
        </div>
      </section>

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
    </div>
  );
}
