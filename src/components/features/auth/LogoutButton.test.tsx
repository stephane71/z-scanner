import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogoutButton } from './LogoutButton'

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
const mockSignOut = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}))

// Mock usePendingSyncCount hook
const mockUsePendingSyncCount = vi.fn()
vi.mock('@/hooks/usePendingSyncCount', () => ({
  usePendingSyncCount: () => mockUsePendingSyncCount(),
}))

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePendingSyncCount.mockReturnValue(0) // Default: no pending sync
  })

  // AC #1: Logout button visible with correct text
  it('should render logout button with "Déconnexion" text', () => {
    render(<LogoutButton />)

    const button = screen.getByRole('button', { name: /déconnexion/i })
    expect(button).toBeInTheDocument()
  })

  // AC #1: Clicking button opens confirmation dialog
  it('should open confirmation dialog when button is clicked', async () => {
    const user = userEvent.setup()
    render(<LogoutButton />)

    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    expect(screen.getByText(/confirmer la déconnexion/i)).toBeInTheDocument()
    expect(
      screen.getByText(/êtes-vous sûr de vouloir vous déconnecter/i)
    ).toBeInTheDocument()
  })

  // AC #3: Cancel button closes dialog without logout
  it('should close dialog without logout when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<LogoutButton />)

    // Open dialog
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText(/confirmer la déconnexion/i)).not.toBeInTheDocument()
    })

    // signOut should NOT be called
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  // AC #2: Confirm button calls signOut
  it('should call signOut when confirm is clicked', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValue({ error: null })
    render(<LogoutButton />)

    // Open dialog
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    // Click confirm
    const confirmButton = screen.getByRole('button', { name: /confirmer/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })
  })

  // AC #2: Redirects to / on successful logout
  it('should redirect to landing page on successful logout', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValue({ error: null })
    render(<LogoutButton />)

    // Open dialog and confirm
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    const confirmButton = screen.getByRole('button', { name: /confirmer/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  // AC #2: Loading state during logout
  it('should show loading state during logout', async () => {
    const user = userEvent.setup()
    // Slow signOut to observe loading state
    mockSignOut.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    )
    render(<LogoutButton />)

    // Open dialog and confirm
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    const confirmButton = screen.getByRole('button', { name: /confirmer/i })
    await user.click(confirmButton)

    // Should show loading text
    await waitFor(() => {
      expect(screen.getByText(/déconnexion\.\.\./i)).toBeInTheDocument()
    })
  })

  // Error handling: Display error message on signOut failure
  it('should display error message when logout fails', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValue({ error: { message: 'Logout failed' } })
    render(<LogoutButton />)

    // Open dialog and confirm
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    const confirmButton = screen.getByRole('button', { name: /confirmer/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(
        screen.getByText(/une erreur est survenue lors de la déconnexion/i)
      ).toBeInTheDocument()
    })
  })

  // Error handling: Network error
  it('should handle network error gracefully', async () => {
    const user = userEvent.setup()
    mockSignOut.mockRejectedValue(new Error('Network error'))
    render(<LogoutButton />)

    // Open dialog and confirm
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    const confirmButton = screen.getByRole('button', { name: /confirmer/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(
        screen.getByText(/une erreur est survenue lors de la déconnexion/i)
      ).toBeInTheDocument()
    })
  })

  // AC #5: Show warning when pending sync count > 0
  it('should show sync warning when there are pending items', async () => {
    const user = userEvent.setup()
    mockUsePendingSyncCount.mockReturnValue(3)
    render(<LogoutButton />)

    // Open dialog
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    expect(
      screen.getByText(/vous avez 3 ticket\(s\) non synchronisé\(s\)/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/ils seront synchronisés lors de votre prochaine connexion/i)
    ).toBeInTheDocument()
  })

  // AC #5: Hide warning when pending sync count is 0
  it('should not show sync warning when there are no pending items', async () => {
    const user = userEvent.setup()
    mockUsePendingSyncCount.mockReturnValue(0)
    render(<LogoutButton />)

    // Open dialog
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    expect(
      screen.queryByText(/ticket\(s\) non synchronisé\(s\)/i)
    ).not.toBeInTheDocument()
  })

  // AC #5: User can still logout with pending data
  it('should allow logout even with pending sync items', async () => {
    const user = userEvent.setup()
    mockUsePendingSyncCount.mockReturnValue(5)
    mockSignOut.mockResolvedValue({ error: null })
    render(<LogoutButton />)

    // Open dialog
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    // Confirm button should still be enabled
    const confirmButton = screen.getByRole('button', { name: /confirmer/i })
    expect(confirmButton).not.toBeDisabled()

    // Should be able to logout
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  // Accessibility: Warning has aria-live for screen readers
  it('should have accessible warning with aria-live attribute', async () => {
    const user = userEvent.setup()
    mockUsePendingSyncCount.mockReturnValue(2)
    render(<LogoutButton />)

    // Open dialog
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    const warning = screen.getByRole('status')
    expect(warning).toBeInTheDocument()
    expect(warning).toHaveAttribute('aria-live', 'polite')
  })

  // Cancel button should be disabled during logout
  it('should disable cancel button during logout', async () => {
    const user = userEvent.setup()
    // Slow signOut to observe loading state
    mockSignOut.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    )
    render(<LogoutButton />)

    // Open dialog and confirm
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    const confirmButton = screen.getByRole('button', { name: /confirmer/i })
    await user.click(confirmButton)

    // Cancel button should be disabled during logout
    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /annuler/i })
      expect(cancelButton).toBeDisabled()
    })
  })

  // Accessibility: Error has aria-live for screen readers
  it('should have accessible error with aria-live attribute', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValue({ error: { message: 'Error' } })
    render(<LogoutButton />)

    // Open dialog and trigger error
    const button = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(button)

    const confirmButton = screen.getByRole('button', { name: /confirmer/i })
    await user.click(confirmButton)

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    })
  })
})
