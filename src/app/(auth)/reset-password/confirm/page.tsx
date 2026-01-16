import type { Metadata } from 'next'
import { UpdatePasswordForm } from '@/components/features/auth/UpdatePasswordForm'

export const metadata: Metadata = {
  title: 'Nouveau mot de passe - Z-Scanner',
  description: 'Définissez votre nouveau mot de passe Z-Scanner.',
  robots: {
    index: false, // Auth pages should not be indexed
    follow: true,
  },
}

/**
 * Password update page for Z-Scanner.
 *
 * Server Component wrapper for the UpdatePasswordForm client component.
 * Route: /reset-password/confirm (inside (auth) route group for public access)
 *
 * This page is accessed via the magic link sent by Supabase Auth.
 * The token is handled automatically by Supabase via URL hash/cookies.
 *
 * @see FR3 - Réinitialisation mot de passe
 * @see AC #6 - Form to enter new password with requirements shown
 * @see AC #7 - Password update and redirect to login
 */
export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Nouveau mot de passe
          </h1>
          <p className="text-muted-foreground">
            Définissez votre nouveau mot de passe
          </p>
        </div>

        {/* Update Password Form */}
        <UpdatePasswordForm />
      </div>
    </div>
  )
}
