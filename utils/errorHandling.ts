/**
 * Comprehensive error handling utilities for the CrossFit Tracker app
 * Provides user-friendly error messages, retry logic, and error classification
 */

export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  DATABASE = 'database',
  UNKNOWN = 'unknown'
}

export interface AppError {
  type: ErrorType
  message: string
  originalError?: Error
  retryable: boolean
  userMessage: string
}

/**
 * Classify errors based on their characteristics
 */
export function classifyError(error: any): AppError {
  // Network errors
  if (error?.message?.includes('fetch') || 
      error?.message?.includes('network') ||
      error?.code === 'NETWORK_ERROR' ||
      !navigator.onLine) {
    return {
      type: ErrorType.NETWORK,
      message: error.message || 'Network error',
      originalError: error,
      retryable: true,
      userMessage: 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.'
    }
  }

  // Authentication errors
  if (error?.message?.includes('auth') ||
      error?.message?.includes('unauthorized') ||
      error?.message?.includes('token') ||
      error?.status === 401) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: error.message || 'Authentication error',
      originalError: error,
      retryable: false,
      userMessage: 'Error de autenticación. Por favor, inicia sesión nuevamente.'
    }
  }

  // Database/Supabase errors
  if (error?.message?.includes('supabase') ||
      error?.message?.includes('database') ||
      error?.message?.includes('relation') ||
      error?.code?.startsWith('PGRST')) {
    return {
      type: ErrorType.DATABASE,
      message: error.message || 'Database error',
      originalError: error,
      retryable: true,
      userMessage: 'Error en la base de datos. Intenta nuevamente en unos momentos.'
    }
  }

  // Validation errors
  if (error?.message?.includes('validation') ||
      error?.message?.includes('invalid') ||
      error?.message?.includes('required')) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message || 'Validation error',
      originalError: error,
      retryable: false,
      userMessage: error.message || 'Los datos ingresados no son válidos. Verifica la información.'
    }
  }

  // Unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: error?.message || 'Unknown error',
    originalError: error,
    retryable: true,
    userMessage: 'Ha ocurrido un error inesperado. Intenta nuevamente.'
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxAttempts, baseDelay, maxDelay, backoffFactor } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config
  }

  let lastError: any
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      const appError = classifyError(error)
      
      // Don't retry non-retryable errors
      if (!appError.retryable) {
        throw error
      }
      
      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        break
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      )
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Error logging utility
 */
export function logError(error: AppError, context?: string) {
  const logData = {
    type: error.type,
    message: error.message,
    userMessage: error.userMessage,
    retryable: error.retryable,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  console.error('App Error:', logData)

  // In production, you might want to send this to an error reporting service
  // Example: Sentry.captureException(error.originalError, { extra: logData })
}

/**
 * Network status utilities
 */
export function isOnline(): boolean {
  return navigator.onLine
}

export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve()
      return
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline)
      resolve()
    }

    window.addEventListener('online', handleOnline)
  })
}

/**
 * Error message formatting utilities
 */
export function getErrorMessage(error: any, fallback = 'Ha ocurrido un error inesperado'): string {
  if (!error) {
    return fallback
  }
  
  if (typeof error === 'string') {
    return error
  }

  const appError = classifyError(error)
  return appError.userMessage || fallback
}

/**
 * Validation error helpers
 */
export function createValidationError(field: string, message: string): AppError {
  return {
    type: ErrorType.VALIDATION,
    message: `Validation error for ${field}: ${message}`,
    retryable: false,
    userMessage: message
  }
}

/**
 * Network error helpers
 */
export function createNetworkError(originalError?: Error): AppError {
  return {
    type: ErrorType.NETWORK,
    message: originalError?.message || 'Network error',
    originalError,
    retryable: true,
    userMessage: 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.'
  }
}