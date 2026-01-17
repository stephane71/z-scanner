import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware to refresh Supabase auth tokens on every request.
 *
 * This middleware:
 * 1. Creates a Supabase client with cookie handling
 * 2. Calls getUser() to refresh the JWT token if needed
 * 3. Passes the refreshed token to Server Components via cookies
 *
 * SECURITY: Always use getUser() instead of getSession() for server-side auth.
 * getUser() validates the JWT against Supabase servers, while getSession()
 * only reads from cookies without validation.
 *
 * OFFLINE GRACE PERIOD (Epic 3 Integration):
 * TODO: Implement 7-day offline grace period per architecture requirements.
 * When JWT expires while offline:
 * 1. Check navigator.onLine status (client-side via service worker)
 * 2. If offline AND JWT expired:
 *    - Check last successful sync timestamp from Dexie IndexedDB
 *    - If within 7 days → allow local data access (read-only mode)
 *    - If > 7 days → force re-authentication on reconnect
 * 3. This requires Story 3.1 (Dexie database) to be implemented first.
 *
 * @see architecture.md#Authentication-Security for 30-day JWT + 7-day offline grace
 * @see Story 3.1 (local-database-schema-dexie-js) for IndexedDB implementation
 */
export async function middleware(request: NextRequest) {
  // Validate environment variables early with clear error messages
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[Middleware] Missing Supabase environment variables. ' +
      'Auth token refresh will be skipped.'
    )
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  })

  // IMPORTANT: Do NOT use getSession() - it doesn't validate the JWT.
  // Always use getUser() which validates the JWT against Supabase servers.
  // This is critical for security - getSession() can be spoofed.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public auth routes (landing, login, register, password reset)
  const isAuthRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/reset-password/')

  // Protected routes (require authentication)
  const isProtectedRoute =
    pathname.startsWith('/scan') ||
    pathname.startsWith('/tickets') ||
    pathname.startsWith('/export') ||
    pathname.startsWith('/settings')

  // If user is logged in and tries to access auth routes, redirect to /scan
  if (user && isAuthRoute && pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/scan'
    return NextResponse.redirect(url)
  }

  // If user is not logged in and tries to access protected routes, redirect to /login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public images and assets
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
