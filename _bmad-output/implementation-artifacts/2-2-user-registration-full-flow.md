# Story 2.2: User Registration (Full Flow)

Status: done

## Story

As a **new user**,
I want **to create an account with email and password**,
So that **I can start using Z-Scanner** (FR1).

## Acceptance Criteria

1. **Given** I am on the /register page
   **When** the page loads
   **Then** a registration form is displayed with email and password fields
   **And** form labels are above inputs (per UX spec)
   **And** a link to /login is visible for existing users

2. **Given** I enter a valid email and password (min 8 chars)
   **When** I submit the form
   **Then** my account is created in Supabase Auth
   **And** I am automatically logged in
   **And** I am redirected to /scan

3. **Given** I enter an email already in use
   **When** I submit the form
   **Then** an error message indicates the email is taken
   **And** form is NOT cleared (email preserved for correction)

4. **Given** I enter an invalid email format
   **When** I try to submit
   **Then** inline validation error is shown below the email field
   **And** form does NOT submit to API

5. **Given** I enter a weak password (less than 8 chars)
   **When** I try to submit
   **Then** inline validation error is shown below the password field
   **And** form does NOT submit to API

6. **Given** I am already logged in
   **When** I navigate to /register
   **Then** I am automatically redirected to /scan
   **And** the registration form is never displayed

## Tasks / Subtasks

- [x] **Task 1: Review & Validate Existing RegisterForm** (AC: #1, #6)
  - [x] Verify `src/app/(auth)/register/page.tsx` exists and follows patterns
  - [x] Verify `src/components/features/auth/RegisterForm.tsx` meets all AC
  - [x] Confirm middleware redirects logged-in users away
  - [x] Verify page metadata for SEO (robots noindex recommended)

- [x] **Task 2: Verify Form Implementation** (AC: #1)
  - [x] Confirm email input with labels above (per UX spec)
  - [x] Confirm password input with labels above
  - [x] Confirm "Créer mon compte" button is primary green, 64px height (h-16)
  - [x] Confirm link to /login for existing users
  - [x] Verify autoComplete attributes: email="email", password="new-password"

- [x] **Task 3: Verify Validation with Zod** (AC: #4, #5)
  - [x] Verify `registerSchema` in `src/lib/utils/validation.ts`
  - [x] Confirm email validation: required, valid format
  - [x] Confirm password validation: required, min 8 characters
  - [x] Verify inline errors display below fields with `text-destructive`

- [x] **Task 4: Verify Supabase Auth Integration** (AC: #2, #3)
  - [x] Verify `signUp()` call with email and password
  - [x] Verify success redirect to /scan
  - [x] Verify "already registered" error handling with French message
  - [x] Verify loading state during submission
  - [x] Verify email preserved on error (form not cleared)

- [x] **Task 5: Add aria-live to Error Banner** (AC: #3)
  - [x] Add `aria-live="polite"` to auth error banner for accessibility
  - [x] This was identified as a pattern improvement from Story 2.1 code review

- [x] **Task 6: Verify Tests** (AC: #1-6)
  - [x] Verify `RegisterForm.test.tsx` covers all acceptance criteria
  - [x] Add any missing test cases
  - [x] Verify tests for router.refresh() call (pattern from Story 2.1)
  - [x] Run all tests and confirm passing

## Dev Notes

### Story Context (CRITICAL)

**THIS IS A VALIDATION STORY:** Story 1.4 already implemented the RegisterForm. This story validates that implementation meets all acceptance criteria in Epic 2 and applies lessons learned from Story 2.1 code review.

**Key Actions:**
1. Verify existing implementation meets all AC
2. Apply accessibility improvements from Story 2.1 (aria-live)
3. Ensure test coverage is comprehensive
4. Fix any gaps found

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
│       ├── login/              # Story 2.1
│       │   └── page.tsx
│       └── register/           # Story 1.4 (this story validates)
│           └── page.tsx
└── components/
    └── features/
        └── auth/
            ├── LoginForm.tsx       # Story 2.1
            ├── LoginForm.test.tsx  # Story 2.1
            ├── RegisterForm.tsx    # Story 1.4 (validate & enhance)
            └── RegisterForm.test.tsx  # Story 1.4 (verify coverage)
└── lib/
    └── utils/
        └── validation.ts       # registerSchema (verify)
```

**Route Group:** `(auth)` is for PUBLIC auth routes. Register page is already here per project-context.md.

### Supabase Auth Pattern (signUp)

The existing implementation should follow this pattern:

```typescript
// src/components/features/auth/RegisterForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterFormData } from '@/lib/utils/validation'

export function RegisterForm() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  async function onSubmit(data: RegisterFormData) {
    setAuthError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (error) {
        // Map Supabase errors to French messages
        if (error.message.toLowerCase().includes('already registered')) {
          setAuthError('Un compte existe déjà avec cet email')
        } else {
          setAuthError('Une erreur est survenue. Veuillez réessayer.')
        }
        return
      }

      // Success - redirect to scan
      router.push('/scan')
      router.refresh()
    } catch {
      setAuthError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Auth Error Banner - MUST have aria-live */}
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

**IMPORTANT:** Per project-context.md, the Supabase browser client is ONLY for auth operations. This is correct usage.

### Zod Validation Schema (VERIFY exists)

```typescript
// src/lib/utils/validation.ts - VERIFY these exports

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

### Design System Colors (from globals.css)

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| Primary | `--primary` | Submit button background |
| Destructive | `--destructive` | Error text and borders |
| Foreground | `--foreground` | Labels, input text |
| Muted Foreground | `--muted-foreground` | Placeholder, helper text |

### Error Messages (French)

| Error | Message |
|-------|---------|
| Email required | "L'email est requis" |
| Invalid email | "Format d'email invalide" |
| Password required | "Le mot de passe est requis" |
| Password too short | "Le mot de passe doit contenir au moins 8 caractères" |
| Email taken | "Un compte existe déjà avec cet email" |
| Generic error | "Une erreur est survenue. Veuillez réessayer." |

### Middleware Already Configured

The middleware at `src/middleware.ts` already handles:
- Redirects logged-in users from /register to /scan
- Redirects non-logged users from protected routes to /login
- Validates JWT with getUser() not getSession()

**No middleware changes required** for this story.

### Previous Story Intelligence (Story 2.1)

**Learnings to apply:**

1. **aria-live attribute** - Error banner needs `aria-live="polite"` for screen reader accessibility
2. **Test router.refresh()** - Tests should verify both router.push() and router.refresh() are called
3. **react-hook-form pattern** - Use `useForm` with `zodResolver`, `mode: 'onBlur'`
4. **Form state** - Use `isSubmitting` from formState, not custom `isLoading`
5. **Error display** - Use `text-destructive` class, not hardcoded colors
6. **Button height** - Use `h-16` class for 64px height per UX spec

**Code Review Issues from Story 2.1 to apply here:**
- Issue #1: Error banner must have `aria-live="polite"` for WCAG 2.1 AA compliance
- Issue #2: Tests must verify `router.refresh()` is called after redirect

### Files to Verify/Modify

| File | Action | Notes |
|------|--------|-------|
| `src/components/features/auth/RegisterForm.tsx` | Verify & enhance | Add aria-live if missing |
| `src/components/features/auth/RegisterForm.test.tsx` | Verify & enhance | Add router.refresh test if missing |
| `src/lib/utils/validation.ts` | Verify | registerSchema should exist |
| `src/lib/utils/validation.test.ts` | Verify | Tests for registerSchema |
| `src/app/(auth)/register/page.tsx` | Verify | Should exist from Story 1.4 |

### Testing Approach

**Verification Tests Required:**
1. RegisterForm renders correctly with all fields
2. Validation shows error for empty email
3. Validation shows error for invalid email format
4. Validation shows error for empty password
5. Validation shows error for short password (< 8 chars)
6. Submit button shows loading state during submission
7. Error message displays on auth failure (email taken)
8. Form preserves email value on error (doesn't clear)
9. Calls signUp with correct data
10. Redirects to /scan on success
11. Calls router.refresh() after redirect

**Test Mocks:**
```typescript
// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
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
```

### Git Intelligence (Recent Commits)

| Commit | Relevant Insight |
|--------|------------------|
| `a900c92` | Story 2.1 login - pattern for auth forms with react-hook-form |
| `a68f5e0` | Story 1.4 registration - original implementation |
| `baddcef` | Vitest setup for component testing |
| `a0f879d` | Supabase client utilities and middleware |

### Forbidden Patterns (NEVER DO)

- Call Supabase from Server Components for auth mutations
- Use useEffect for form submission
- Store password in state
- Skip validation before API call
- Use placeholder-only labels
- Create files outside defined structure
- Clear form on error
- Use hardcoded colors (use design tokens)
- Use `isLoading` useState (use formState.isSubmitting)

### References

- [Source: epics.md#Story-2.2] - Acceptance criteria
- [Source: architecture.md#Authentication-Security] - JWT 30 days, Supabase Auth
- [Source: ux-design-specification.md#Form-Patterns] - Labels above, errors below
- [Source: project-context.md#React-Next-Rules] - Route groups, Client Components
- [Source: project-context.md#Naming-Conventions] - File naming
- [Source: Story 1.4 Implementation] - Original RegisterForm
- [Source: Story 2.1 Dev Notes] - Form patterns, accessibility improvements
- [Source: Supabase Docs] - signUp() method signature

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- No issues encountered during validation
- Existing implementation from Story 1.4 was solid

### Completion Notes List

- **Task 1:** Verified register page exists at `src/app/(auth)/register/page.tsx` with proper Server Component wrapper, metadata, and route group placement. Middleware correctly redirects authenticated users from /register to /scan (line 73-77).
- **Task 2:** Form implementation verified - labels above inputs, h-16 button height, link to /login, correct autoComplete attributes (email="email", password="new-password").
- **Task 3:** Zod validation schema verified at `src/lib/utils/validation.ts` - registerSchema has min 8 chars for password with French error messages.
- **Task 4:** Supabase integration verified - signUp() call correct, redirect to /scan on success, French error message for "already registered", loading state with isSubmitting, form not cleared on error.
- **Task 5:** **FIX APPLIED:** Added `aria-live="polite"` to error banner for WCAG 2.1 AA accessibility compliance (learnings from Story 2.1 code review).
- **Task 6:** **FIX APPLIED:** Added test assertion for `router.refresh()` call after successful registration (pattern from Story 2.1 code review). All 73 tests pass. Build succeeds.

### File List

**Modified Files:**
- `src/components/features/auth/RegisterForm.tsx` - Added aria-live="polite" to error banner
- `src/components/features/auth/RegisterForm.test.tsx` - Added test assertion for router.refresh() call

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-16 | Story created with comprehensive developer context | Claude Opus 4.5 |
| 2026-01-16 | Validated existing implementation, applied accessibility fix (aria-live), added test for router.refresh() | Claude Opus 4.5 |
| 2026-01-16 | Code review approved - added 4 tests: form preservation, network error, aria-live, aria-invalid (133 tests) | Claude Opus 4.5 |
