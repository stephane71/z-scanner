import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResetPasswordForm } from './ResetPasswordForm'

// Mock Supabase client
const mockResetPasswordForEmail = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}))

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // AC #2: Form displays with email field, labels above inputs
  it('should render email field with label', () => {
    render(<ResetPasswordForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  // AC #2: Submit button present
  it('should render submit button with correct text', () => {
    render(<ResetPasswordForm />)

    const submitButton = screen.getByRole('button', {
      name: /réinitialiser/i,
    })
    expect(submitButton).toBeInTheDocument()
  })

  // AC #2: Link back to login
  it('should render link to login page', () => {
    render(<ResetPasswordForm />)

    const loginLink = screen.getByRole('link', { name: /retour à la connexion/i })
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  // AC #5: Inline validation error for empty email
  it('should show validation error for empty email on blur', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.click(emailInput)
    await user.tab() // blur without typing

    await waitFor(() => {
      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument()
    })
  })

  // AC #5: Inline validation error for invalid email format
  it('should show validation error for invalid email on blur', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab() // blur

    await waitFor(() => {
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument()
    })
  })

  // AC #5: Form does NOT submit to API with invalid data
  it('should not submit with invalid data', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)

    const submitButton = screen.getByRole('button', {
      name: /réinitialiser/i,
    })
    await user.click(submitButton)

    expect(mockResetPasswordForEmail).not.toHaveBeenCalled()
  })

  // Loading state during submission
  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    mockResetPasswordForEmail.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<ResetPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', {
      name: /réinitialiser/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/envoi en cours/i)).toBeInTheDocument()
    })
  })

  // AC #3: Calls resetPasswordForEmail with correct data
  it('should call resetPasswordForEmail with email on valid submission', async () => {
    const user = userEvent.setup()
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null })

    render(<ResetPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', {
      name: /réinitialiser/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/reset-password/confirm'),
        })
      )
    })
  })

  // AC #3 & #4: Shows success message after submission (regardless of email existence)
  it('should show success message after successful submission', async () => {
    const user = userEvent.setup()
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null })

    render(<ResetPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', {
      name: /réinitialiser/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email envoyé/i)).toBeInTheDocument()
    })
  })

  // AC #4: Shows same success message even when email doesn't exist (security)
  it('should show success message even when email is not found (security)', async () => {
    const user = userEvent.setup()
    // Simulate "user not found" error - should still show success for security
    mockResetPasswordForEmail.mockResolvedValue({
      data: null,
      error: { message: 'User not found' },
    })

    render(<ResetPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'nonexistent@example.com')

    const submitButton = screen.getByRole('button', {
      name: /réinitialiser/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      // Should show success, NOT error (security: don't reveal if email exists)
      expect(screen.getByText(/email envoyé/i)).toBeInTheDocument()
    })
  })

  // Network error handling
  it('should display error message for network errors', async () => {
    const user = userEvent.setup()
    mockResetPasswordForEmail.mockResolvedValue({
      data: null,
      error: { message: 'Network request failed' },
    })

    render(<ResetPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', {
      name: /réinitialiser/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/une erreur est survenue/i)
      ).toBeInTheDocument()
    })
  })

  // Rate limit error handling
  it('should display error message for rate limit errors', async () => {
    const user = userEvent.setup()
    mockResetPasswordForEmail.mockResolvedValue({
      data: null,
      error: { message: 'Rate limit exceeded' },
    })

    render(<ResetPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', {
      name: /réinitialiser/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/une erreur est survenue/i)
      ).toBeInTheDocument()
    })
  })

  // Exception handling
  it('should display error message when exception is thrown', async () => {
    const user = userEvent.setup()
    mockResetPasswordForEmail.mockRejectedValue(new Error('Network error'))

    render(<ResetPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', {
      name: /réinitialiser/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/une erreur est survenue/i)
      ).toBeInTheDocument()
    })
  })

  // Success state replaces form
  it('should replace form with success message after submission', async () => {
    const user = userEvent.setup()
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null })

    render(<ResetPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', {
      name: /réinitialiser/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      // Form should be replaced with success message
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
      expect(screen.getByText(/email envoyé/i)).toBeInTheDocument()
      // Should still have link back to login
      expect(screen.getByRole('link', { name: /retour/i })).toBeInTheDocument()
    })
  })
})
