import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in Client Components.
 * This client runs in the browser and handles authentication state automatically.
 *
 * **IMPORTANT: Auth Operations Only**
 * Per project architecture (project-context.md), this client should ONLY be used
 * for authentication operations (login, logout, session management).
 * All data operations (CRUD on tickets, etc.) MUST go through API Routes.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * function LoginButton() {
 *   const supabase = createClient()
 *
 *   const handleLogin = async () => {
 *     // Auth operations are allowed
 *     await supabase.auth.signInWithPassword({ email, password })
 *   }
 * }
 * ```
 *
 * @throws {Error} If environment variables are not configured
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Please check your .env.local file.'
    )
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
      'Please check your .env.local file.'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/** Type of the Supabase client returned by createClient() */
export type SupabaseBrowserClient = ReturnType<typeof createClient>
