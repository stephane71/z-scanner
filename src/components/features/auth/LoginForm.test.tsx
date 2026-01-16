import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

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
const mockSignInWithPassword = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // AC #1: Form displays with email/password fields, labels above inputs
  it('should render email and password fields with labels', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })

  // AC #1: Submit button present
  it('should render submit button with correct text', () => {
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', {
      name: /se connecter/i,
    })
    expect(submitButton).toBeInTheDocument()
  })

  // AC #1: Link to /register for new users
  it('should render link to register page', () => {
    render(<LoginForm />)

    const registerLink = screen.getByRole('link', { name: /créer un compte/i })
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  // AC #1: Link to /reset-password for forgotten passwords
  it('should render link to reset-password page', () => {
    render(<LoginForm />)

    const resetLink = screen.getByRole('link', { name: /mot de passe oublié/i })
    expect(resetLink).toHaveAttribute('href', '/reset-password')
  })

  // AC #5: Inline validation error for invalid email format
  it('should show validation error for invalid email on blur', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab() // blur

    await waitFor(() => {
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument()
    })
  })

  // AC #5: Inline validation error for empty email
  it('should show validation error for empty email on blur', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.click(emailInput)
    await user.tab() // blur without typing

    await waitFor(() => {
      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument()
    })
  })

  // AC #5: Inline validation error for empty password
  it('should show validation error for empty password on blur', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/mot de passe/i)
    await user.click(passwordInput)
    await user.tab() // blur without typing

    await waitFor(() => {
      expect(screen.getByText(/le mot de passe est requis/i)).toBeInTheDocument()
    })
  })

  // AC #5: Form does NOT submit to API with invalid data
  it('should not submit with invalid data', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', {
      name: /se connecter/i,
    })
    await user.click(submitButton)

    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  // AC #2: Loading state during submission
  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    mockSignInWithPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /se connecter/i,
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/connexion en cours/i)).toBeInTheDocument()
    })
  })

  // AC #2: Calls signInWithPassword with correct data
  it('should call signInWithPassword with email and password on valid submission', async () => {
    const user = userEvent.setup()
    mockSignInWithPassword.mockResolvedValue({ data: { user: {} }, error: null })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /se connecter/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  // AC #2: Redirects to /scan on success
  it('should redirect to /scan on successful login', async () => {
    const user = userEvent.setup()
    mockSignInWithPassword.mockResolvedValue({ data: { user: {} }, error: null })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /se connecter/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/scan')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  // AC #3 & #4: Generic error message for invalid credentials
  // SECURITY: Don't reveal if email exists
  it('should display generic error message for invalid credentials', async () => {
    const user = userEvent.setup()
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')

    const submitButton = screen.getByRole('button', {
      name: /se connecter/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/email ou mot de passe incorrect/i)
      ).toBeInTheDocument()
    })
  })

  // AC #3: Form is NOT cleared on error (email preserved)
  it('should preserve email value on authentication error', async () => {
    const user = userEvent.setup()
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/mot de passe/i) as HTMLInputElement

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')

    const submitButton = screen.getByRole('button', {
      name: /se connecter/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email ou mot de passe incorrect/i)).toBeInTheDocument()
    })

    // Email should still be in the input after error
    expect(emailInput.value).toBe('test@example.com')
  })

  // Generic error for unknown errors
  it('should display generic error message for unknown errors', async () => {
    const user = userEvent.setup()
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Some unknown error' },
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /se connecter/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      // All auth errors show the same generic message for security
      expect(
        screen.getByText(/email ou mot de passe incorrect/i)
      ).toBeInTheDocument()
    })
  })

  // Edge case: network error during submission
  it('should display error message when network error occurs', async () => {
    const user = userEvent.setup()
    mockSignInWithPassword.mockRejectedValue(new Error('Network error'))

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', {
      name: /se connecter/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/une erreur est survenue. veuillez réessayer/i)
      ).toBeInTheDocument()
    })
  })
})
