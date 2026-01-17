import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock @supabase/ssr
const mockGetUser = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

describe('Middleware', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  // Helper to create NextRequest mock
  function createMockRequest(pathname: string): NextRequest {
    const url = new URL(pathname, 'http://localhost:3000')
    const request = new NextRequest(url)
    return request
  }

  describe('Environment Variable Validation', () => {
    it('should continue without redirect when SUPABASE_URL is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const { middleware } = await import('./middleware')
      const request = createMockRequest('/scan')
      const response = await middleware(request)

      // Should return next() without redirect when env vars missing
      expect(response.status).toBe(200)
    })

    it('should continue without redirect when SUPABASE_ANON_KEY is missing', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const { middleware } = await import('./middleware')
      const request = createMockRequest('/scan')
      const response = await middleware(request)

      // Should return next() without redirect when env vars missing
      expect(response.status).toBe(200)
    })
  })

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      // Mock unauthenticated user
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    })

    it('should redirect to /login when accessing /scan', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/scan')
      const response = await middleware(request)

      expect(response.status).toBe(307) // Redirect status
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('should redirect to /login when accessing /tickets', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/tickets')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('should redirect to /login when accessing /export', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/export')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('should redirect to /login when accessing /settings', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/settings')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('should allow access to landing page (/)', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/')
      const response = await middleware(request)

      // Should not redirect (status 200)
      expect(response.status).toBe(200)
    })

    it('should allow access to /login', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/login')
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })

    it('should allow access to /register', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/register')
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })

    it('should allow access to /reset-password', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/reset-password')
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })

    it('should allow access to /reset-password/confirm', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/reset-password/confirm')
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Authenticated User', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
        error: null,
      })
    })

    it('should redirect to /scan when accessing /login', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/login')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/scan')
    })

    it('should redirect to /scan when accessing /register', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/register')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/scan')
    })

    it('should redirect to /scan when accessing /reset-password', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/reset-password')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/scan')
    })

    it('should redirect to /scan when accessing /reset-password/confirm', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/reset-password/confirm')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/scan')
    })

    it('should NOT redirect when accessing landing page (/)', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/')
      const response = await middleware(request)

      // Authenticated users CAN access landing page
      expect(response.status).toBe(200)
    })

    it('should allow access to /scan', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/scan')
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })

    it('should allow access to /tickets', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/tickets')
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })

    it('should allow access to /export', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/export')
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })

    it('should allow access to /settings', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/settings')
      const response = await middleware(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Nested Protected Routes', () => {
    beforeEach(() => {
      // Mock unauthenticated user
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    })

    it('should redirect to /login when accessing /scan/details', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/scan/details')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('should redirect to /login when accessing /tickets/123', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/tickets/123')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('should redirect to /login when accessing /settings/profile', async () => {
      const { middleware } = await import('./middleware')
      const request = createMockRequest('/settings/profile')
      const response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })
  })

  describe('Matcher Configuration', () => {
    it('should export config with correct matcher pattern', async () => {
      const { config } = await import('./middleware')

      expect(config).toBeDefined()
      expect(config.matcher).toBeDefined()
      expect(Array.isArray(config.matcher)).toBe(true)
      expect(config.matcher).toHaveLength(1)

      // Verify matcher excludes static assets
      const matcher = config.matcher[0]
      expect(matcher).toContain('_next/static')
      expect(matcher).toContain('_next/image')
      expect(matcher).toContain('favicon.ico')
      expect(matcher).toContain('manifest.json')
      expect(matcher).toContain('sw.js')
    })
  })

  describe('getUser Security', () => {
    it('should call getUser() for JWT validation', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      const { middleware } = await import('./middleware')
      const request = createMockRequest('/scan')
      await middleware(request)

      expect(mockGetUser).toHaveBeenCalled()
    })

    it('should handle getUser() errors gracefully', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      })

      const { middleware } = await import('./middleware')
      const request = createMockRequest('/scan')
      const response = await middleware(request)

      // Should redirect to login when there's an auth error
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })
  })
})
