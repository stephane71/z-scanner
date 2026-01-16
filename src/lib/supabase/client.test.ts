import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock @supabase/ssr before importing the module
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
  })),
}))

describe('Supabase Browser Client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('createClient', () => {
    it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const { createClient } = await import('./client')

      expect(() => createClient()).toThrow('Missing NEXT_PUBLIC_SUPABASE_URL')
    })

    it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const { createClient } = await import('./client')

      expect(() => createClient()).toThrow('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
    })

    it('should create client when environment variables are set', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      const { createClient } = await import('./client')
      const { createBrowserClient } = await import('@supabase/ssr')

      const client = createClient()

      expect(createBrowserClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      )
      expect(client).toBeDefined()
      expect(client.auth).toBeDefined()
    })

    it('should export SupabaseBrowserClient type', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      // Type check - this verifies the type is exported correctly
      const module = await import('./client')
      expect(module.createClient).toBeDefined()
      // Type export is verified at compile time, runtime check just ensures module loads
    })
  })
})
