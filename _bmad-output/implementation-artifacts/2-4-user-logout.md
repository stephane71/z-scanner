# Story 2.4: User Logout

Status: done

## Story

As a **logged-in user**,
I want **to log out of my account**,
So that **I can secure my data on shared devices** (FR4).

## Acceptance Criteria

1. **Given** I am logged in and on the /settings page
   **When** I tap the "Déconnexion" button
   **Then** a confirmation dialog appears asking if I'm sure I want to log out

2. **Given** I am on the confirmation dialog
   **When** I confirm logout
   **Then** my session is terminated via Supabase Auth
   **And** my local JWT token is cleared
   **And** I am redirected to the landing page (/)
   **And** I cannot access protected routes without logging in again

3. **Given** I am on the confirmation dialog
   **When** I cancel the logout
   **Then** the dialog closes
   **And** I remain on the /settings page
   **And** my session is NOT terminated

4. **Given** I have logged out
   **When** I try to access /scan, /tickets, /export, or /settings
   **Then** I am redirected to /login by the middleware
   **And** I see the login form

5. **Given** I have pending unsynchronized data (tickets in sync queue)
   **When** I attempt to log out
   **Then** a warning is displayed about unsynchronized data
   **And** I can choose to log out anyway or cancel
   **And** if I log out, pending data remains in IndexedDB for next session

## Tasks / Subtasks

- [x] **Task 1: Create Settings Page Route** (AC: #1)
  - [x] Create `src/app/(app)/settings/page.tsx` as Server Component wrapper
  - [x] Ensure route is protected (auth required) - already configured in middleware
  - [x] Add page metadata for SEO
  - [x] Create basic settings page layout with "Mon compte" section

- [x] **Task 2: Create LogoutButton Component** (AC: #1, #2, #3)
  - [x] Create `src/components/features/auth/LogoutButton.tsx` as Client Component
  - [x] Use shadcn/ui Button with destructive variant
  - [x] Implement confirmation dialog using shadcn/ui AlertDialog
  - [x] Add "Déconnexion" text with logout icon
  - [x] Button placement in "Mon compte" section of settings

- [x] **Task 3: Implement Logout Logic** (AC: #2, #4)
  - [x] Use `createClient()` from `@/lib/supabase/client`
  - [x] Call `supabase.auth.signOut()` on confirmation
  - [x] Handle success: redirect to / (landing page)
  - [x] Handle error: display French error message in dialog
  - [x] Show loading state during logout process

- [x] **Task 4: Sync Queue Warning** (AC: #5)
  - [x] Create hook `usePendingSyncCount()` in `src/hooks/usePendingSyncCount.ts`
  - [x] Query syncQueue table from Dexie for pending items (placeholder returns 0 until Epic 3)
  - [x] If pending count > 0, show warning in confirmation dialog
  - [x] Warning message: "Vous avez X ticket(s) non synchronisé(s). Ils seront synchronisés lors de votre prochaine connexion."
  - [x] User can still choose to log out with pending data

- [x] **Task 5: Tests** (AC: #1-5)
  - [x] Unit tests for LogoutButton component (13 tests)
  - [x] Unit tests for usePendingSyncCount hook (3 tests)
  - [x] Test confirmation dialog flow
  - [x] Test successful logout and redirect
  - [x] Test cancel logout flow
  - [x] Test pending sync warning display

## Dev Notes

### Technical Stack Requirements (EXACT)

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.1.1 | App Router, Server/Client Components |
| React | 19.2.3 | UI rendering |
| @supabase/ssr | ^0.x | Browser client for auth |
| Tailwind CSS | 4.x | Styling with design tokens |
| shadcn/ui | latest | Button, AlertDialog components |
| Dexie.js | 4.x | IndexedDB for sync queue check |

**Dependencies already installed in Epic 1** - Do NOT reinstall.

### Architecture Compliance (CRITICAL)

```
src/
├── app/
│   └── (app)/                    # Protected routes with BottomNav
│       ├── scan/
│       │   └── page.tsx          # Existing
│       ├── tickets/
│       │   └── page.tsx          # Placeholder (Epic 4)
│       ├── export/
│       │   └── page.tsx          # Placeholder (Epic 5)
│       └── settings/
│           └── page.tsx          # NEW - This story
└── components/
    └── features/
        └── auth/
            ├── LoginForm.tsx           # Story 2.1
            ├── RegisterForm.tsx        # Story 1.4
            ├── ResetPasswordForm.tsx   # Story 2.3
            ├── UpdatePasswordForm.tsx  # Story 2.3
            └── LogoutButton.tsx        # NEW - This story
└── hooks/
    └── usePendingSyncCount.ts          # NEW - This story
```

**Route Group:** `(app)` is for PROTECTED routes requiring authentication. Settings page MUST be placed here per project-context.md.

### Supabase Auth Pattern (signOut)

```typescript
// src/components/features/auth/LogoutButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LogOut } from 'lucide-react'
import { usePendingSyncCount } from '@/hooks/usePendingSyncCount'

export function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pendingSyncCount = usePendingSyncCount()

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Logout error:', error)
        // Show toast with error message
        return
      }

      // Success - redirect to landing page
      router.push('/')
      router.refresh()
    } catch {
      console.error('Logout failed')
      // Show toast with error message
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full h-12">
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir vous déconnecter ?
            {pendingSyncCount > 0 && (
              <span className="mt-2 block text-warning">
                ⚠️ Vous avez {pendingSyncCount} ticket(s) non synchronisé(s).
                Ils seront synchronisés lors de votre prochaine connexion.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoggingOut ? 'Déconnexion...' : 'Confirmer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### usePendingSyncCount Hook Pattern

```typescript
// src/hooks/usePendingSyncCount.ts
'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

/**
 * Returns the count of pending (unsynchronized) items in the sync queue.
 * Used to warn users before logout if they have unsynchronized data.
 */
export function usePendingSyncCount(): number {
  const count = useLiveQuery(
    async () => {
      // Count items with status 'pending' in syncQueue
      return await db.syncQueue.where('status').equals('pending').count()
    },
    [], // dependencies
    0 // default value while loading
  )

  return count ?? 0
}
```

**NOTE:** The Dexie database schema and syncQueue table will be created in Epic 3 (Story 3.1). For now, this hook should handle the case where the database doesn't exist yet by returning 0.

### Settings Page Layout

```typescript
// src/app/(app)/settings/page.tsx
import { LogoutButton } from '@/components/features/auth/LogoutButton'

export const metadata = {
  title: 'Paramètres - Z-Scanner',
  robots: 'noindex',
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      {/* Mon compte section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Mon compte</h2>
        <div className="space-y-4">
          {/* User email display - optional for this story */}
          <LogoutButton />
        </div>
      </section>

      {/* Other sections will be added in Epic 4+ */}
      {/* - Mes marchés (Story 4.5) */}
      {/* - Synchronisation (Story 3.9) */}
      {/* - À propos (Story 6.4) */}
    </div>
  )
}
```

### shadcn/ui Components Required

**IMPORTANT:** AlertDialog is NOT currently installed. Developer MUST install it first:

```bash
# Install AlertDialog component (REQUIRED for this story)
npx shadcn@latest add alert-dialog
```

**Verify existing components:**
- Button component ✅ (installed in Epic 1)
- AlertDialog ❌ (must install)

### Form Patterns (per UX Spec)

| Element | Pattern |
|---------|---------|
| Logout button | Destructive variant (red), h-12 (48px), full width |
| Confirmation dialog | AlertDialog with clear title and description |
| Loading state | Text change in button, disabled state |
| Warning | Orange/warning color for sync warning |

### Design System Colors (from globals.css)

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| Destructive | `--destructive` | Logout button background, confirm button |
| Destructive Foreground | `--destructive-foreground` | Button text on destructive |
| Warning | `--warning` (if exists) or `#F59E0B` | Sync warning text |
| Foreground | `--foreground` | Dialog title, descriptions |
| Muted Foreground | `--muted-foreground` | Secondary dialog text |

### Error Messages (French)

| Scenario | Message |
|----------|---------|
| Logout failed | "Une erreur est survenue lors de la déconnexion. Veuillez réessayer." |
| Pending sync warning | "Vous avez X ticket(s) non synchronisé(s). Ils seront synchronisés lors de votre prochaine connexion." |
| Confirm title | "Confirmer la déconnexion" |
| Confirm description | "Êtes-vous sûr de vouloir vous déconnecter ?" |

### Middleware Already Configured

The middleware at `src/middleware.ts` already handles:
- ✅ Protects /settings route (line 68-72: `pathname.startsWith('/settings')`)
- ✅ Redirects non-logged users from /settings to /login
- ✅ After logout, user will be redirected to /login if trying to access protected routes

**No middleware changes required** for this story.

### Previous Story Intelligence (Stories 2.1, 2.2, 2.3)

**Learnings to apply:**

1. **aria-live attribute** - Error/warning banners MUST have `aria-live="polite"` for WCAG 2.1 AA accessibility
2. **Shared Spinner component** - Use `<Spinner />` from `@/components/ui/spinner` (created in Story 2.3)
3. **react-hook-form pattern** - NOT needed here (no form, just button + dialog)
4. **Router interactions** - Call both `router.push()` and `router.refresh()` for full state update
5. **Error handling** - Use try/catch with generic French error messages
6. **Test patterns** - Mock `createClient`, `useRouter`, and `useLiveQuery`
7. **Supabase signOut pattern** - Already used in UpdatePasswordForm.tsx (Story 2.3)

**Code from Story 2.3 to reference:**
- `src/components/features/auth/UpdatePasswordForm.tsx` - signOut() usage (line 71)
- `src/components/ui/spinner.tsx` - Reusable spinner component

### Testing Approach

**Unit Tests Required for LogoutButton:**
1. Component renders correctly with "Déconnexion" text
2. Clicking button opens confirmation dialog
3. Cancel button closes dialog without logout
4. Confirm button calls signOut()
5. Redirects to / on successful logout
6. Shows loading state during logout
7. Handles signOut error gracefully
8. Shows warning when pendingSyncCount > 0
9. Hides warning when pendingSyncCount = 0

**Unit Tests Required for usePendingSyncCount:**
1. Returns 0 when no pending items
2. Returns correct count when pending items exist
3. Updates reactively when items are added/removed
4. Handles database not existing gracefully

**Test Mocks:**
```typescript
// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signOut: vi.fn(),
    },
  })),
}))

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}))

// Mock usePendingSyncCount hook
vi.mock('@/hooks/usePendingSyncCount', () => ({
  usePendingSyncCount: vi.fn(() => 0),
}))
```

### Git Intelligence (Recent Commits)

| Commit | Relevant Insight |
|--------|------------------|
| `26c83cf` | Story 2.3 - signOut() pattern in UpdatePasswordForm, Spinner component |
| `1f1706f` | Story 2.2 - accessibility improvements (aria-live) |
| `a900c92` | Story 2.1 - auth form pattern, router.push + router.refresh |
| `a68f5e0` | Story 1.4 - form validation with Zod |
| `a0f879d` | Story 1.2 - Supabase client utilities, middleware patterns |

### Dexie Database Note (IMPORTANT)

The syncQueue table will be created in Epic 3 (Story 3.1: Local Database Schema). For Story 2.4, the `usePendingSyncCount` hook should:

1. Check if Dexie database exists
2. If not, return 0 (no pending items)
3. If yes, query the syncQueue table for pending items

This allows the logout functionality to work before Epic 3 is implemented, with the sync warning feature becoming active once the database schema is in place.

### Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `src/app/(app)/settings/page.tsx` | CREATE | Server Component with settings layout |
| `src/components/features/auth/LogoutButton.tsx` | CREATE | Client Component with dialog and logout logic |
| `src/components/features/auth/LogoutButton.test.tsx` | CREATE | Unit tests for LogoutButton |
| `src/hooks/usePendingSyncCount.ts` | CREATE | Hook for checking pending sync items |
| `src/hooks/usePendingSyncCount.test.ts` | CREATE | Unit tests for the hook |

### Forbidden Patterns (NEVER DO)

- ❌ Call signOut() without confirmation dialog
- ❌ Delete data from IndexedDB on logout (preserve for next session)
- ❌ Use window.location for navigation (use router.push)
- ❌ Skip error handling for signOut
- ❌ Create files outside defined structure
- ❌ Use hardcoded colors (use design tokens)
- ❌ Skip loading state during logout
- ❌ Ignore pending sync count (must warn user)
- ❌ Call Supabase from Server Components for auth mutations

### Project Structure Notes

- Settings page goes in `(app)` route group for protected routes
- Client Components have 'use client' directive
- Co-locate tests with components (`ComponentName.test.tsx`)
- Hooks go in `src/hooks/` directory
- Hook tests go next to the hook (`hookName.test.ts`)

### References

- [Source: epics.md#Story-2.4] - Acceptance criteria for logout
- [Source: architecture.md#Authentication-Security] - JWT handling, Supabase Auth
- [Source: ux-design-specification.md#Button-Hierarchy] - Destructive button pattern (48px)
- [Source: ux-design-specification.md#Navigation-Patterns] - Bottom Tab Bar includes Settings
- [Source: project-context.md#React-Next-Rules] - Route groups, Client Components
- [Source: project-context.md#Naming-Conventions] - File naming conventions
- [Source: Story 2.3 Dev Notes] - signOut() usage pattern
- [Source: Supabase Docs] - signOut() method signature

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- AlertDialog was installed via `npx shadcn@latest add alert-dialog`
- Initial implementation used AlertDialogAction which auto-closed on click, causing tests to fail
- Fixed by using controlled dialog state (isOpen) and regular Button component for confirm action
- usePendingSyncCount returns 0 as placeholder until Epic 3 implements Dexie database

### Completion Notes List

- **Task 1:** Created `/settings` page in `(app)` route group with SEO metadata (noindex). Settings page is protected by existing middleware which redirects to /login if not authenticated.
- **Task 2:** Created LogoutButton with shadcn/ui AlertDialog for confirmation. Button uses destructive variant with LogOut icon from lucide-react. Dialog uses controlled state to stay open during loading and error states.
- **Task 3:** Implemented signOut via Supabase client. On success, redirects to landing page (/) with router.push + router.refresh. On error, displays French error message in dialog. Loading state shows Spinner component.
- **Task 4:** Created usePendingSyncCount hook as placeholder returning 0. When Epic 3 implements Dexie database with syncQueue table, hook will use useLiveQuery to get real pending count. Warning message appears in dialog when pendingSyncCount > 0.
- **Task 5:** 16 tests total (13 for LogoutButton, 3 for usePendingSyncCount). All 128 tests pass. Tests cover: button rendering, dialog flow, logout success/error, loading state, sync warning display, accessibility (aria-live attributes).

### File List

**New Files:**
- `src/app/(app)/settings/page.tsx` - Settings page Server Component
- `src/components/features/auth/LogoutButton.tsx` - Logout button with confirmation dialog
- `src/components/features/auth/LogoutButton.test.tsx` - 13 unit tests
- `src/hooks/usePendingSyncCount.ts` - Hook for pending sync count
- `src/hooks/usePendingSyncCount.test.ts` - 3 unit tests
- `src/components/ui/alert-dialog.tsx` - shadcn/ui AlertDialog (auto-generated)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-16 | Story created with comprehensive developer context | Claude Opus 4.5 |
| 2026-01-16 | Implementation complete - all 5 tasks done, 128 tests passing | Claude Opus 4.5 |
| 2026-01-16 | Code review approved - added Cancel button disabled test (129 tests) | Claude Opus 4.5 |
