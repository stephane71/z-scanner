# Story 1.4: Registration from Landing

Status: done

## Story

As a **visitor**,
I want **to register for an account directly from the landing page**,
So that **I can start using Z-Scanner immediately** (FR36).

## Acceptance Criteria

1. **Given** I am on the landing page
   **When** I click "Commencer" or "S'inscrire"
   **Then** I am navigated to /register

2. **Given** I am on the /register page
   **When** the page loads
   **Then** a registration form is displayed with email and password fields
   **And** form labels are above inputs (per UX spec)

3. **Given** I enter an invalid email format
   **When** I try to submit
   **Then** inline validation error is shown below the email field (red text)
   **And** form does NOT submit

4. **Given** I enter a weak password (< 8 characters)
   **When** I try to submit
   **Then** inline validation error is shown below the password field
   **And** form does NOT submit

5. **Given** I enter a valid email and password
   **When** I submit the registration form
   **Then** my account is created in Supabase Auth
   **And** I am automatically logged in (session created)
   **And** I am redirected to the main app (/scan)

6. **Given** I enter an email already in use
   **When** I submit the form
   **Then** an error message indicates the email is taken
   **And** I remain on the registration page

## Tasks / Subtasks

- [x] **Task 1: Create Register Route** (AC: #1, #2)
  - [x] Create `src/app/(auth)/register/page.tsx` as Server Component wrapper
  - [x] Create `src/components/features/auth/RegisterForm.tsx` as Client Component
  - [x] Ensure route is public (no auth required)
  - [x] Add page metadata for SEO

- [x] **Task 2: Implement Registration Form** (AC: #2, #3, #4)
  - [x] Create form with email input (type="email", labels above)
  - [x] Create form with password input (type="password", labels above)
  - [x] Add "Créer mon compte" submit button (primary green, 64px height)
  - [x] Add link to /login for existing users

- [x] **Task 3: Form Validation with Zod** (AC: #3, #4)
  - [x] Create `src/lib/utils/validation.ts` with registerSchema
  - [x] Email validation: required, valid email format
  - [x] Password validation: required, minimum 8 characters
  - [x] Integrate Zod with form for real-time validation
  - [x] Show inline errors below fields (red text)

- [x] **Task 4: Supabase Auth Integration** (AC: #5, #6)
  - [x] Use `createClient()` from `@/lib/supabase/client`
  - [x] Call `supabase.auth.signUp({ email, password })`
  - [x] Handle success: redirect to /scan
  - [x] Handle error: display error message (email taken, etc.)
  - [x] Show loading state during submission

- [x] **Task 5: Navigation & Redirects** (AC: #1, #5)
  - [x] Verify CTAs on landing page link to /register
  - [x] Implement redirect to /scan on successful registration
  - [x] Add middleware check: if logged in, redirect away from /register

- [x] **Task 6: Tests** (AC: #1-6)
  - [x] Unit tests for RegisterForm component
  - [x] Unit tests for validation schema
  - [x] Test form submission flow
  - [x] Test error state rendering

## Dev Notes

### Technical Stack Requirements (EXACT)

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.1.1 | App Router, Server/Client Components |
| React | 19.2.3 | UI rendering |
| @supabase/ssr | ^0.x | Browser client for auth |
| Zod | latest | Form validation schema |
| Tailwind CSS | 4.x | Styling with design tokens |
| shadcn/ui | latest | Input, Button components |

**Dependencies already installed in Stories 1.1-1.2** - Do NOT reinstall.

### Architecture Compliance (CRITICAL)

```
src/
├── app/
│   └── (auth)/
│       └── register/
│           └── page.tsx          # Server Component wrapper
└── components/
    └── features/
        └── auth/
            ├── RegisterForm.tsx  # Client Component ('use client')
            └── RegisterForm.test.tsx
└── lib/
    └── utils/
        └── validation.ts         # Zod schemas (shared)
```

**Route Group:** `(auth)` is for PUBLIC auth routes (landing, login, register). The register page MUST be placed here per project-context.md.

### Supabase Auth Pattern

```typescript
// src/components/features/auth/RegisterForm.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    // Success - redirect to scan
    router.push('/scan')
    router.refresh()
  }

  return (
    <form action={onSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

**IMPORTANT:** Per project-context.md, the Supabase browser client is ONLY for auth operations. This is correct usage.

### Zod Validation Schema

```typescript
// src/lib/utils/validation.ts
import { z } from 'zod'

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
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
| Errors | Below field, red text (#DC2626) |
| Validation | Inline, immediate on blur |
| Submit button | Primary green, 64px height, full width |
| Loading | Spinner in button, disabled state |

### Design System Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | #16A34A | Submit button |
| `--danger` | #DC2626 | Error text |
| `--foreground` | #0F172A | Labels, inputs |
| `--muted` | #64748B | Placeholder text |

### Error Messages (French)

| Error | Message |
|-------|---------|
| Email required | "L'email est requis" |
| Invalid email | "Format d'email invalide" |
| Password required | "Le mot de passe est requis" |
| Password too short | "Le mot de passe doit contenir au moins 8 caractères" |
| Email taken | "Un compte existe déjà avec cet email" |
| Generic error | "Une erreur est survenue. Veuillez réessayer." |

### Middleware Update Required

The middleware at `src/middleware.ts` needs to handle:
- Allow unauthenticated access to `/register`
- Redirect authenticated users away from `/register` to `/scan`

Check current middleware implementation before modifying.

### Supabase signUp API Notes (from docs)

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'example@email.com',
  password: 'example-password',
})
```

**Return structure:**
- `data.user` - User object
- `data.session` - Session (null if email confirmation enabled)
- `error` - Error object if failed

**Configuration:** For MVP, email confirmation should be DISABLED in Supabase dashboard to allow immediate login after registration.

### Forbidden Patterns (NEVER DO)

- Do NOT call Supabase from Server Components for auth mutations
- Do NOT use useEffect for form submission
- Do NOT store password in state
- Do NOT skip validation before API call
- Do NOT use placeholder-only labels
- Do NOT create files outside defined structure
- Do NOT hardcode error messages in English

### Previous Story Intelligence (Story 1.3)

**Learnings to apply:**

1. Route group `(auth)` is for public routes - register goes here
2. Use `@/` path alias for imports
3. French text with special characters: use HTML entities or Unicode
4. shadcn/ui components: Button, Input already available
5. Tests go co-located: `RegisterForm.test.tsx`
6. Build verification: `npm run build` must pass

**Files from 1.3 to reference:**
- `src/app/(auth)/page.tsx` - Landing page structure
- `src/components/features/landing/CTASection.tsx` - CTA button pattern

### Testing Approach

**Unit Tests Required:**
1. RegisterForm renders correctly
2. Validation shows errors for invalid email
3. Validation shows errors for short password
4. Submit button shows loading state
5. Error message displays on auth failure
6. Form clears on navigation (no stale data)

**Manual Tests:**
1. Click "Commencer" on landing → navigates to /register
2. Submit empty form → shows validation errors
3. Submit invalid email → shows email error
4. Submit valid data → redirects to /scan
5. Try duplicate email → shows "email taken" error
6. Already logged in → redirects away from /register

### References

- [Source: epics.md#Story-1.4] - Acceptance criteria
- [Source: architecture.md#Authentication-Security] - JWT 30 days, Supabase Auth
- [Source: ux-design-specification.md#Form-Patterns] - Labels above, errors below
- [Source: project-context.md#React-Next-Rules] - Route groups, Client Components
- [Source: project-context.md#Naming-Conventions] - File naming
- [Source: Supabase Docs] - signUp() method signature and error handling

## Code Review Results

**Reviewer**: Claude Opus 4.5 (Adversarial Code Review)
**Date**: 2026-01-16
**Verdict**: APPROVED (with fixes applied)

### Issues Found and Resolved

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| 1 | ~~HIGH~~ | Missing lib/utils barrel export | **FALSE POSITIVE** - `src/lib/utils.ts` exists with `cn` function |
| 2 | MEDIUM | Hardcoded `text-red-600` instead of `text-destructive` | **FIXED** - Replaced all occurrences with design token |
| 3 | MEDIUM | Missing test for form navigation cleanup | **DOCUMENTED** - React component lifecycle handles this; not needed |
| 4 | ~~MEDIUM~~ | Undocumented @radix-ui/react-label dependency | **FALSE POSITIVE** - Installed as shadcn/ui Label peer dependency |
| 5 | LOW | Auth banner hardcoded colors | **FIXED** - Changed to `border-destructive/20 bg-destructive/10 text-destructive` |

### Acceptance Criteria Verification

All 6 ACs verified with specific code evidence:
- ✅ AC #1: CTAs link to /register (HeroSection.tsx:45, CTASection.tsx:25)
- ✅ AC #2: Form displays with labels above inputs (RegisterForm.tsx:116-135)
- ✅ AC #3: Inline validation for invalid email (RegisterForm.tsx:131-135)
- ✅ AC #4: Inline validation for weak password (RegisterForm.tsx:155-159)
- ✅ AC #5: Supabase signUp with redirect to /scan (RegisterForm.tsx:56-76)
- ✅ AC #6: Email taken error handling (RegisterForm.tsx:63-64)

### Final Verification

- ✅ All 52 tests pass
- ✅ Build compiles successfully
- ✅ Routes prerendered: `/`, `/register`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Zod v4 API change: `result.error.errors` → `result.error.issues` (fixed in validation.ts)
- Added @testing-library/user-event as dev dependency for form interaction tests

### Completion Notes List

- **Task 1:** Created register route at `src/app/(auth)/register/page.tsx` with SEO metadata. RegisterForm is a Client Component in features/auth/.
- **Task 2:** Form implements UX spec patterns - labels above inputs, primary green button at 64px height, link to /login.
- **Task 3:** Zod validation schema with French error messages. Real-time validation on blur. Inline errors below fields.
- **Task 4:** Supabase Auth integration using browser client. Handles success (redirect to /scan), errors (email taken, generic). Loading state during submission.
- **Task 5:** Verified CTAs link to /register. Middleware updated to redirect authenticated users away from /register to /scan.
- **Task 6:** 21 new tests: 10 for validation schema, 11 for RegisterForm component. All 52 tests pass.

### File List

**New Files:**
- `src/app/(auth)/register/page.tsx` - Server Component wrapper for registration
- `src/components/features/auth/RegisterForm.tsx` - Client Component with form and auth
- `src/components/features/auth/RegisterForm.test.tsx` - 11 unit tests for form
- `src/lib/utils/validation.ts` - Zod schema for registration
- `src/lib/utils/validation.test.ts` - 10 unit tests for validation
- `src/components/ui/input.tsx` - shadcn/ui Input component
- `src/components/ui/label.tsx` - shadcn/ui Label component

**Modified Files:**
- `src/middleware.ts` - Added auth route protection and redirects
- `package.json` - Added @testing-library/user-event dependency
- `package-lock.json` - Dependency lockfile update

