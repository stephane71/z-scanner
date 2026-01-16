import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/features/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Connexion - Z-Scanner',
  description:
    'Connectez-vous à Z-Scanner pour accéder à vos tickets Z et données de vente.',
  robots: {
    index: false, // Auth pages should not be indexed
    follow: true,
  },
}

/**
 * Login page for Z-Scanner.
 *
 * Server Component wrapper for the LoginForm client component.
 * Route: /login (inside (auth) route group for public access)
 *
 * @see FR2 - Connexion compte existant
 * @see AC #1 - Login form displayed with email/password fields
 * @see AC #6 - Middleware handles redirect if already logged in
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Connexion</h1>
          <p className="text-muted-foreground">
            Accédez à vos tickets Z et données de vente
          </p>
        </div>

        {/* Login Form - Wrapped in Suspense for useSearchParams */}
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
