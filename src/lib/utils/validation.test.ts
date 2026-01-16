import { describe, it, expect } from 'vitest'
import {
  registerSchema,
  validateRegisterForm,
  loginSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from './validation'

describe('registerSchema', () => {
  it('should validate a valid email and password', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('should reject an empty email', () => {
    const result = registerSchema.safeParse({
      email: '',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path[0] === 'email')
      expect(emailError?.message).toBe("L'email est requis")
    }
  })

  it('should reject an invalid email format', () => {
    const result = registerSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path[0] === 'email')
      expect(emailError?.message).toBe("Format d'email invalide")
    }
  })

  it('should reject an empty password', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordError = result.error.issues.find(
        (i) => i.path[0] === 'password'
      )
      expect(passwordError?.message).toBe('Le mot de passe est requis')
    }
  })

  it('should reject a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '1234567',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordError = result.error.issues.find(
        (i) => i.path[0] === 'password'
      )
      expect(passwordError?.message).toBe(
        'Le mot de passe doit contenir au moins 8 caractères'
      )
    }
  })

  it('should accept exactly 8 character password', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '12345678',
    })
    expect(result.success).toBe(true)
  })
})

describe('validateRegisterForm', () => {
  it('should return empty object for valid data', () => {
    const errors = validateRegisterForm({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(errors).toEqual({})
  })

  it('should return email error for invalid email', () => {
    const errors = validateRegisterForm({
      email: 'invalid',
      password: 'password123',
    })
    expect(errors.email).toBe("Format d'email invalide")
    expect(errors.password).toBeUndefined()
  })

  it('should return password error for short password', () => {
    const errors = validateRegisterForm({
      email: 'test@example.com',
      password: 'short',
    })
    expect(errors.password).toBe(
      'Le mot de passe doit contenir au moins 8 caractères'
    )
    expect(errors.email).toBeUndefined()
  })

  it('should return both errors for invalid email and short password', () => {
    const errors = validateRegisterForm({
      email: '',
      password: '',
    })
    expect(errors.email).toBe("L'email est requis")
    expect(errors.password).toBe('Le mot de passe est requis')
  })
})

describe('loginSchema', () => {
  it('should validate a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'anypassword',
    })
    expect(result.success).toBe(true)
  })

  it('should accept any length password (no minimum for login)', () => {
    // Unlike register, login accepts any password length
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'a', // Single character should be valid for login
    })
    expect(result.success).toBe(true)
  })

  it('should reject an empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path[0] === 'email')
      expect(emailError?.message).toBe("L'email est requis")
    }
  })

  it('should reject an invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path[0] === 'email')
      expect(emailError?.message).toBe("Format d'email invalide")
    }
  })

  it('should reject an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordError = result.error.issues.find(
        (i) => i.path[0] === 'password'
      )
      expect(passwordError?.message).toBe('Le mot de passe est requis')
    }
  })

  it('should reject both empty email and password', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('resetPasswordSchema', () => {
  it('should validate a valid email', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'test@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('should reject an empty email', () => {
    const result = resetPasswordSchema.safeParse({
      email: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path[0] === 'email')
      expect(emailError?.message).toBe("L'email est requis")
    }
  })

  it('should reject an invalid email format', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'invalid-email',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path[0] === 'email')
      expect(emailError?.message).toBe("Format d'email invalide")
    }
  })
})

describe('updatePasswordSchema', () => {
  it('should validate a valid password (8+ characters)', () => {
    const result = updatePasswordSchema.safeParse({
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('should accept exactly 8 character password', () => {
    const result = updatePasswordSchema.safeParse({
      password: '12345678',
    })
    expect(result.success).toBe(true)
  })

  it('should reject an empty password', () => {
    const result = updatePasswordSchema.safeParse({
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordError = result.error.issues.find(
        (i) => i.path[0] === 'password'
      )
      expect(passwordError?.message).toBe('Le mot de passe est requis')
    }
  })

  it('should reject a password shorter than 8 characters', () => {
    const result = updatePasswordSchema.safeParse({
      password: '1234567',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordError = result.error.issues.find(
        (i) => i.path[0] === 'password'
      )
      expect(passwordError?.message).toBe(
        'Le mot de passe doit contenir au moins 8 caractères'
      )
    }
  })
})
