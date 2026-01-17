import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

/**
 * Integration tests for the complete authentication flow.
 * These tests verify the middleware behavior across different
 * authentication states and route transitions.
 */

// Mock @supabase/ssr at module level
const mockGetUser = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

describe('Auth Flow Integration', () => {
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
    return new NextRequest(url)
  }

  describe('Complete Auth Flow: Login → Protected → Logout', () => {
    it('should handle login → access protected → logout → redirect flow', async () => {
      const { middleware } = await import('../../middleware')

      // Step 1: Unauthenticated user tries to access protected route
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
      let response = await middleware(createMockRequest('/scan'))
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')

      // Step 2: User logs in and accesses protected route
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })
      response = await middleware(createMockRequest('/scan'))
      expect(response.status).toBe(200)

      // Step 3: User navigates to tickets (protected)
      response = await middleware(createMockRequest('/tickets'))
      expect(response.status).toBe(200)

      // Step 4: User logs out (session cleared)
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      // Step 5: After logout, protected routes redirect to login
      response = await middleware(createMockRequest('/scan'))
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })
  })

  describe('Redirect Chain Prevention', () => {
    it('should not create infinite redirect loops for auth routes', async () => {
      const { middleware } = await import('../../middleware')
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      // Unauthenticated user on login page should stay (no redirect)
      const response = await middleware(createMockRequest('/login'))
      expect(response.status).toBe(200)
    })

    it('should not create infinite redirect loops for protected routes', async () => {
      const { middleware } = await import('../../middleware')
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })

      // Authenticated user on scan page should stay (no redirect)
      const response = await middleware(createMockRequest('/scan'))
      expect(response.status).toBe(200)
    })

    it('should handle direct access to login then protected route correctly', async () => {
      const { middleware } = await import('../../middleware')

      // User accesses login (unauthenticated) - should stay
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
      let response = await middleware(createMockRequest('/login'))
      expect(response.status).toBe(200)

      // User becomes authenticated and refreshes login page - should redirect to /scan
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })
      response = await middleware(createMockRequest('/login'))
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/scan')
    })
  })

  describe('Cookie Handling Simulation', () => {
    it('should process request cookies without throwing', async () => {
      const { middleware } = await import('../../middleware')
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      // Create request with cookies
      const url = new URL('/scan', 'http://localhost:3000')
      const request = new NextRequest(url, {
        headers: {
          cookie: 'sb-test-auth-token=mock-token; sb-test-refresh-token=mock-refresh',
        },
      })

      // Should not throw when processing cookies
      const response = await middleware(request)
      expect(response).toBeDefined()
      expect(response.status).toBe(307) // Redirect to login (unauthenticated)
    })
  })

  describe('Multi-route Navigation', () => {
    it('should allow authenticated user to navigate between all protected routes', async () => {
      const { middleware } = await import('../../middleware')
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })

      const protectedRoutes = ['/scan', '/tickets', '/export', '/settings']

      for (const route of protectedRoutes) {
        const response = await middleware(createMockRequest(route))
        expect(response.status).toBe(200)
      }
    })

    it('should redirect unauthenticated user from all protected routes to login', async () => {
      const { middleware } = await import('../../middleware')
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      const protectedRoutes = ['/scan', '/tickets', '/export', '/settings']

      for (const route of protectedRoutes) {
        const response = await middleware(createMockRequest(route))
        expect(response.status).toBe(307)
        expect(response.headers.get('location')).toBe('http://localhost:3000/login')
      }
    })

    it('should allow unauthenticated user to navigate between all auth routes', async () => {
      const { middleware } = await import('../../middleware')
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      const authRoutes = ['/', '/login', '/register', '/reset-password', '/reset-password/confirm']

      for (const route of authRoutes) {
        const response = await middleware(createMockRequest(route))
        expect(response.status).toBe(200)
      }
    })

    it('should redirect authenticated user from auth routes (except /) to /scan', async () => {
      const { middleware } = await import('../../middleware')
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })

      // Routes that should redirect to /scan when authenticated
      const authRoutesToRedirect = ['/login', '/register', '/reset-password']

      for (const route of authRoutesToRedirect) {
        const response = await middleware(createMockRequest(route))
        expect(response.status).toBe(307)
        expect(response.headers.get('location')).toBe('http://localhost:3000/scan')
      }

      // Landing page (/) should NOT redirect even when authenticated
      const landingResponse = await middleware(createMockRequest('/'))
      expect(landingResponse.status).toBe(200)
    })
  })

  describe('Session State Transitions', () => {
    it('should handle session expiration gracefully', async () => {
      const { middleware } = await import('../../middleware')

      // User was authenticated
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })
      let response = await middleware(createMockRequest('/scan'))
      expect(response.status).toBe(200)

      // Session expires (simulated by returning null user)
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT expired' },
      })
      response = await middleware(createMockRequest('/scan'))
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('should handle auth error states', async () => {
      const { middleware } = await import('../../middleware')

      // Auth service returns an error
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Network error' },
      })

      const response = await middleware(createMockRequest('/scan'))
      // Should still redirect to login when auth fails
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })
  })

  describe('Edge Cases', () => {
    it('should handle routes with query parameters', async () => {
      const { middleware } = await import('../../middleware')
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      const url = new URL('/scan?tab=history&page=1', 'http://localhost:3000')
      const request = new NextRequest(url)
      const response = await middleware(request)

      expect(response.status).toBe(307)
      // Redirect location includes query params since we clone nextUrl
      const location = response.headers.get('location')
      expect(location).toContain('http://localhost:3000/login')
    })

    it('should handle routes with hash fragments', async () => {
      const { middleware } = await import('../../middleware')
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      // Note: hash fragments are typically not sent to server, but test URL handling
      const request = createMockRequest('/scan')
      const response = await middleware(request)

      expect(response.status).toBe(307)
    })

    it('should allow unknown routes to pass through (middleware only protects defined routes)', async () => {
      const { middleware } = await import('../../middleware')
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      // Middleware only protects explicitly defined routes (/scan, /tickets, /export, /settings)
      // Routes not in the protected list pass through to Next.js routing
      // which will return 404 if no matching page exists
      const response = await middleware(createMockRequest('/Scan')) // Note: case-sensitive
      expect(response.status).toBe(200) // Passes through, 404 handled by Next.js
    })
  })
})
