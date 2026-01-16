'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

/**
 * Reset password request form component for Z-Scanner.
 *
 * Features:
 * - Email input for password reset request
 * - Real-time form validation with react-hook-form + Zod
 * - French error messages
 * - Loading state during submission
 * - Success state replaces form with confirmation message
 * - Security: Always shows success regardless of email existence
 *
 * @see FR3 - Réinitialisation mot de passe
 * @see AC #2-5 - Form validation and submission flow
 */
export function ResetPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  })

  async function onSubmit(data: ResetPasswordFormData) {
    setAuthError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      })

      if (error) {
        // Only show error for network/server issues
        // NOT for "email not found" (security - don't reveal if email exists)
        if (
          error.message.toLowerCase().includes('network') ||
          error.message.toLowerCase().includes('fetch') ||
          error.message.toLowerCase().includes('rate')
        ) {
          setAuthError('Une erreur est survenue. Veuillez réessayer.')
          return
        }
        // For other errors (including user not found), still show success for security
      }

      // Always show success (security: don't reveal if email exists)
      setIsSuccess(true)
    } catch {
      setAuthError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  // Success state - replace form with confirmation message
  if (isSuccess) {
    return (
      <div
      className="rounded-lg border border-primary/20 bg-primary/10 p-6 text-center"
      role="status"
      aria-live="polite"
    >
        <h2 className="text-lg font-semibold text-foreground">Email envoyé!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Retour à la connexion
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

      {/* Submit Button - 64px height per UX spec */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-16 w-full text-lg font-semibold"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Envoi en cours...
          </span>
        ) : (
          'Réinitialiser le mot de passe'
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
