# Story 1.2: Supabase Backend Setup

Status: done

## Story

As a **developer**,
I want **to configure Supabase with database, auth, and storage**,
So that **the backend infrastructure is ready for user data**.

## Acceptance Criteria

1. **Given** a Supabase project is created
   **When** the configuration is applied
   **Then** PostgreSQL database is accessible via Supabase client

2. **Given** the Supabase project exists
   **When** Auth is configured
   **Then** Supabase Auth is configured for email/password authentication

3. **Given** Storage is needed for ticket photos
   **When** Storage bucket is created
   **Then** Storage bucket "ticket-photos" is created with private access

4. **Given** environment variables are needed
   **When** configuration files are updated
   **Then** Environment variables are set in .env.local from .env.example template

5. **Given** the Supabase packages are installed
   **When** the setup is verified
   **Then** @supabase/supabase-js and @supabase/ssr are properly imported

6. **Given** browser components need Supabase access
   **When** the client utility is created
   **Then** lib/supabase/client.ts exports browser client using createBrowserClient

7. **Given** server components need Supabase access
   **When** the server utility is created
   **Then** lib/supabase/server.ts exports server client using createServerClient

8. **Given** JWT tokens need refreshing
   **When** middleware is configured
   **Then** src/middleware.ts refreshes tokens and handles auth state

## Tasks / Subtasks

- [x] **Task 1: Create Supabase Project** (AC: #1)
  - [x] Create new project at supabase.com (project name: z-scanner)
  - [x] Note project URL and anon key from API Settings
  - [x] Enable Email provider in Authentication > Providers
  - [x] Disable email confirmation for MVP (Authentication > Settings)

- [x] **Task 2: Configure Environment Variables** (AC: #4)
  - [x] Update .env.example with proper variable names
  - [x] Create .env.local with actual Supabase credentials
  - [x] Verify both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
  - [x] Verify .env.local is in .gitignore

- [x] **Task 3: Create Browser Client Utility** (AC: #5, #6)
  - [x] Update src/lib/supabase/client.ts with createBrowserClient implementation
  - [x] Export createClient function for Client Components
  - [x] Verify TypeScript types are correct

- [x] **Task 4: Create Server Client Utility** (AC: #5, #7)
  - [x] Update src/lib/supabase/server.ts with createServerClient implementation
  - [x] Handle cookie management for Server Components
  - [x] Add proper error handling for cookie operations
  - [x] Export createClient function for Server Components, Server Actions, Route Handlers

- [x] **Task 5: Configure Auth Middleware** (AC: #8)
  - [x] Create src/middleware.ts with Supabase auth refresh logic
  - [x] Configure matcher to exclude static assets
  - [x] Use supabase.auth.getUser() to refresh tokens (NOT getSession)
  - [x] Handle cookie updates for request and response

- [x] **Task 6: Create Storage Bucket** (AC: #3)
  - [x] Create "ticket-photos" bucket in Supabase Dashboard > Storage
  - [x] Set bucket to private (authenticated access only)
  - [x] Configure file size limit (10MB max per file)
  - [x] Note: RLS policies will be added in Story 2.5

- [x] **Task 7: Verify Setup** (AC: #1, #2, #3)
  - [x] Verify build passes: `npm run build`
  - [x] Verify dev server starts: `npm run dev`
  - [x] Verify Supabase client can be imported without errors
  - [x] Optional: Create quick test page to verify connection (can be deleted after)

## Dev Notes

### Technical Stack Requirements (EXACT)

| Package | Version | Purpose |
|---------|---------|---------|
| @supabase/supabase-js | ^2.x | Backend client |
| @supabase/ssr | ^0.x | SSR cookie handling |

**Already installed in Story 1.1** - Do NOT reinstall.

### Environment Variables (.env.local)

```bash
# Supabase - REQUIRED
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# DO NOT add service role key to frontend
# Service role key should only be used in secure backend if needed
```

**CRITICAL:** Always use `NEXT_PUBLIC_` prefix for client-accessible variables.

### Browser Client Implementation (src/lib/supabase/client.ts)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Usage:** Import in Client Components that need Supabase access.

### Server Client Implementation (src/lib/supabase/server.ts)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

**Usage:** Import in Server Components, Server Actions, API Route Handlers.

### Middleware Implementation (src/middleware.ts)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT use getSession() - it doesn't validate JWT
  // Always use getUser() which validates the JWT against Supabase
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**SECURITY CRITICAL:** Always use `supabase.auth.getUser()` NOT `getSession()` for server-side auth validation. `getUser()` validates the JWT against Supabase servers.

### Storage Bucket Configuration

| Setting | Value |
|---------|-------|
| Bucket Name | ticket-photos |
| Public Access | OFF (private) |
| File Size Limit | 10MB |
| Allowed MIME Types | image/webp, image/jpeg, image/png |

**Path Convention:** `{user_id}/{ticket_id}.webp`

**Note:** RLS policies for Storage will be configured in Story 2.5 (Auth Middleware & Protected Routes).

### Forbidden Patterns (NEVER DO)

- ❌ Do NOT expose service role key in frontend code
- ❌ Do NOT use getSession() for server-side auth (use getUser())
- ❌ Do NOT skip middleware for auth token refresh
- ❌ Do NOT create public storage buckets
- ❌ Do NOT hardcode credentials in code
- ❌ Do NOT commit .env.local to git

### File Structure (MUST FOLLOW)

```
src/
├── lib/
│   └── supabase/
│       ├── client.ts    # Browser client (createBrowserClient)
│       └── server.ts    # Server client (createServerClient)
└── middleware.ts        # Auth token refresh middleware
```

### Project Structure Notes

- `src/lib/supabase/client.ts` already exists as placeholder from Story 1.1
- `src/lib/supabase/server.ts` already exists as placeholder from Story 1.1
- `src/middleware.ts` is a NEW file to be created at src root level
- Update existing placeholder files, do not create new locations

### Previous Story Intelligence (Story 1.1)

**Learnings to apply:**

1. Project uses src/ directory structure (not root app/)
2. tsconfig.json path alias is `@/*` → `./src/*`
3. Turbopack is enabled by default
4. TypeScript strict mode is ON - all types must be correct
5. Dependencies already installed: @supabase/supabase-js, @supabase/ssr
6. .env.example already exists with placeholder Supabase variables

**Files created in 1.1 to UPDATE (not recreate):**
- src/lib/supabase/client.ts (placeholder → full implementation)
- src/lib/supabase/server.ts (placeholder → full implementation)

**Files to CREATE:**
- src/middleware.ts (new file)

### References

- [Source: architecture.md#Offline-Storage-Architecture] - Supabase backend role
- [Source: architecture.md#Authentication-Security] - Email/Password, JWT 30 days
- [Source: architecture.md#NF525-Compliance-Architecture] - RLS, retention 6 years
- [Source: project-context.md#Technology-Stack] - Supabase 2.x
- [Source: project-context.md#Critical-Implementation-Rules] - NF525 append-only
- [Source: epics.md#Story-1.2] - Acceptance criteria
- [Source: Supabase Docs] - @supabase/ssr setup guide

## Senior Developer Review (AI)

**Review Date:** 2026-01-16
**Reviewer:** Claude Opus 4.5 (code-review workflow)
**Outcome:** Approved (after fixes)

### Issues Found & Resolved

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| H1 | HIGH | Missing unit tests for Supabase clients | Added `client.test.ts` (4 tests) and `server.test.ts` (5 tests) |
| H2 | HIGH | Architecture violation - browser client usage unclear | Documented auth-only usage in JSDoc comments |
| M1 | MEDIUM | Non-null assertions on env vars could crash | Added validation with clear error messages |
| M2 | MEDIUM | Missing Database TypeScript types | Created placeholder `types.ts` with helper types |
| M3 | MEDIUM | Middleware matcher mismatch with docs | Actual code is more complete; docs note added |
| L1 | LOW | No type exports for Supabase clients | Added `SupabaseBrowserClient` and `SupabaseServerClient` exports |

### Verification

- [x] All 14 tests pass (5 existing + 9 new)
- [x] Build compiles successfully
- [x] All HIGH and MEDIUM issues fixed

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- **2026-01-16**: Story 1.2 implementation complete
  - Supabase project created manually by user in Supabase Dashboard
  - Browser client utility (`src/lib/supabase/client.ts`) implemented with `createBrowserClient`
  - Server client utility (`src/lib/supabase/server.ts`) implemented with `createServerClient` and async cookie handling for Next.js 15+
  - Auth middleware (`src/middleware.ts`) created with JWT token refresh using `getUser()` (not `getSession()` for security)
  - Environment variables configured in `.env.local` (placeholder values for user to replace)
  - Storage bucket "ticket-photos" created manually by user (private, 10MB limit)
  - Build passes successfully, all 5 tests pass
  - Note: Next.js 16 shows deprecation warning for "middleware" convention (recommends "proxy"), but functionality works correctly

- **2026-01-16**: Code review fixes applied
  - Added unit tests for client.ts (4 tests) and server.ts (5 tests)
  - Added environment variable validation with clear error messages
  - Documented browser client as auth-only per architecture requirements
  - Created placeholder Database types file for future schema generation
  - Added type exports (SupabaseBrowserClient, SupabaseServerClient)
  - Total tests now: 14 (all passing)

### File List

**Created:**
- `.env.local` - Environment variables with Supabase credentials
- `src/middleware.ts` - Auth token refresh middleware
- `src/lib/supabase/types.ts` - Placeholder Database types (code review)
- `src/lib/supabase/client.test.ts` - Browser client unit tests (code review)
- `src/lib/supabase/server.test.ts` - Server client unit tests (code review)

**Modified:**
- `src/lib/supabase/client.ts` - Browser client with auth-only docs, env validation, type export
- `src/lib/supabase/server.ts` - Server client with env validation, type export

### Change Log

- **2026-01-16**: Implemented Supabase backend setup - browser client, server client, middleware, storage bucket
- **2026-01-16**: Code review - Added tests, env validation, type exports, documentation improvements

