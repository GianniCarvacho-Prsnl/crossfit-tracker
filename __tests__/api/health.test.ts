import { GET } from '@/app/api/health/route'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Mock the Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      data
    }))
  }
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockNextResponse = NextResponse.json as jest.MockedFunction<typeof NextResponse.json>

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: {
      status: 'connected' | 'failed' | 'error'
      responseTime?: number
      error?: string
    }
    environment: {
      nodeEnv: string
      nextVersion: string
      supabaseConfigured: boolean
    }
    system: {
      memoryUsage: NodeJS.MemoryUsage
      platform: string
      nodeVersion: string
    }
  }
}

// Store original env
const originalEnv = process.env

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset environment variables
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      NODE_ENV: 'test',
      npm_package_version: '1.0.0'
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
    process.env = originalEnv
  })

  describe('when database is healthy', () => {
    it('should return healthy status with all checks passing', async () => {
      // Mock successful database query
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          data: [{ id: 1 }],
          error: null
        })
      }
      
      mockCreateClient.mockReturnValue(mockSupabase as any)

      const response = await GET()

      expect(mockNextResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          timestamp: expect.any(String),
          version: '1.0.0',
          uptime: expect.any(Number),
          checks: expect.objectContaining({
            database: expect.objectContaining({
              status: 'connected',
              responseTime: expect.any(Number)
            }),
            environment: expect.objectContaining({
              nodeEnv: 'test',
              supabaseConfigured: true
            }),
            system: expect.objectContaining({
              memoryUsage: expect.any(Object),
              platform: expect.any(String),
              nodeVersion: expect.any(String)
            })
          })
        }),
        { status: 200 }
      )
    })

    it('should include system metrics in response', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          data: [{ id: 1 }],
          error: null
        })
      }
      
      mockCreateClient.mockReturnValue(mockSupabase as any)

      await GET()

      const callArgs = mockNextResponse.mock.calls[0][0] as HealthCheckResponse
      
      expect(callArgs.checks.system).toEqual({
        memoryUsage: expect.objectContaining({
          rss: expect.any(Number),
          heapTotal: expect.any(Number),
          heapUsed: expect.any(Number),
          external: expect.any(Number)
        }),
        platform: process.platform,
        nodeVersion: process.version
      })
    })
  })

  describe('when database connection fails', () => {
    it('should return unhealthy status with database error', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          data: null,
          error: { message: 'Connection failed' }
        })
      }
      
      mockCreateClient.mockReturnValue(mockSupabase as any)

      await GET()

      expect(mockNextResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          checks: expect.objectContaining({
            database: expect.objectContaining({
              status: 'failed',
              error: 'Connection failed',
              responseTime: expect.any(Number)
            })
          })
        }),
        { status: 503 }
      )
    })

    it('should handle database query exceptions', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockImplementation(() => {
          throw new Error('Network error')
        })
      }
      
      mockCreateClient.mockReturnValue(mockSupabase as any)

      await GET()

      expect(mockNextResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          checks: expect.objectContaining({
            database: expect.objectContaining({
              status: 'error',
              error: 'Network error'
            })
          })
        }),
        { status: 503 }
      )
    })
  })

  describe('when environment is misconfigured', () => {
    it('should return degraded status when Supabase is not configured', async () => {
      // Remove environment variables
      process.env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined
      }

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          data: [{ id: 1 }],
          error: null
        })
      }
      
      mockCreateClient.mockReturnValue(mockSupabase as any)

      await GET()

      expect(mockNextResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'degraded',
          checks: expect.objectContaining({
            environment: expect.objectContaining({
              supabaseConfigured: false
            })
          })
        }),
        { status: 200 }
      )
    })

    it('should handle missing environment variables gracefully', async () => {
      process.env = {
        ...process.env,
        NODE_ENV: undefined,
        npm_package_version: undefined
      }

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          data: [{ id: 1 }],
          error: null
        })
      }
      
      mockCreateClient.mockReturnValue(mockSupabase as any)

      await GET()

      const callArgs = mockNextResponse.mock.calls[0][0] as HealthCheckResponse
      
      expect(callArgs.version).toBe('1.0.0')
      expect(callArgs.checks.environment.nodeEnv).toBe('unknown')
    })
  })

  describe('when unexpected errors occur', () => {
    it('should handle createClient throwing an error', async () => {
      mockCreateClient.mockImplementation(() => {
        throw new Error('Supabase initialization failed')
      })

      await GET()

      expect(mockNextResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          checks: expect.objectContaining({
            database: expect.objectContaining({
              status: 'error',
              error: 'Supabase initialization failed'
            })
          })
        }),
        { status: 503 }
      )
    })

    it('should handle non-Error exceptions', async () => {
      mockCreateClient.mockImplementation(() => {
        throw 'String error'
      })

      await GET()

      expect(mockNextResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          checks: expect.objectContaining({
            database: expect.objectContaining({
              status: 'error',
              error: 'Unknown error'
            })
          })
        }),
        { status: 503 }
      )
    })
  })

  describe('response format validation', () => {
    it('should include all required fields in healthy response', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          data: [{ id: 1 }],
          error: null
        })
      }
      
      mockCreateClient.mockReturnValue(mockSupabase as any)

      await GET()

      const callArgs = mockNextResponse.mock.calls[0][0] as HealthCheckResponse
      
      // Validate response structure
      expect(callArgs).toHaveProperty('status')
      expect(callArgs).toHaveProperty('timestamp')
      expect(callArgs).toHaveProperty('version')
      expect(callArgs).toHaveProperty('uptime')
      expect(callArgs).toHaveProperty('checks')
      
      // Validate checks structure
      expect(callArgs.checks).toHaveProperty('database')
      expect(callArgs.checks).toHaveProperty('environment')
      expect(callArgs.checks).toHaveProperty('system')
      
      // Validate database check
      expect(callArgs.checks.database).toHaveProperty('status')
      expect(callArgs.checks.database).toHaveProperty('responseTime')
      
      // Validate environment check
      expect(callArgs.checks.environment).toHaveProperty('nodeEnv')
      expect(callArgs.checks.environment).toHaveProperty('nextVersion')
      expect(callArgs.checks.environment).toHaveProperty('supabaseConfigured')
      
      // Validate system check
      expect(callArgs.checks.system).toHaveProperty('memoryUsage')
      expect(callArgs.checks.system).toHaveProperty('platform')
      expect(callArgs.checks.system).toHaveProperty('nodeVersion')
    })

    it('should have valid timestamp format', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          data: [{ id: 1 }],
          error: null
        })
      }
      
      mockCreateClient.mockReturnValue(mockSupabase as any)

      await GET()

      const callArgs = mockNextResponse.mock.calls[0][0] as HealthCheckResponse
      const timestamp = new Date(callArgs.timestamp)
      
      expect(timestamp).toBeInstanceOf(Date)
      expect(timestamp.getTime()).not.toBeNaN()
    })

    it('should measure database response time accurately', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockImplementation(async () => {
          // Simulate some delay
          await new Promise(resolve => setTimeout(resolve, 10))
          return { data: [{ id: 1 }], error: null }
        })
      }
      
      mockCreateClient.mockReturnValue(mockSupabase as any)

      await GET()

      const callArgs = mockNextResponse.mock.calls[0][0] as HealthCheckResponse
      
      expect(callArgs.checks.database.responseTime).toBeGreaterThan(0)
      expect(callArgs.checks.database.responseTime).toBeLessThan(1000) // Should be reasonable
    })
  })
})