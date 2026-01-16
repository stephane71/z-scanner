'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterFormData } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Registration form component for Z-Scanner.
 *
 * Features:
 * - Email/password registration via Supabase Auth
 * - Real-time form validation with react-hook-form + Zod
 * - French error messages
 * - Loading state during submission
 * - Redirect to /scan on success
 *
 * @see FR36 - Inscription depuis landing page
 * @see AC #2-6 - Form validation and auth integration
 */
export function RegisterForm() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  async function onSubmit(data: RegisterFormData) {
    setAuthError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (error) {
        // Map Supabase errors to French messages
        if (error.message.toLowerCase().includes('already registered')) {
          setAuthError('Un compte existe déjà avec cet email')
        } else if (error.message.toLowerCase().includes('invalid email')) {
          setAuthError("Format d'email invalide")
        } else {
          setAuthError('Une erreur est survenue. Veuillez réessayer.')
        }
        return
      }

      // Success - redirect to scan
      router.push('/scan')
      router.refresh()
    } catch {
      setAuthError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Auth Error Banner */}
      {authError && (
        <div
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
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
          autoComplete="new-password"
          placeholder="Minimum 8 caractères"
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

      {/* Submit Button - 64px height per UX spec */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-16 w-full text-lg font-semibold"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Création en cours...
          </span>
        ) : (
          'Créer mon compte'
        )}
      </Button>

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </form>
  )
}
