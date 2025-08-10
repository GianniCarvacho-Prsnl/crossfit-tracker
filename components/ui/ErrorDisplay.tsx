'use client'

import React from 'react'
import { AppError, ErrorType, classifyError } from '@/utils/errorHandling'

interface ErrorDisplayProps {
  error: string | Error | AppError | null
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  variant?: 'inline' | 'card' | 'banner' | 'settings'
  showRetry?: boolean
  context?: 'profile' | 'personal-data' | 'security' | 'preferences' | 'training' | 'exercises'
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
  showRetry = true,
  context
}: ErrorDisplayProps) {
  if (!error) return null

  // Convert error to AppError format
  const appError: AppError = typeof error === 'string' 
    ? new AppError(error, ErrorType.UNKNOWN)
    : error instanceof Error
    ? (() => {
        const classified = classifyError(error)
        return new AppError(classified.userMessage, classified.type, error.message)
      })()
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
    banner: `bg-${color}-100 border-l-4 border-${color}-500 p-4`,
    settings: `bg-${color}-50 border border-${color}-200 rounded-md p-3 text-sm`
  }

  const textClasses = {
    inline: '',
    card: `text-${color}-800`,
    banner: `text-${color}-800`,
    settings: `text-${color}-800`
  }

  if (variant === 'inline') {
    return (
      <div className={`${baseClasses[variant]} ${className}`}>
        <span className="text-lg">{icon}</span>
        <span>{getContextualErrorMessage(appError, context)}</span>
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

  if (variant === 'settings') {
    return (
      <div className={`${baseClasses[variant]} ${className}`}>
        <div className="flex items-start">
          <div className={`text-${color}-400 mr-2 text-lg flex-shrink-0`}>
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={`${textClasses[variant]} font-medium`}>
              {getContextualErrorMessage(appError, context)}
            </p>

            {/* Action buttons for settings */}
            <div className="mt-2 flex flex-wrap gap-2">
              {showRetry && appError.retryable && onRetry && (
                <button
                  onClick={onRetry}
                  className={`bg-${color}-100 hover:bg-${color}-200 text-${color}-800 px-2 py-1 rounded text-xs font-medium transition-colors`}
                  data-testid="retry-button"
                >
                  Reintentar
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>

          {/* Dismiss button (X) for settings */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`text-${color}-400 hover:text-${color}-600 ml-2 flex-shrink-0`}
              aria-label="Cerrar error"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
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
            {getContextualErrorMessage(appError, context)}
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

function getContextualErrorMessage(error: AppError, context?: string): string {
  const baseMessage = error.userMessage

  if (!context) return baseMessage

  // Contextual error messages for settings sections
  const contextualMessages: Record<string, Record<ErrorType, string>> = {
    'profile': {
      [ErrorType.NETWORK]: 'Error de conexión al actualizar el perfil. Verifica tu conexión e intenta nuevamente.',
      [ErrorType.VALIDATION]: 'Los datos del perfil no son válidos. Verifica el formato de la imagen y el nombre de usuario.',
      [ErrorType.STORAGE]: 'Error al subir la foto de perfil. Verifica que el archivo sea una imagen válida (JPG, PNG, WebP) y menor a 5MB.',
      [ErrorType.DATABASE]: 'Error al guardar los cambios del perfil. Intenta nuevamente en unos momentos.',
      [ErrorType.AUTHENTICATION]: 'Tu sesión ha expirado. Inicia sesión nuevamente para continuar.',
      [ErrorType.SETTINGS]: 'Error en la configuración del perfil. Intenta nuevamente.',
      [ErrorType.UNKNOWN]: 'Error inesperado al actualizar el perfil. Intenta nuevamente.'
    },
    'personal-data': {
      [ErrorType.NETWORK]: 'Error de conexión al guardar los datos personales. Verifica tu conexión e intenta nuevamente.',
      [ErrorType.VALIDATION]: 'Los datos ingresados no son válidos. Verifica los rangos de peso y estatura.',
      [ErrorType.DATABASE]: 'Error al guardar los datos personales. Intenta nuevamente en unos momentos.',
      [ErrorType.AUTHENTICATION]: 'Tu sesión ha expirado. Inicia sesión nuevamente para continuar.',
      [ErrorType.STORAGE]: 'Error al procesar los datos personales. Intenta nuevamente.',
      [ErrorType.SETTINGS]: 'Error en la configuración de datos personales. Intenta nuevamente.',
      [ErrorType.UNKNOWN]: 'Error inesperado al guardar los datos personales. Intenta nuevamente.'
    },
    'security': {
      [ErrorType.NETWORK]: 'Error de conexión al actualizar la configuración de seguridad. Verifica tu conexión e intenta nuevamente.',
      [ErrorType.AUTHENTICATION]: 'Error de autenticación. Verifica tu contraseña actual e intenta nuevamente.',
      [ErrorType.VALIDATION]: 'La nueva contraseña no cumple con los requisitos de seguridad.',
      [ErrorType.DATABASE]: 'Error al actualizar la configuración de seguridad. Intenta nuevamente en unos momentos.',
      [ErrorType.STORAGE]: 'Error al procesar los datos de seguridad. Intenta nuevamente.',
      [ErrorType.SETTINGS]: 'Error en la configuración de seguridad. Intenta nuevamente.',
      [ErrorType.UNKNOWN]: 'Error inesperado en la configuración de seguridad. Intenta nuevamente.'
    },
    'preferences': {
      [ErrorType.NETWORK]: 'Error de conexión al guardar las preferencias. Verifica tu conexión e intenta nuevamente.',
      [ErrorType.DATABASE]: 'Error al guardar las preferencias de la aplicación. Intenta nuevamente en unos momentos.',
      [ErrorType.VALIDATION]: 'Las preferencias seleccionadas no son válidas.',
      [ErrorType.AUTHENTICATION]: 'Tu sesión ha expirado. Inicia sesión nuevamente para continuar.',
      [ErrorType.STORAGE]: 'Error al procesar las preferencias. Intenta nuevamente.',
      [ErrorType.SETTINGS]: 'Error en la configuración de preferencias. Intenta nuevamente.',
      [ErrorType.UNKNOWN]: 'Error inesperado al guardar las preferencias. Intenta nuevamente.'
    },
    'training': {
      [ErrorType.NETWORK]: 'Error de conexión al guardar la configuración de entrenamiento. Verifica tu conexión e intenta nuevamente.',
      [ErrorType.VALIDATION]: 'Las metas de entrenamiento ingresadas no son válidas. Verifica los valores numéricos.',
      [ErrorType.DATABASE]: 'Error al guardar la configuración de entrenamiento. Intenta nuevamente en unos momentos.',
      [ErrorType.AUTHENTICATION]: 'Tu sesión ha expirado. Inicia sesión nuevamente para continuar.',
      [ErrorType.STORAGE]: 'Error al procesar la configuración de entrenamiento. Intenta nuevamente.',
      [ErrorType.SETTINGS]: 'Error en la configuración de entrenamiento. Intenta nuevamente.',
      [ErrorType.UNKNOWN]: 'Error inesperado al guardar la configuración de entrenamiento. Intenta nuevamente.'
    },
    'exercises': {
      [ErrorType.NETWORK]: 'Error de conexión al gestionar ejercicios. Verifica tu conexión e intenta nuevamente.',
      [ErrorType.VALIDATION]: 'Los datos del ejercicio no son válidos. Verifica el nombre y la descripción.',
      [ErrorType.DATABASE]: 'Error al guardar los cambios en los ejercicios. Intenta nuevamente en unos momentos.',
      [ErrorType.AUTHENTICATION]: 'Tu sesión ha expirado. Inicia sesión nuevamente para continuar.',
      [ErrorType.STORAGE]: 'Error al procesar los datos del ejercicio. Intenta nuevamente.',
      [ErrorType.SETTINGS]: 'Error en la configuración de ejercicios. Intenta nuevamente.',
      [ErrorType.UNKNOWN]: 'Error inesperado al gestionar ejercicios. Intenta nuevamente.'
    }
  }

  return contextualMessages[context]?.[error.type] || baseMessage
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