/**
 * Comprehensive error handling utilities for the CrossFit Tracker app
 * Provides user-friendly error messages, retry logic, and error classification
 */

export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  DATABASE = 'database',
  STORAGE = 'storage',
  SETTINGS = 'settings',
  UNKNOWN = 'unknown'
}

export interface AppErrorInterface {
  type: ErrorType
  message: string
  originalError?: Error
  retryable: boolean
  userMessage: string
}

export class AppError extends Error implements AppErrorInterface {
  public readonly type: ErrorType
  public readonly originalError?: Error
  public readonly retryable: boolean
  public readonly userMessage: string

  constructor(
    userMessage: string,
    type: ErrorType = ErrorType.UNKNOWN,
    originalError?: Error | string,
    retryable: boolean = true
  ) {
    const message = typeof originalError === 'string' ? originalError : originalError?.message || userMessage
    super(message)
    
    this.name = 'AppError'
    this.type = type
    this.userMessage = userMessage
    this.retryable = retryable
    this.originalError = originalError instanceof Error ? originalError : undefined
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

/**
 * Classify errors based on their characteristics
 */
export function classifyError(error: any): AppErrorInterface {
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

  // Storage errors
  if (error?.message?.includes('storage') ||
      error?.message?.includes('upload') ||
      error?.message?.includes('file') ||
      error?.message?.includes('bucket')) {
    return {
      type: ErrorType.STORAGE,
      message: error.message || 'Storage error',
      originalError: error,
      retryable: true,
      userMessage: 'Error al subir archivo. Intenta nuevamente.'
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
export function logError(error: AppErrorInterface, context?: string) {
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
  return new AppError(
    message,
    ErrorType.VALIDATION,
    `Validation error for ${field}: ${message}`,
    false
  )
}

/**
 * Network error helpers
 */
export function createNetworkError(originalError?: Error): AppError {
  return new AppError(
    'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.',
    ErrorType.NETWORK,
    originalError,
    true
  )
}

/**
 * Settings-specific error helpers
 */
export function createSettingsError(
  message: string, 
  type: ErrorType = ErrorType.SETTINGS,
  originalError?: Error,
  retryable: boolean = true
): AppError {
  return new AppError(message, type, originalError, retryable)
}

/**
 * Settings-specific retry configurations
 */
export const SETTINGS_RETRY_CONFIG: Record<string, Partial<RetryConfig>> = {
  profile: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 1.5
  },
  'personal-data': {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 1.5
  },
  security: {
    maxAttempts: 2, // Less retries for security operations
    baseDelay: 2000,
    maxDelay: 8000,
    backoffFactor: 2
  },
  preferences: {
    maxAttempts: 5, // More retries for preferences (less critical)
    baseDelay: 500,
    maxDelay: 3000,
    backoffFactor: 1.2
  },
  training: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 1.5
  },
  exercises: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 1.5
  }
}

/**
 * Settings-specific retry function
 */
export async function retrySettingsOperation<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  const config = SETTINGS_RETRY_CONFIG[context] || {}
  return retryWithBackoff(fn, config)
}