'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { updatePasswordSchema, type UpdatePasswordFormData } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

/**
 * Update password form component for Z-Scanner.
 *
 * Features:
 * - New password input with validation
 * - Password requirements displayed clearly
 * - Real-time form validation with react-hook-form + Zod
 * - French error messages
 * - Loading state during submission
 * - Invalid/expired token handling
 * - Redirects to /login with success message on completion
 *
 * @see FR3 - Réinitialisation mot de passe
 * @see AC #6 - Form with password requirements shown
 * @see AC #7 - Password update via Supabase Auth
 */
export function UpdatePasswordForm() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    mode: 'onBlur',
  })

  // Check if we have a valid session from the magic link
  // Supabase automatically handles the token from the URL hash
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsTokenValid(!!session)
    }
    checkSession()
  }, [])

  async function onSubmit(data: UpdatePasswordFormData) {
    setAuthError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        setAuthError('Impossible de mettre à jour le mot de passe. Veuillez réessayer.')
        return
      }

      // Success - sign out and redirect to login with success message
      await supabase.auth.signOut()
      router.push('/login?message=password-reset-success')
    } catch {
      setAuthError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  // Loading state while checking token
  if (isTokenValid === null) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  // Invalid/expired token state
  if (isTokenValid === false) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
        <h2 className="text-lg font-semibold text-destructive">
          Lien invalide ou expiré
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ce lien de réinitialisation n'est plus valide. Veuillez en demander un nouveau.
        </p>
        <Link
          href="/reset-password"
          className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Nouveau mot de passe
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Votre nouveau mot de passe"
          disabled={isSubmitting}
          aria-describedby={errors.password ? 'password-error' : 'password-requirements'}
          aria-invalid={!!errors.password}
          className={errors.password ? 'border-destructive' : ''}
          {...register('password')}
        />
        {errors.password ? (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        ) : (
          <p id="password-requirements" className="text-sm text-muted-foreground">
            Au moins 8 caractères
          </p>
        )}
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
            Mise à jour...
          </span>
        ) : (
          'Mettre à jour le mot de passe'
        )}
      </Button>

      {/* Back to Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Retour à la connexion
        </Link>
      </p>
    </form>
  )
}
