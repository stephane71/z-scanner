# Story 2.1: User Login

Status: done

## Story

As a **registered user**,
I want **to log in to my account with email and password**,
So that **I can access my personal ticket data** (FR2).

## Acceptance Criteria

1. **Given** I am on the /login page
   **When** the page loads
   **Then** a login form is displayed with email and password fields
   **And** form labels are above inputs (per UX spec)
   **And** a link to /register is visible for new users
   **And** a link to /reset-password is visible for forgotten passwords

2. **Given** I enter valid email and password
   **When** I submit the form
   **Then** I am authenticated via Supabase Auth
   **And** my JWT token is stored (30 days duration per architecture)
   **And** I am redirected to /scan (direct to scanner per UX spec)
   **And** my auth state persists across page refreshes

3. **Given** I enter invalid credentials (wrong password)
   **When** I submit the form
   **Then** an error message is displayed inline (French text)
   **And** I remain on the login page
   **And** the form is NOT cleared (email preserved)

4. **Given** I enter an email not registered
   **When** I submit the form
   **Then** an error message indicates invalid credentials
   **And** the error message is generic (not revealing if email exists)

5. **Given** I enter invalid email format
   **When** I try to submit
   **Then** inline validation error is shown below the email field
   **And** form does NOT submit to API

6. **Given** I am already logged in
   **When** I navigate to /login
   **Then** I am automatically redirected to /scan
   **And** the login form is never displayed

## Tasks / Subtasks

- [x] **Task 1: Create Login Route** (AC: #1, #6)
  - [x] Create `src/app/(auth)/login/page.tsx` as Server Component wrapper
  - [x] Create `src/components/features/auth/LoginForm.tsx` as Client Component
  - [x] Ensure route is public (no auth required)
  - [x] Add page metadata for SEO
  - [x] Verify middleware redirects logged-in users away

- [x] **Task 2: Implement Login Form** (AC: #1)
  - [x] Create form with email input (type="email", labels above)
  - [x] Create form with password input (type="password", labels above)
  - [x] Add "Se connecter" submit button (primary green, 64px height)
  - [x] Add link to /register for new users
  - [x] Add link to /reset-password for forgotten password

- [x] **Task 3: Form Validation with Zod** (AC: #5)
  - [x] Create `loginSchema` in `src/lib/utils/validation.ts`
  - [x] Email validation: required, valid email format
  - [x] Password validation: required (no min length for login)
  - [x] Integrate with react-hook-form + zodResolver
  - [x] Show inline errors below fields (destructive color)

- [x] **Task 4: Supabase Auth Integration** (AC: #2, #3, #4)
  - [x] Use `createClient()` from `@/lib/supabase/client`
  - [x] Call `supabase.auth.signInWithPassword({ email, password })`
  - [x] Handle success: redirect to /scan
  - [x] Handle error: display French error message
  - [x] Show loading state during submission
  - [x] Preserve email on error (don't clear form)

- [x] **Task 5: Navigation & Redirects** (AC: #2, #6)
  - [x] Verify middleware redirects logged-in users from /login to /scan
  - [x] Implement redirect to /scan on successful login
  - [x] Test auth state persistence across page refreshes

- [x] **Task 6: Tests** (AC: #1-6)
  - [x] Unit tests for LoginForm component
  - [x] Unit tests for loginSchema validation
  - [x] Test form submission flow
  - [x] Test error state rendering
  - [x] Test loading state

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
│       ├── login/
│       │   └── page.tsx          # Server Component wrapper
│       └── register/             # Already exists from Story 1.4
│           └── page.tsx
└── components/
    └── features/
        └── auth/
            ├── LoginForm.tsx     # NEW - Client Component ('use client')
            ├── LoginForm.test.tsx # NEW - Unit tests
            └── RegisterForm.tsx  # Already exists from Story 1.4
└── lib/
    └── utils/
        └── validation.ts         # ADD loginSchema (file exists)
```

**Route Group:** `(auth)` is for PUBLIC auth routes. Login page MUST be placed here per project-context.md.

### Supabase Auth Pattern (signInWithPassword)

```typescript
// src/components/features/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/utils/validation'

export function LoginForm() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  async function onSubmit(data: LoginFormData) {
    setAuthError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        // IMPORTANT: Don't reveal if email exists
        // Use generic message for all auth errors
        setAuthError('Email ou mot de passe incorrect')
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
      {/* Form fields */}
    </form>
  )
}
```

**IMPORTANT:** Per project-context.md, the Supabase browser client is ONLY for auth operations. This is correct usage.

### Zod Validation Schema (ADD to existing file)

```typescript
// src/lib/utils/validation.ts - ADD these exports

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
  // Note: No min length for login - only check that field is not empty
})

export type LoginFormData = z.infer<typeof loginSchema>
```

### Form Patterns (per UX Spec)

| Element | Pattern |
|---------|---------|
| Labels | ABOVE inputs (never placeholder-only) |
| Errors | Below field, `text-destructive` |
| Validation | Inline, immediate on blur |
| Submit button | Primary green, 64px height (h-16), full width |
| Loading | Spinner in button, disabled state |
| autoComplete | email="email", password="current-password" |

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
| Invalid credentials | "Email ou mot de passe incorrect" |
| Generic error | "Une erreur est survenue. Veuillez réessayer." |

**SECURITY NOTE:** Never reveal whether an email exists in the system. Always use generic "invalid credentials" message for auth failures.

### Middleware Already Configured

The middleware at `src/middleware.ts` already handles:
- ✅ Redirects logged-in users from /login to /scan (line 73-77)
- ✅ Redirects non-logged users from protected routes to /login (line 79-84)
- ✅ Validates JWT with getUser() not getSession() (line 53-55)

**No middleware changes required** for this story.

### Previous Story Intelligence (Story 1.4)

**Learnings to apply:**

1. **Route group `(auth)`** - Login goes here alongside register
2. **react-hook-form pattern** - Use `useForm` with `zodResolver`, `mode: 'onBlur'`
3. **Form state** - Use `isSubmitting` from formState, not custom `isLoading`
4. **Error display** - Use `text-destructive` class, not hardcoded colors
5. **Button height** - Use `h-16` class for 64px height per UX spec
6. **Tests co-located** - `LoginForm.test.tsx` next to component
7. **Build verification** - `npm run build` must pass

**Files from Story 1.4 to reference:**
- `src/components/features/auth/RegisterForm.tsx` - Form pattern
- `src/components/features/auth/RegisterForm.test.tsx` - Test patterns
- `src/lib/utils/validation.ts` - Zod schema pattern
- `src/lib/utils/validation.test.ts` - Validation test pattern

### Code Reuse Opportunities

| Pattern | Source | Reuse in Login |
|---------|--------|----------------|
| Form structure | RegisterForm.tsx | Copy and adapt |
| Error banner | RegisterForm.tsx:73-80 | Copy exactly |
| Loading spinner | RegisterForm.tsx:136-156 | Copy exactly |
| Input styling | RegisterForm.tsx:87-102 | Copy exactly |
| Test mocks | RegisterForm.test.tsx | Adapt for login |

### Testing Approach

**Unit Tests Required:**
1. LoginForm renders correctly with all fields
2. Validation shows error for empty email
3. Validation shows error for invalid email format
4. Validation shows error for empty password
5. Submit button shows loading state during submission
6. Error message displays on auth failure
7. Form preserves email value on error (doesn't clear)
8. Calls signInWithPassword with correct data
9. Redirects to /scan on success

**Test Mocks (from RegisterForm.test.tsx):**
```typescript
// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
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
| `a68f5e0` | Story 1.4 pattern for auth forms with react-hook-form |
| `baddcef` | Vitest setup for component testing |
| `a0f879d` | Supabase client utilities and middleware |
| `c2f3ebf` | Project structure and design system |

### Forbidden Patterns (NEVER DO)

- ❌ Call Supabase from Server Components for auth mutations
- ❌ Use useEffect for form submission
- ❌ Store password in state
- ❌ Skip validation before API call
- ❌ Use placeholder-only labels
- ❌ Create files outside defined structure
- ❌ Reveal if email exists (use generic error)
- ❌ Clear email on error
- ❌ Use hardcoded colors (use design tokens)
- ❌ Use `isLoading` useState (use formState.isSubmitting)

### References

- [Source: epics.md#Story-2.1] - Acceptance criteria
- [Source: architecture.md#Authentication-Security] - JWT 30 days, Supabase Auth
- [Source: ux-design-specification.md#Form-Patterns] - Labels above, errors below
- [Source: project-context.md#React-Next-Rules] - Route groups, Client Components
- [Source: project-context.md#Naming-Conventions] - File naming
- [Source: Story 1.4 Dev Notes] - Form patterns, react-hook-form integration
- [Source: Supabase Docs] - signInWithPassword() method signature

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- No issues encountered during implementation
- Pattern from Story 1.4 RegisterForm reused successfully

### Completion Notes List

- **Task 1:** Created login route at `src/app/(auth)/login/page.tsx` with SEO metadata (robots noindex). LoginForm is a Client Component in features/auth/.
- **Task 2:** Form implements UX spec patterns - labels above inputs, primary green button at 64px height (h-16), links to /register and /reset-password.
- **Task 3:** Added `loginSchema` to validation.ts with French error messages. No min password length for login (security: don't reveal password requirements). Integrated with react-hook-form + zodResolver.
- **Task 4:** Supabase Auth integration using `signInWithPassword()`. Generic error message "Email ou mot de passe incorrect" for all auth failures (security: don't reveal if email exists). Loading state using `formState.isSubmitting`.
- **Task 5:** Verified middleware already handles redirects (logged-in users from /login to /scan). No changes needed.
- **Task 6:** 15 unit tests for LoginForm component, 6 unit tests for loginSchema. All 73 tests pass.

### File List

**New Files:**
- `src/app/(auth)/login/page.tsx` - Server Component wrapper for login
- `src/components/features/auth/LoginForm.tsx` - Client Component with form and auth
- `src/components/features/auth/LoginForm.test.tsx` - 15 unit tests for form

**Modified Files:**
- `src/lib/utils/validation.ts` - Added loginSchema and LoginFormData type
- `src/lib/utils/validation.test.ts` - Added 6 tests for loginSchema

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-16 | Initial implementation - all 6 tasks completed | Claude Opus 4.5 |
| 2026-01-16 | Code review fixes: aria-live on error banner, test for router.refresh() | Claude Opus 4.5 |
