'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import { usePendingSyncCount } from '@/hooks/usePendingSyncCount'

/**
 * LogoutButton component with confirmation dialog and sync warning.
 *
 * Features:
 * - Confirmation dialog before logout (AC #1, #3)
 * - Supabase signOut integration (AC #2)
 * - Pending sync count warning (AC #5)
 * - Loading state during logout process
 * - Accessibility: aria-live for warnings
 */
export function LogoutButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingSyncCount = usePendingSyncCount()

  async function handleLogout() {
    setIsLoggingOut(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        console.error('Logout error:', signOutError)
        setError('Une erreur est survenue lors de la déconnexion. Veuillez réessayer.')
        setIsLoggingOut(false)
        return
      }

      // Success - redirect to landing page
      setIsOpen(false)
      router.push('/')
      router.refresh()
    } catch {
      console.error('Logout failed')
      setError('Une erreur est survenue lors de la déconnexion. Veuillez réessayer.')
      setIsLoggingOut(false)
    }
  }

  function handleOpenChange(open: boolean) {
    // Don't allow closing while logging out
    if (isLoggingOut) return
    setIsOpen(open)
    // Clear error when opening/closing dialog
    if (!open) {
      setError(null)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full h-12">
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <span>Êtes-vous sûr de vouloir vous déconnecter ?</span>
              {pendingSyncCount > 0 && (
                <span
                  className="mt-2 block text-amber-600 dark:text-amber-500"
                  role="status"
                  aria-live="polite"
                >
                  Vous avez {pendingSyncCount} ticket(s) non synchronisé(s).
                  Ils seront synchronisés lors de votre prochaine connexion.
                </span>
              )}
              {error && (
                <span
                  className="mt-2 block text-destructive"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </span>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoggingOut}>Annuler</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Déconnexion...
              </>
            ) : (
              'Confirmer'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
