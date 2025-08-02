'use client'

import { useEffect } from 'react'
import { 
  observePerformance, 
  preloadCriticalResources, 
  lazyLoadResources,
  monitorMemoryUsage 
} from '@/utils/performance'

/**
 * Client-side performance monitoring component
 * Should be included in the root layout for optimal monitoring
 */
export default function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    observePerformance()
    
    // Preload critical resources
    preloadCriticalResources()
    
    // Lazy load non-critical resources
    lazyLoadResources()
    
    // Monitor memory usage in development
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(monitorMemoryUsage, 10000) // Every 10 seconds
      return () => clearInterval(interval)
    }
  }, [])

  // This component doesn't render anything
  return null
}