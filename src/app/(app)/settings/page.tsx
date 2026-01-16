import type { Metadata } from 'next'
import { LogoutButton } from '@/components/features/auth/LogoutButton'

export const metadata: Metadata = {
  title: 'Paramètres - Z-Scanner',
  robots: 'noindex',
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      {/* Mon compte section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Mon compte</h2>
        <div className="space-y-4">
          <LogoutButton />
        </div>
      </section>

      {/* Other sections will be added in Epic 4+ */}
      {/* - Mes marchés (Story 4.5) */}
      {/* - Synchronisation (Story 3.9) */}
      {/* - À propos (Story 6.4) */}
    </div>
  )
}
