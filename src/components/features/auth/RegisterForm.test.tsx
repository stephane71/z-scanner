import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from './RegisterForm'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock Supabase client
const mockSignUp = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render email and password fields with labels', () => {
    render(<RegisterForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })

  it('should render submit button with correct text', () => {
    render(<RegisterForm />)

    const submitButton = screen.getByRole('button', {
      name: /créer mon compte/i,
    })
    expect(submitButton).toBeInTheDocument()
  })

  it('should render link to login page', () => {
    render(<RegisterForm />)

    const loginLink = screen.getByRole('link', { name: /se connecter/i })
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('should show validation error for invalid email on blur', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab() // blur

    await waitFor(() => {
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for short password on blur', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/mot de passe/i)
    await user.type(passwordInput, 'short')
    await user.tab() // blur

    await waitFor(() => {
      expect(
        screen.getByText(/le mot de passe doit contenir au moins 8 caractères/i)
      ).toBeInTheDocument()
    })
  })

  it('should not submit with invalid data', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const submitButton = screen.getByRole('button', {
      name: /créer mon compte/i,
    })
    await user.click(submitButton)

    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    mockSignUp.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /créer mon compte/i,
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/création en cours/i)).toBeInTheDocument()
    })
  })

  it('should call signUp with email and password on valid submission', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ data: { user: {} }, error: null })

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /créer mon compte/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should redirect to /scan on successful registration', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ data: { user: {} }, error: null })

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /créer mon compte/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/scan')
      // Verify router.refresh() is also called to update auth state
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('should display error message when email is already registered', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: 'User already registered' },
    })

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /créer mon compte/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/un compte existe déjà avec cet email/i)
      ).toBeInTheDocument()
    })
  })

  it('should display generic error message for unknown errors', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: 'Some unknown error' },
    })

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /créer mon compte/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/une erreur est survenue. veuillez réessayer/i)
      ).toBeInTheDocument()
    })
  })

  // AC #3: Form preserves email value on error (not cleared)
  it('should preserve email value when auth error occurs', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: 'User already registered' },
    })

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /créer mon compte/i,
    })
    await user.click(submitButton)

    // Wait for error to appear
    await waitFor(() => {
      expect(
        screen.getByText(/un compte existe déjà avec cet email/i)
      ).toBeInTheDocument()
    })

    // Email should still contain the entered value (not cleared)
    expect(emailInput).toHaveValue('existing@example.com')
  })

  // Network exception handling (catch block coverage)
  it('should handle network exception gracefully', async () => {
    const user = userEvent.setup()
    mockSignUp.mockRejectedValue(new Error('Network error'))

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /créer mon compte/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/une erreur est survenue. veuillez réessayer/i)
      ).toBeInTheDocument()
    })
  })

  // Accessibility: Error banner has aria-live for screen readers
  it('should have accessible error banner with aria-live attribute', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: 'User already registered' },
    })

    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /créer mon compte/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('aria-live', 'polite')
    })
  })

  // Accessibility: Invalid fields have aria-invalid and aria-describedby
  it('should have accessible validation errors with aria attributes', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab() // blur to trigger validation

    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
    })

    const errorMessage = screen.getByText(/format d'email invalide/i)
    expect(errorMessage).toHaveAttribute('id', 'email-error')
  })
})
