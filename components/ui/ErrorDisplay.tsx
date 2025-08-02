'use client'

import React from 'react'
import { AppError, ErrorType, classifyError } from '@/utils/errorHandling'

interface ErrorDisplayProps {
  error: string | Error | AppError | null
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  variant?: 'inline' | 'card' | 'banner'
  showRetry?: boolean
}

/**
 * Reusable error display component with different variants and retry functionality
 */
export default function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className = '',
  variant = 'card',
  showRetry = true
}: ErrorDisplayProps) {
  if (!error) return null

  // Convert error to AppError format
  const appError: AppError = typeof error === 'string' 
    ? {
        type: ErrorType.UNKNOWN,
        message: error,
        retryable: true,
        userMessage: error
      }
    : error instanceof Error
    ? classifyError(error)
    : error

  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return '🌐'
      case ErrorType.AUTHENTICATION:
        return '🔒'
      case ErrorType.VALIDATION:
        return '⚠️'
      case ErrorType.DATABASE:
        return '💾'
      default:
        return '❌'
    }
  }

  const getErrorColor = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return 'orange'
      case ErrorType.AUTHENTICATION:
        return 'red'
      case ErrorType.VALIDATION:
        return 'yellow'
      case ErrorType.DATABASE:
        return 'purple'
      default:
        return 'red'
    }
  }

  const color = getErrorColor(appError.type)
  const icon = getErrorIcon(appError.type)

  const baseClasses = {
    inline: `inline-flex items-center gap-2 text-${color}-600 text-sm`,
    card: `bg-${color}-50 border border-${color}-200 rounded-lg p-4`,
    banner: `bg-${color}-100 border-l-4 border-${color}-500 p-4`
  }

  const textClasses = {
    inline: '',
    card: `text-${color}-800`,
    banner: `text-${color}-800`
  }

  if (variant === 'inline') {
    return (
      <div className={`${baseClasses[variant]} ${className}`}>
        <span className="text-lg">{icon}</span>
        <span>{appError.userMessage}</span>
        {showRetry && appError.retryable && onRetry && (
          <button
            onClick={onRetry}
            className={`ml-2 text-${color}-700 hover:text-${color}-900 underline text-sm`}
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      <div className="flex items-start">
        <div className={`text-${color}-400 mr-3 text-xl flex-shrink-0`}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${textClasses[variant]} mb-1`}>
            {getErrorTitle(appError.type)}
          </h3>
          
          <p className={`text-sm ${textClasses[variant]} opacity-90`}>
            {appError.userMessage}
          </p>

          {/* Action buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {showRetry && appError.retryable && onRetry && (
              <button
                onClick={onRetry}
                className={`bg-${color}-100 hover:bg-${color}-200 text-${color}-800 px-3 py-1 rounded text-sm font-medium transition-colors`}
                data-testid="retry-button"
              >
                Reintentar
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors`}
              >
                Cerrar
              </button>
            )}
          </div>
        </div>

        {/* Dismiss button (X) */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`text-${color}-400 hover:text-${color}-600 ml-2 flex-shrink-0`}
            aria-label="Cerrar error"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case ErrorType.NETWORK:
      return 'Error de conexión'
    case ErrorType.AUTHENTICATION:
      return 'Error de autenticación'
    case ErrorType.VALIDATION:
      return 'Error de validación'
    case ErrorType.DATABASE:
      return 'Error de base de datos'
    default:
      return 'Error'
  }
}

/**
 * Toast-style error notification
 */
export function ErrorToast({
  error,
  onDismiss,
  autoHide = true,
  duration = 5000
}: {
  error: string | Error | AppError
  onDismiss: () => void
  autoHide?: boolean
  duration?: number
}) {
  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(onDismiss, duration)
      return () => clearTimeout(timer)
    }
  }, [autoHide, duration, onDismiss])

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0">
      <ErrorDisplay
        error={error}
        onDismiss={onDismiss}
        variant="card"
        className="shadow-lg animate-slide-in-right"
        showRetry={false}
      />
    </div>
  )
}