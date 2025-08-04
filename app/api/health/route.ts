import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

interface HealthCheck {
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

export async function GET() {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  
  try {
    // Initialize health check response
    const healthCheck: HealthCheck = {
      status: 'healthy',
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'connected'
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'unknown',
          nextVersion: process.env.npm_package_dependencies_next || 'unknown',
          supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        },
        system: {
          memoryUsage: process.memoryUsage(),
          platform: process.platform,
          nodeVersion: process.version
        }
      }
    }

    // Test Supabase connectivity
    const supabase = createClient()
    const dbStartTime = Date.now()
    
    try {
      // Test database connectivity with a simple query
      const { data, error } = await supabase
        .from('exercises')
        .select('id')
        .limit(1)

      const dbResponseTime = Date.now() - dbStartTime

      if (error) {
        healthCheck.checks.database = {
          status: 'failed',
          responseTime: dbResponseTime,
          error: error.message
        }
        healthCheck.status = 'unhealthy'
      } else {
        healthCheck.checks.database = {
          status: 'connected',
          responseTime: dbResponseTime
        }
      }
    } catch (dbError) {
      const dbResponseTime = Date.now() - dbStartTime
      healthCheck.checks.database = {
        status: 'error',
        responseTime: dbResponseTime,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }
      healthCheck.status = 'unhealthy'
    }

    // Check if environment is properly configured
    if (!healthCheck.checks.environment.supabaseConfigured) {
      healthCheck.status = 'degraded'
    }

    // Determine HTTP status code
    const httpStatus = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503

    return NextResponse.json(healthCheck, { status: httpStatus })

  } catch (error) {
    const errorResponse: HealthCheck = {
      status: 'unhealthy',
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'unknown',
          nextVersion: process.env.npm_package_dependencies_next || 'unknown',
          supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        },
        system: {
          memoryUsage: process.memoryUsage(),
          platform: process.platform,
          nodeVersion: process.version
        }
      }
    }

    return NextResponse.json(errorResponse, { status: 503 })
  }
}