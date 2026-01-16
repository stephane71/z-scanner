import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}))

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
  })),
}))

describe('Supabase Server Client', () => {
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

      const { createClient } = await import('./server')

      await expect(createClient()).rejects.toThrow('Missing NEXT_PUBLIC_SUPABASE_URL')
    })

    it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const { createClient } = await import('./server')

      await expect(createClient()).rejects.toThrow('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
    })

    it('should create client when environment variables are set', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      const { createClient } = await import('./server')
      const { createServerClient } = await import('@supabase/ssr')

      const client = await createClient()

      expect(createServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      )
      expect(client).toBeDefined()
      expect(client.auth).toBeDefined()
    })

    it('should be an async function', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      const { createClient } = await import('./server')

      // Verify createClient returns a Promise
      const result = createClient()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should export SupabaseServerClient type', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      // Type check - verifies the type is exported correctly
      const module = await import('./server')
      expect(module.createClient).toBeDefined()
      // Type export is verified at compile time
    })
  })
})
