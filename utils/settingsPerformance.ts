// Performance monitoring utilities for settings components

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  memoryUsage?: number
  frameRate?: number
}

interface AnimationPerformanceOptions {
  targetFPS?: number
  maxDuration?: number
  useGPUAcceleration?: boolean
  respectReducedMotion?: boolean
}

class SettingsPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private enabled: boolean = process.env.NODE_ENV === 'development'

  /**
   * Start measuring a performance metric
   */
  start(name: string): void {
    if (!this.enabled) return

    this.metrics.set(name, {
      name,
      startTime: performance.now()
    })
  }

  /**
   * End measuring a performance metric
   */
  end(name: string): number | null {
    if (!this.enabled) return null

    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`)
      return null
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration

    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow settings operation: ${name} took ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Measure a function execution time
   */
  measure<T>(name: string, fn: () => T): T {
    if (!this.enabled) return fn()

    this.start(name)
    try {
      const result = fn()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }

  /**
   * Measure an async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn()

    this.start(name)
    try {
      const result = await fn()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Get metrics summary
   */
  getSummary(): { total: number; average: number; slowest: PerformanceMetric | null } {
    const metrics = this.getMetrics().filter(m => m.duration !== undefined)
    
    if (metrics.length === 0) {
      return { total: 0, average: 0, slowest: null }
    }

    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    const average = total / metrics.length
    const slowest = metrics.reduce((prev, current) => 
      (current.duration || 0) > (prev.duration || 0) ? current : prev
    )

    return { total, average, slowest }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    if (!this.enabled) return

    const summary = this.getSummary()
    const metrics = this.getMetrics()

    console.group('Settings Performance Summary')
    console.log(`Total operations: ${metrics.length}`)
    console.log(`Total time: ${summary.total.toFixed(2)}ms`)
    console.log(`Average time: ${summary.average.toFixed(2)}ms`)
    
    if (summary.slowest) {
      console.log(`Slowest operation: ${summary.slowest.name} (${summary.slowest.duration?.toFixed(2)}ms)`)
    }

    // Log individual metrics
    metrics.forEach(metric => {
      if (metric.duration) {
        console.log(`${metric.name}: ${metric.duration.toFixed(2)}ms`)
      }
    })
    
    console.groupEnd()
  }
}

// Global instance
export const settingsPerformance = new SettingsPerformanceMonitor()

// React hook for component performance monitoring
export function useSettingsPerformance(componentName: string) {
  const startRender = () => settingsPerformance.start(`${componentName}-render`)
  const endRender = () => settingsPerformance.end(`${componentName}-render`)
  
  const measureUpdate = <T>(updateName: string, fn: () => T): T => {
    return settingsPerformance.measure(`${componentName}-${updateName}`, fn)
  }
  
  const measureAsyncUpdate = <T>(updateName: string, fn: () => Promise<T>): Promise<T> => {
    return settingsPerformance.measureAsync(`${componentName}-${updateName}`, fn)
  }

  return {
    startRender,
    endRender,
    measureUpdate,
    measureAsyncUpdate
  }
}

// Decorator for measuring method performance
export function measurePerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value

  descriptor.value = function (...args: any[]) {
    const className = target.constructor.name
    const methodName = `${className}.${propertyName}`
    
    return settingsPerformance.measure(methodName, () => method.apply(this, args))
  }

  return descriptor
}

// Async decorator for measuring async method performance
export function measureAsyncPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const className = target.constructor.name
    const methodName = `${className}.${propertyName}`
    
    return settingsPerformance.measureAsync(methodName, () => method.apply(this, args))
  }

  return descriptor
}

// Mobile-specific performance utilities
export class MobilePerformanceOptimizer {
  private static instance: MobilePerformanceOptimizer
  private reducedMotion: boolean = false
  private isLowEndDevice: boolean = false

  constructor() {
    this.detectDeviceCapabilities()
    this.setupReducedMotionListener()
  }

  static getInstance(): MobilePerformanceOptimizer {
    if (!MobilePerformanceOptimizer.instance) {
      MobilePerformanceOptimizer.instance = new MobilePerformanceOptimizer()
    }
    return MobilePerformanceOptimizer.instance
  }

  private detectDeviceCapabilities(): void {
    // Detect low-end devices based on available metrics
    const navigator = window.navigator as any
    const memory = navigator.deviceMemory || 4 // Default to 4GB if not available
    const cores = navigator.hardwareConcurrency || 4 // Default to 4 cores
    
    // Consider device low-end if it has less than 2GB RAM or 2 cores
    this.isLowEndDevice = memory < 2 || cores < 2
  }

  private setupReducedMotionListener(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      this.reducedMotion = mediaQuery.matches
      
      mediaQuery.addEventListener('change', (e) => {
        this.reducedMotion = e.matches
      })
    }
  }

  /**
   * Get optimized animation duration based on device capabilities
   */
  getOptimizedDuration(baseDuration: number): number {
    if (this.reducedMotion) return 0
    if (this.isLowEndDevice) return Math.min(baseDuration * 0.7, 200)
    return baseDuration
  }

  /**
   * Get optimized animation easing for mobile
   */
  getOptimizedEasing(): string {
    if (this.reducedMotion) return 'none'
    if (this.isLowEndDevice) return 'ease-out'
    return 'cubic-bezier(0.4, 0.0, 0.2, 1)' // Material Design easing
  }

  /**
   * Check if GPU acceleration should be used
   */
  shouldUseGPUAcceleration(): boolean {
    return !this.isLowEndDevice
  }

  /**
   * Get CSS properties for optimized animations
   */
  getOptimizedAnimationCSS(options: AnimationPerformanceOptions = {}): Record<string, string> {
    const {
      targetFPS = 60,
      maxDuration = 300,
      useGPUAcceleration = this.shouldUseGPUAcceleration(),
      respectReducedMotion = true
    } = options

    const duration = respectReducedMotion && this.reducedMotion 
      ? 0 
      : this.getOptimizedDuration(maxDuration)

    const css: Record<string, string> = {
      'transition-duration': `${duration}ms`,
      'transition-timing-function': this.getOptimizedEasing(),
      'transition-property': 'transform, opacity'
    }

    if (useGPUAcceleration && duration > 0) {
      css['will-change'] = 'transform'
      css['transform'] = 'translateZ(0)' // Force GPU layer
    }

    return css
  }

  /**
   * Optimize element for touch interactions
   */
  optimizeForTouch(element: HTMLElement): void {
    // Ensure minimum touch target size (44px)
    const computedStyle = window.getComputedStyle(element)
    const minSize = 44

    if (parseInt(computedStyle.height) < minSize) {
      element.style.minHeight = `${minSize}px`
    }
    if (parseInt(computedStyle.width) < minSize) {
      element.style.minWidth = `${minSize}px`
    }

    // Add touch-friendly styles
    element.style.touchAction = 'manipulation'
    element.style.userSelect = 'none'
    ;(element.style as any).webkitTapHighlightColor = 'transparent'
  }

  /**
   * Monitor frame rate during animations
   */
  monitorFrameRate(callback: (fps: number) => void): () => void {
    let frameCount = 0
    let startTime = performance.now()
    let animationId: number

    const countFrames = () => {
      frameCount++
      const currentTime = performance.now()
      const elapsed = currentTime - startTime

      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed)
        callback(fps)
        frameCount = 0
        startTime = currentTime
      }

      animationId = requestAnimationFrame(countFrames)
    }

    animationId = requestAnimationFrame(countFrames)

    // Return cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }

  /**
   * Debounce function for performance optimization
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
      const callNow = immediate && !timeout

      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(() => {
        timeout = null
        if (!immediate) func(...args)
      }, wait)

      if (callNow) func(...args)
    }
  }

  /**
   * Throttle function for performance optimization
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  /**
   * Check if device is in low power mode (iOS Safari)
   */
  isLowPowerMode(): boolean {
    // This is a heuristic - iOS Safari reduces timer precision in low power mode
    const start = performance.now()
    setTimeout(() => {}, 0)
    const precision = performance.now() - start
    return precision > 4 // Normal precision is ~1ms, low power mode is ~4ms
  }

  /**
   * Get device-appropriate animation settings
   */
  getDeviceOptimizedSettings(): {
    animationDuration: number
    useTransitions: boolean
    maxConcurrentAnimations: number
    preferGPUAcceleration: boolean
  } {
    const isLowPower = this.isLowPowerMode()
    
    return {
      animationDuration: this.reducedMotion ? 0 : (this.isLowEndDevice || isLowPower ? 150 : 250),
      useTransitions: !this.reducedMotion,
      maxConcurrentAnimations: this.isLowEndDevice ? 2 : 4,
      preferGPUAcceleration: this.shouldUseGPUAcceleration() && !isLowPower
    }
  }
}

// Export singleton instance
export const mobileOptimizer = MobilePerformanceOptimizer.getInstance()

// React hook for mobile performance optimization
export function useMobileOptimization() {
  const optimizer = MobilePerformanceOptimizer.getInstance()
  
  return {
    getOptimizedDuration: optimizer.getOptimizedDuration.bind(optimizer),
    getOptimizedEasing: optimizer.getOptimizedEasing.bind(optimizer),
    getOptimizedAnimationCSS: optimizer.getOptimizedAnimationCSS.bind(optimizer),
    optimizeForTouch: optimizer.optimizeForTouch.bind(optimizer),
    debounce: optimizer.debounce.bind(optimizer),
    throttle: optimizer.throttle.bind(optimizer),
    getDeviceOptimizedSettings: optimizer.getDeviceOptimizedSettings.bind(optimizer)
  }
}