import type { Metadata } from 'next';
import { Settings } from 'lucide-react';
import { LogoutButton } from '@/components/features/auth/LogoutButton';

export const metadata: Metadata = {
  title: 'Paramètres - Z-Scanner',
  robots: 'noindex',
};

/**
 * Settings page - User account and app settings
 * Story 3.10: App Layout & Bottom Navigation - Enhanced placeholder
 *
 * Currently includes:
 * - Logout button (Story 2.4)
 *
 * Will include in future:
 * - Mes marchés (Story 4.5)
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

      {/* Placeholder for future sections */}
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          D&apos;autres options seront disponibles dans les prochaines mises à jour.
        </p>
      </div>

      {/* Future sections:
        - Mes marchés (Story 4.5)
        - Synchronisation manual retry (Story 6.4)
        - À propos (Story 6.4)
      */}
    </div>
  );
}
