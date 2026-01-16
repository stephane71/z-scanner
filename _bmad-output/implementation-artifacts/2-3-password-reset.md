# Story 2.3: Password Reset

Status: done

## Story

As a **user who forgot their password**,
I want **to reset my password via email**,
So that **I can regain access to my account** (FR3).

## Acceptance Criteria

1. **Given** I am on the /login page
   **When** I click "Mot de passe oublié?"
   **Then** I am navigated to /reset-password

2. **Given** I am on /reset-password
   **When** the page loads
   **Then** a form with email input is displayed
   **And** form labels are above inputs (per UX spec)
   **And** a link back to /login is visible

3. **Given** I enter my registered email on /reset-password
   **When** I submit the form
   **Then** a password reset email is sent via Supabase Auth
   **And** a confirmation message is displayed: "Email envoyé! Vérifiez votre boîte de réception."
   **And** the form is replaced by the success message

4. **Given** I enter an email that doesn't exist in the system
   **When** I submit the form
   **Then** the same confirmation message is displayed (security: don't reveal if email exists)

5. **Given** I enter invalid email format
   **When** I try to submit
   **Then** inline validation error is shown below the email field
   **And** form does NOT submit to API

6. **Given** I click the reset link in the email
   **When** I navigate to /reset-password/confirm
   **Then** a form to enter new password is displayed
   **And** password requirements are clearly shown (min 8 chars)

7. **Given** I enter a valid new password (min 8 chars)
   **When** I submit the new password form
   **Then** my password is updated via Supabase Auth
   **And** I am redirected to /login with a success message

8. **Given** I am already logged in
   **When** I navigate to /reset-password
   **Then** I am redirected to /scan (no reset needed when logged in)

## Tasks / Subtasks

- [x] **Task 1: Create Reset Password Request Route** (AC: #1, #2, #8)
  - [x] Create `src/app/(auth)/reset-password/page.tsx` as Server Component wrapper
  - [x] Create `src/components/features/auth/ResetPasswordForm.tsx` as Client Component
  - [x] Ensure route is public (no auth required)
  - [x] Add page metadata for SEO (robots noindex)
  - [x] Verify middleware redirects logged-in users away from /reset-password

- [x] **Task 2: Implement Reset Password Request Form** (AC: #2)
  - [x] Create form with email input (type="email", labels above)
  - [x] Add "Réinitialiser" submit button (primary green, 64px height)
  - [x] Add link back to /login
  - [x] Implement success state showing confirmation message

- [x] **Task 3: Form Validation with Zod** (AC: #5)
  - [x] Create `resetPasswordSchema` in `src/lib/utils/validation.ts`
  - [x] Email validation: required, valid email format
  - [x] Integrate with react-hook-form + zodResolver
  - [x] Show inline errors below fields (destructive color)

- [x] **Task 4: Supabase Auth Integration (Request)** (AC: #3, #4)
  - [x] Use `createClient()` from `@/lib/supabase/client`
  - [x] Call `supabase.auth.resetPasswordForEmail({ email, redirectTo })`
  - [x] Handle success: show confirmation message (always, regardless of email existence)
  - [x] Handle error: display French error message only for network errors
  - [x] Show loading state during submission
  - [x] Set `redirectTo` to `/reset-password/confirm`

- [x] **Task 5: Create Password Update Route** (AC: #6, #7)
  - [x] Create `src/app/(auth)/reset-password/confirm/page.tsx` as Server Component wrapper
  - [x] Create `src/components/features/auth/UpdatePasswordForm.tsx` as Client Component
  - [x] Extract reset token from URL (Supabase handles via hash)
  - [x] Handle invalid/expired token state

- [x] **Task 6: Implement Password Update Form** (AC: #6, #7)
  - [x] Create form with new password input (type="password", labels above)
  - [x] Add password confirmation input (optional - skipped as single password input is sufficient)
  - [x] Show password requirements visually ("Au moins 8 caractères")
  - [x] Add "Mettre à jour" submit button (primary green, 64px height)

- [x] **Task 7: Supabase Auth Integration (Update)** (AC: #7)
  - [x] Use `createClient()` from `@/lib/supabase/client`
  - [x] Call `supabase.auth.updateUser({ password })`
  - [x] Handle success: redirect to /login with success message
  - [x] Handle error: display French error message
  - [x] Show loading state during submission

- [x] **Task 8: Add Link to Reset Password** (AC: #1)
  - [x] Verify "Mot de passe oublié?" link exists in LoginForm (confirmed at line 130-135)
  - [x] Ensure link navigates to /reset-password
  - [x] Add success message display for ?message=password-reset-success in LoginForm

- [x] **Task 9: Tests** (AC: #1-8)
  - [x] Unit tests for ResetPasswordForm component (13 tests)
  - [x] Unit tests for UpdatePasswordForm component (16 tests)
  - [x] Unit tests for resetPasswordSchema validation (3 tests)
  - [x] Unit tests for updatePasswordSchema validation (4 tests)
  - [x] Test form submission flows
  - [x] Test success/error state rendering
  - [x] Test loading states
  - [x] Add tests for LoginForm success message display (2 tests)

## Dev Notes

### Technical Stack Requirements (EXACT)

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.1.1 | App Router, Server/Client Components |
| React | 19.2.3 | UI rendering |
| @supabase/ssr | ^0.x | Browser client for auth |
| react-hook-form | ^7.x | Form state management |
| @hookform/resolvers | ^3.x | Zod integration |
| Zod | latest | Form validation schema |
| Tailwind CSS | 4.x | Styling with design tokens |
| shadcn/ui | latest | Input, Button, Label components |

**Dependencies already installed in Epic 1** - Do NOT reinstall.

### Architecture Compliance (CRITICAL)

```
src/
├── app/
│   └── (auth)/
│       ├── login/                  # Story 2.1
│       │   └── page.tsx
│       ├── register/               # Story 1.4
│       │   └── page.tsx
│       └── reset-password/         # NEW - This story
│           ├── page.tsx            # Step 1: Request reset
│           └── confirm/
│               └── page.tsx        # Step 2: Set new password
└── components/
    └── features/
        └── auth/
            ├── LoginForm.tsx           # Story 2.1
            ├── LoginForm.test.tsx      # Story 2.1
            ├── RegisterForm.tsx        # Story 1.4
            ├── RegisterForm.test.tsx   # Story 1.4
            ├── ResetPasswordForm.tsx   # NEW - Step 1 form
            ├── ResetPasswordForm.test.tsx  # NEW
            ├── UpdatePasswordForm.tsx  # NEW - Step 2 form
            └── UpdatePasswordForm.test.tsx # NEW
└── lib/
    └── utils/
        └── validation.ts           # ADD resetPasswordSchema, updatePasswordSchema
```

**Route Group:** `(auth)` is for PUBLIC auth routes. Reset password pages MUST be placed here per project-context.md.

### Supabase Auth Pattern (resetPasswordForEmail)

```typescript
// src/components/features/auth/ResetPasswordForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/utils/validation'

export function ResetPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  })

  async function onSubmit(data: ResetPasswordFormData) {
    setAuthError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      })

      if (error) {
        // Only show error for network/server issues
        // NOT for "email not found" (security)
        if (error.message.includes('network') || error.message.includes('fetch')) {
          setAuthError('Une erreur est survenue. Veuillez réessayer.')
          return
        }
      }

      // Always show success (security: don't reveal if email exists)
      setIsSuccess(true)
    } catch {
      setAuthError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/10 p-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">Email envoyé!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Auth Error Banner with aria-live */}
      {authError && (
        <div
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {authError}
        </div>
      )}
      {/* Form fields... */}
    </form>
  )
}
```

### Supabase Auth Pattern (updateUser)

```typescript
// src/components/features/auth/UpdatePasswordForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { updatePasswordSchema, type UpdatePasswordFormData } from '@/lib/utils/validation'

export function UpdatePasswordForm() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    mode: 'onBlur',
  })

  // Check if we have a valid session from the magic link
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsTokenValid(!!session)
    }
    checkSession()
  }, [])

  async function onSubmit(data: UpdatePasswordFormData) {
    setAuthError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        setAuthError('Impossible de mettre à jour le mot de passe. Veuillez réessayer.')
        return
      }

      // Success - sign out and redirect to login
      await supabase.auth.signOut()
      router.push('/login?message=password-reset-success')
    } catch {
      setAuthError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  if (isTokenValid === false) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
        <h2 className="text-lg font-semibold text-destructive">Lien invalide ou expiré</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ce lien de réinitialisation n'est plus valide. Veuillez en demander un nouveau.
        </p>
        <Link href="/reset-password" className="mt-4 inline-block text-sm text-primary hover:underline">
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  if (isTokenValid === null) {
    return <div className="flex justify-center"><Spinner /></div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form fields... */}
    </form>
  )
}
```

### Zod Validation Schemas (ADD to existing file)

```typescript
// src/lib/utils/validation.ts - ADD these exports

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>
```

### Form Patterns (per UX Spec)

| Element | Pattern |
|---------|---------|
| Labels | ABOVE inputs (never placeholder-only) |
| Errors | Below field, `text-destructive` |
| Validation | Inline, immediate on blur |
| Submit button | Primary green, 64px height (h-16), full width |
| Loading | Spinner in button, disabled state |
| autoComplete | email="email", password="new-password" |
| Success state | Replace form with confirmation message |

### Design System Colors (from globals.css)

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| Primary | `--primary` | Submit button, success banner |
| Destructive | `--destructive` | Error text and borders |
| Foreground | `--foreground` | Labels, input text |
| Muted Foreground | `--muted-foreground` | Placeholder, helper text, secondary text |

### Error Messages (French)

| Error | Message |
|-------|---------|
| Email required | "L'email est requis" |
| Invalid email | "Format d'email invalide" |
| Password required | "Le mot de passe est requis" |
| Password too short | "Le mot de passe doit contenir au moins 8 caractères" |
| Update failed | "Impossible de mettre à jour le mot de passe. Veuillez réessayer." |
| Generic error | "Une erreur est survenue. Veuillez réessayer." |
| Token expired | "Ce lien de réinitialisation n'est plus valide." |

**SECURITY NOTE:** NEVER reveal whether an email exists in the system. Always show the same success message after submitting reset request, regardless of whether email is registered.

### Middleware Configuration (VERIFY)

The middleware at `src/middleware.ts` should already handle:
- ✅ Allows access to /reset-password and /reset-password/confirm when not logged in
- ✅ Redirects logged-in users from /reset-password to /scan

**ACTION NEEDED:** Verify that `/reset-password` and `/reset-password/confirm` are in the public routes list:

```typescript
// src/middleware.ts - VERIFY these routes are public
const publicRoutes = ['/', '/login', '/register', '/reset-password', '/reset-password/confirm']
```

If not present, add them to the public routes.

### Previous Story Intelligence (Story 2.1 & 2.2)

**Learnings to apply:**

1. **aria-live attribute** - Error banner MUST have `aria-live="polite"` for WCAG 2.1 AA accessibility
2. **Test router calls** - Tests should verify both router.push() and router.refresh() are called where applicable
3. **react-hook-form pattern** - Use `useForm` with `zodResolver`, `mode: 'onBlur'`
4. **Form state** - Use `isSubmitting` from formState, not custom `isLoading`
5. **Error display** - Use `text-destructive` class, not hardcoded colors
6. **Button height** - Use `h-16` class for 64px height per UX spec
7. **Success state** - Replace form with success message (don't navigate away immediately)

**Code Review Issues from previous stories to apply here:**
- Issue #1: Error banner must have `aria-live="polite"` for accessibility
- Issue #2: Use `role="alert"` on error banners
- Issue #3: Tests must verify router interactions

### Login Page Success Message

After password reset, user redirects to `/login?message=password-reset-success`. The LoginForm should display a success message when this query param is present:

```typescript
// In LoginForm, add this handling
const searchParams = useSearchParams()
const successMessage = searchParams.get('message') === 'password-reset-success'
  ? 'Mot de passe mis à jour! Connectez-vous avec votre nouveau mot de passe.'
  : null

// Display success message in UI if present
{successMessage && (
  <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
    {successMessage}
  </div>
)}
```

### Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `src/app/(auth)/reset-password/page.tsx` | CREATE | Server Component wrapper for step 1 |
| `src/app/(auth)/reset-password/confirm/page.tsx` | CREATE | Server Component wrapper for step 2 |
| `src/components/features/auth/ResetPasswordForm.tsx` | CREATE | Client Component for step 1 |
| `src/components/features/auth/ResetPasswordForm.test.tsx` | CREATE | Tests for step 1 |
| `src/components/features/auth/UpdatePasswordForm.tsx` | CREATE | Client Component for step 2 |
| `src/components/features/auth/UpdatePasswordForm.test.tsx` | CREATE | Tests for step 2 |
| `src/lib/utils/validation.ts` | MODIFY | Add resetPasswordSchema, updatePasswordSchema |
| `src/lib/utils/validation.test.ts` | MODIFY | Add tests for new schemas |
| `src/middleware.ts` | VERIFY | Ensure /reset-password routes are public |
| `src/components/features/auth/LoginForm.tsx` | MODIFY | Add success message for ?message=password-reset-success |
| `src/components/features/auth/LoginForm.test.tsx` | MODIFY | Add test for success message display |

### Testing Approach

**Unit Tests Required for ResetPasswordForm:**
1. Form renders correctly with email field
2. Validation shows error for empty email
3. Validation shows error for invalid email format
4. Submit button shows loading state during submission
5. Shows success message after submission (regardless of email existence)
6. Error message displays on network error only

**Unit Tests Required for UpdatePasswordForm:**
1. Form renders correctly with password field
2. Validation shows error for empty password
3. Validation shows error for short password (< 8 chars)
4. Submit button shows loading state during submission
5. Shows error for invalid/expired token
6. Redirects to /login on successful password update
7. Calls signOut after successful update

**Test Mocks:**
```typescript
// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
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
  useSearchParams: vi.fn(() => ({
    get: vi.fn(),
  })),
}))
```

### Git Intelligence (Recent Commits)

| Commit | Relevant Insight |
|--------|------------------|
| `1f1706f` | Story 2.2 - accessibility improvements (aria-live), test patterns |
| `a900c92` | Story 2.1 - auth form pattern with react-hook-form |
| `a68f5e0` | Story 1.4 - form validation with Zod |
| `a0f879d` | Story 1.2 - Supabase client utilities, middleware patterns |

### Forbidden Patterns (NEVER DO)

- Call Supabase from Server Components for auth mutations
- Use useEffect for form submission
- Store password in state longer than necessary
- Skip validation before API call
- Use placeholder-only labels
- Create files outside defined structure
- Reveal if email exists (always show same success message)
- Clear email on error (preserve for correction)
- Use hardcoded colors (use design tokens)
- Use `isLoading` useState (use formState.isSubmitting)
- Navigate away immediately on reset request (show success message first)
- Skip aria-live on error banners

### Project Structure Notes

- All auth routes are in `(auth)` route group for public access
- Client Components have 'use client' directive
- Co-locate tests with components (`ComponentName.test.tsx`)
- Shared validation schemas in `src/lib/utils/validation.ts`

### References

- [Source: epics.md#Story-2.3] - Acceptance criteria for password reset
- [Source: architecture.md#Authentication-Security] - JWT 30 days, Supabase Auth
- [Source: ux-design-specification.md#Form-Patterns] - Labels above, errors below, 64px buttons
- [Source: project-context.md#React-Next-Rules] - Route groups, Client Components
- [Source: project-context.md#Naming-Conventions] - File naming conventions
- [Source: Story 2.1 Dev Notes] - Form patterns, accessibility improvements
- [Source: Story 2.2 Dev Notes] - Accessibility fixes applied
- [Source: Supabase Docs] - resetPasswordForEmail(), updateUser() methods

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 111 tests passing after implementation
- Production build successful with all routes generated

### Completion Notes List

**Task 1:** Created reset password request page at `/reset-password` with Server Component wrapper. Updated middleware to include reset-password routes in public auth routes.

**Task 2:** Implemented ResetPasswordForm with email input, "Réinitialiser le mot de passe" button (h-16, 64px), link back to login, and success state that replaces form with confirmation message.

**Task 3:** Added `resetPasswordSchema` and `updatePasswordSchema` to validation.ts with French error messages. Integrated with react-hook-form using zodResolver and mode: 'onBlur'.

**Task 4:** Integrated Supabase `resetPasswordForEmail()` with redirectTo pointing to `/reset-password/confirm`. Security: always shows success message regardless of email existence. Only network errors display error message.

**Task 5:** Created password update confirmation page at `/reset-password/confirm`. Implemented session validation using `getSession()` to detect valid/expired tokens.

**Task 6:** Implemented UpdatePasswordForm with password input, requirements hint ("Au moins 8 caractères"), loading state, and invalid token error state with link to request new reset.

**Task 7:** Integrated Supabase `updateUser()` for password update. On success: calls `signOut()` then redirects to `/login?message=password-reset-success`.

**Task 8:** Verified existing "Mot de passe oublié?" link in LoginForm. Added `useSearchParams()` hook to display success message when `?message=password-reset-success` is present. Wrapped LoginForm in Suspense boundary to support useSearchParams in static generation.

**Task 9:** Created comprehensive test suites:
- ResetPasswordForm.test.tsx: 13 tests covering form rendering, validation, submission, success/error states
- UpdatePasswordForm.test.tsx: 16 tests covering form rendering, validation, session checking, submission, router interactions
- validation.test.ts: 7 new tests for resetPasswordSchema and updatePasswordSchema
- LoginForm.test.tsx: 2 new tests for success message display

### File List

**Created:**
- src/app/(auth)/reset-password/page.tsx
- src/app/(auth)/reset-password/confirm/page.tsx
- src/components/features/auth/ResetPasswordForm.tsx
- src/components/features/auth/ResetPasswordForm.test.tsx
- src/components/features/auth/UpdatePasswordForm.tsx
- src/components/features/auth/UpdatePasswordForm.test.tsx

**Modified:**
- src/middleware.ts (added /reset-password routes to public auth routes)
- src/lib/utils/validation.ts (added resetPasswordSchema, updatePasswordSchema)
- src/lib/utils/validation.test.ts (added tests for new schemas)
- src/components/features/auth/LoginForm.tsx (added useSearchParams, success message display)
- src/components/features/auth/LoginForm.test.tsx (added tests for success message, mock for useSearchParams)
- src/app/(auth)/login/page.tsx (wrapped LoginForm in Suspense boundary)

## Code Review Record

### Review Date
2026-01-16

### Reviewer
Claude Opus 4.5 (Adversarial Code Review)

### Review Summary
All 8 Acceptance Criteria validated and passing. Found 4 issues (all low severity), applied fixes for 3:

### Issues Found & Fixed
1. **Issue #1 (Accessibility)** - FIXED: Added `role="status"` and `aria-live="polite"` to success message in ResetPasswordForm
2. **Issue #2 (Test Coverage)** - FIXED: Added rate limit error test to ResetPasswordForm.test.tsx
3. **Issue #3 (Code Duplication)** - FIXED: Extracted Spinner component to `src/components/ui/spinner.tsx`, updated all 4 auth forms (Login, Register, ResetPassword, UpdatePassword)
4. **Issue #4 (Code Style)** - FIXED: Replaced HTML entities with UTF-8 characters for consistency

### Review Outcome
**APPROVED** - All fixes applied, 112 tests passing, production build successful.

### Files Modified During Review
- `src/components/ui/spinner.tsx` (CREATED)
- `src/components/features/auth/ResetPasswordForm.tsx` (accessibility + spinner + UTF-8)
- `src/components/features/auth/ResetPasswordForm.test.tsx` (rate limit test)
- `src/components/features/auth/UpdatePasswordForm.tsx` (spinner + UTF-8)
- `src/components/features/auth/LoginForm.tsx` (spinner)
- `src/components/features/auth/RegisterForm.tsx` (spinner)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-16 | Story created with comprehensive developer context | Claude Opus 4.5 |
| 2026-01-16 | Implemented complete password reset flow with tests (111 tests passing) | Claude Opus 4.5 |
| 2026-01-16 | Code review completed, 4 issues fixed, 112 tests passing | Claude Opus 4.5 |
