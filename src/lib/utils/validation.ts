import { z } from 'zod'

/**
 * Registration form validation schema.
 *
 * Validates:
 * - Email: required, valid email format
 * - Password: required, minimum 8 characters
 *
 * Error messages are in French per project requirements.
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Login form validation schema.
 *
 * Validates:
 * - Email: required, valid email format
 * - Password: required (no minimum length for login - only check presence)
 *
 * Error messages are in French per project requirements.
 *
 * SECURITY: Password validation is intentionally minimal for login.
 * Don't reveal password requirements that could help attackers.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Validates registration form data and returns field-specific errors.
 *
 * @param data - Form data to validate
 * @returns Object with field errors (empty object if valid)
 */
export function validateRegisterForm(data: unknown): {
  email?: string
  password?: string
} {
  const result = registerSchema.safeParse(data)

  if (result.success) {
    return {}
  }

  const errors: { email?: string; password?: string } = {}

  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (field === 'email' && !errors.email) {
      errors.email = issue.message
    } else if (field === 'password' && !errors.password) {
      errors.password = issue.message
    }
  }

  return errors
}
