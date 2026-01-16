'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

/**
 * Login form component for Z-Scanner.
 *
 * Features:
 * - Email/password login via Supabase Auth
 * - Real-time form validation with react-hook-form + Zod
 * - French error messages
 * - Loading state during submission
 * - Preserves email on error (doesn't clear form)
 * - Redirect to /scan on success
 *
 * SECURITY: Uses generic error message "Email ou mot de passe incorrect"
 * to avoid revealing whether an email exists in the system.
 *
 * @see FR2 - Connexion compte existant
 * @see AC #1-6 - Form validation and auth integration
 */
export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authError, setAuthError] = useState<string | null>(null)

  // Check for password reset success message from URL
  const successMessage = searchParams.get('message') === 'password-reset-success'
    ? 'Mot de passe mis à jour! Connectez-vous avec votre nouveau mot de passe.'
    : null

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  async function onSubmit(data: LoginFormData) {
    setAuthError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        // SECURITY: Don't reveal if email exists in system
        // Use generic message for all auth errors (wrong password, unknown email, etc.)
        setAuthError('Email ou mot de passe incorrect')
        return
      }

      // Success - redirect to scan (per UX spec: direct to scanner)
      router.push('/scan')
      router.refresh()
    } catch {
      setAuthError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success Message from Password Reset */}
      {successMessage && (
        <div
          className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-primary"
          role="status"
          aria-live="polite"
        >
          {successMessage}
        </div>
      )}

      {/* Auth Error Banner */}
      {authError && (
        <div
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {authError}
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          disabled={isSubmitting}
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
          className={errors.email ? 'border-destructive' : ''}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Mot de passe
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Votre mot de passe"
          disabled={isSubmitting}
          aria-describedby={errors.password ? 'password-error' : undefined}
          aria-invalid={!!errors.password}
          className={errors.password ? 'border-destructive' : ''}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link
          href="/reset-password"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      {/* Submit Button - 64px height per UX spec */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-16 w-full text-lg font-semibold"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Connexion en cours...
          </span>
        ) : (
          'Se connecter'
        )}
      </Button>

      {/* Register Link */}
      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  )
}
