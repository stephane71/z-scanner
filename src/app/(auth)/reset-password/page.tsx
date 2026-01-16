import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Mot de passe oublié - Z-Scanner',
  description:
    'Réinitialisez votre mot de passe Z-Scanner en quelques clics.',
  robots: {
    index: false, // Auth pages should not be indexed
    follow: true,
  },
}

/**
 * Password reset request page for Z-Scanner.
 *
 * Server Component wrapper for the ResetPasswordForm client component.
 * Route: /reset-password (inside (auth) route group for public access)
 *
 * @see FR3 - Réinitialisation mot de passe
 * @see AC #2 - Form with email input displayed
 * @see AC #8 - Middleware handles redirect if already logged in
 */
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Mot de passe oublié
          </h1>
          <p className="text-muted-foreground">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Reset Password Form */}
        <ResetPasswordForm />
      </div>
    </div>
  )
}
