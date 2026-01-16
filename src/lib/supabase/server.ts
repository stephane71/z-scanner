import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * This client handles cookie-based authentication for server-side rendering.
 *
 * IMPORTANT: This is an async function because Next.js 15+ requires awaiting cookies().
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { createClient } from '@/lib/supabase/server'
 *
 * async function MyServerComponent() {
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   // Use supabase client...
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In an API Route Handler
 * import { createClient } from '@/lib/supabase/server'
 *
 * export async function GET() {
 *   const supabase = await createClient()
 *   // Use supabase client...
 * }
 * ```
 *
 * @throws {Error} If environment variables are not configured
 */
export async function createClient() {
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

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
  })
}

/** Type of the Supabase client returned by createClient() */
export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
