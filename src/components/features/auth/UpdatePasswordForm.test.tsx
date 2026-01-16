import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UpdatePasswordForm } from './UpdatePasswordForm'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock Supabase client
const mockUpdateUser = vi.fn()
const mockGetSession = vi.fn()
const mockSignOut = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
      getSession: mockGetSession,
      signOut: mockSignOut,
    },
  }),
}))

describe('UpdatePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: valid session (token is valid)
    mockGetSession.mockResolvedValue({ data: { session: { user: {} } } })
  })

  // AC #6: Form displays with password field
  it('should render password field with label when token is valid', async () => {
    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument()
    })
  })

  // AC #6: Submit button present
  it('should render submit button with correct text', async () => {
    render(<UpdatePasswordForm />)

    await waitFor(() => {
      const submitButton = screen.getByRole('button', {
        name: /mettre à jour/i,
      })
      expect(submitButton).toBeInTheDocument()
    })
  })

  // AC #6: Password requirements shown
  it('should show password requirements hint', async () => {
    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument()
    })
  })

  // Link back to login
  it('should render link to login page', async () => {
    render(<UpdatePasswordForm />)

    await waitFor(() => {
      const loginLink = screen.getByRole('link', { name: /retour à la connexion/i })
      expect(loginLink).toHaveAttribute('href', '/login')
    })
  })

  // Validation error for empty password
  it('should show validation error for empty password on blur', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument()
    })

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i)
    await user.click(passwordInput)
    await user.tab() // blur without typing

    await waitFor(() => {
      expect(screen.getByText(/le mot de passe est requis/i)).toBeInTheDocument()
    })
  })

  // Validation error for short password
  it('should show validation error for short password on blur', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument()
    })

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i)
    await user.type(passwordInput, '1234567') // 7 chars
    await user.tab() // blur

    await waitFor(() => {
      expect(
        screen.getByText(/le mot de passe doit contenir au moins 8 caractères/i)
      ).toBeInTheDocument()
    })
  })

  // Form does NOT submit with invalid data
  it('should not submit with invalid data', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mettre à jour/i })).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', {
      name: /mettre à jour/i,
    })
    await user.click(submitButton)

    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  // Loading state during submission
  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    mockUpdateUser.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument()
    })

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i)
    await user.type(passwordInput, 'newpassword123')

    const submitButton = screen.getByRole('button', {
      name: /mettre à jour/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/mise à jour/i)).toBeInTheDocument()
    })
  })

  // AC #7: Calls updateUser with correct data
  it('should call updateUser with password on valid submission', async () => {
    const user = userEvent.setup()
    mockUpdateUser.mockResolvedValue({ data: {}, error: null })
    mockSignOut.mockResolvedValue({ error: null })

    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument()
    })

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i)
    await user.type(passwordInput, 'newpassword123')

    const submitButton = screen.getByRole('button', {
      name: /mettre à jour/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      })
    })
  })

  // AC #7: Signs out after successful update
  it('should call signOut after successful password update', async () => {
    const user = userEvent.setup()
    mockUpdateUser.mockResolvedValue({ data: {}, error: null })
    mockSignOut.mockResolvedValue({ error: null })

    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument()
    })

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i)
    await user.type(passwordInput, 'newpassword123')

    const submitButton = screen.getByRole('button', {
      name: /mettre à jour/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  // AC #7: Redirects to /login with success message
  it('should redirect to /login with success message after password update', async () => {
    const user = userEvent.setup()
    mockUpdateUser.mockResolvedValue({ data: {}, error: null })
    mockSignOut.mockResolvedValue({ error: null })

    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument()
    })

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i)
    await user.type(passwordInput, 'newpassword123')

    const submitButton = screen.getByRole('button', {
      name: /mettre à jour/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?message=password-reset-success')
    })
  })

  // Error handling for update failure
  it('should display error message when password update fails', async () => {
    const user = userEvent.setup()
    mockUpdateUser.mockResolvedValue({
      data: null,
      error: { message: 'Update failed' },
    })

    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument()
    })

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i)
    await user.type(passwordInput, 'newpassword123')

    const submitButton = screen.getByRole('button', {
      name: /mettre à jour/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/impossible de mettre à jour/i)
      ).toBeInTheDocument()
    })
  })

  // Exception handling
  it('should display error message when exception is thrown', async () => {
    const user = userEvent.setup()
    mockUpdateUser.mockRejectedValue(new Error('Network error'))

    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument()
    })

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i)
    await user.type(passwordInput, 'newpassword123')

    const submitButton = screen.getByRole('button', {
      name: /mettre à jour/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/une erreur est survenue/i)
      ).toBeInTheDocument()
    })
  })

  // Loading state while checking token
  it('should show loading spinner while checking session', () => {
    mockGetSession.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    render(<UpdatePasswordForm />)

    // Should show spinner while loading
    expect(screen.queryByLabelText(/nouveau mot de passe/i)).not.toBeInTheDocument()
  })

  // Invalid/expired token handling
  it('should show error message for invalid/expired token', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByText(/lien invalide ou expiré/i)).toBeInTheDocument()
    })

    // Should show link to request new reset
    expect(screen.getByRole('link', { name: /demander un nouveau lien/i })).toHaveAttribute(
      'href',
      '/reset-password'
    )
  })

  // Invalid token should not show form
  it('should not show form when token is invalid', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(screen.getByText(/lien invalide/i)).toBeInTheDocument()
    })

    // Form should not be rendered
    expect(screen.queryByLabelText(/nouveau mot de passe/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mettre à jour/i })).not.toBeInTheDocument()
  })
})
