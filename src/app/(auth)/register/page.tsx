import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/features/auth/RegisterForm'

/**
 * Registration Page - Z-Scanner
 *
 * Server Component wrapper for the registration form.
 * Part of the (auth) route group for public auth routes.
 *
 * @see FR36 - Inscription depuis landing page
 * @see AC #1 - Navigation from landing to /register
 * @see AC #2 - Registration form display
 */

export const metadata: Metadata = {
  title: 'Créer un compte - Z-Scanner',
  description:
    'Créez votre compte Z-Scanner pour digitaliser vos tickets Z en conformité NF525.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-foreground">Z-Scanner</h1>
          </Link>
          <p className="mt-2 text-muted-foreground">
            Créez votre compte pour commencer
          </p>
        </div>

        {/* Form */}
        <RegisterForm />
      </div>
    </main>
  )
}
