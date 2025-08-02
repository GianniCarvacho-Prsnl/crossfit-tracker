'use client'

import React from 'react'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  inline?: boolean
}

/**
 * Reusable loading state component with spinner and optional message
 */
export default function LoadingState({ 
  message = 'Cargando...', 
  size = 'md',
  className = '',
  inline = false
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const containerClasses = inline 
    ? 'inline-flex items-center gap-2'
    : 'flex flex-col items-center justify-center py-8'

  return (
    <div className={`${containerClasses} ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="Cargando"
      />
      {message && (
        <span className={`text-gray-600 ${textSizeClasses[size]} ${inline ? '' : 'mt-2'}`}>
          {message}
        </span>
      )}
    </div>
  )
}

/**
 * Loading overlay component for full-screen loading states
 */
export function LoadingOverlay({ 
  message = 'Cargando...', 
  className = '' 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div className={`fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
        <LoadingState message={message} size="lg" />
      </div>
    </div>
  )
}

/**
 * Loading button component for form submissions
 */
export function LoadingButton({ 
  loading, 
  children, 
  loadingText = 'Cargando...', 
  className = '',
  'data-testid': dataTestId,
  ...props 
}: {
  loading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  'data-testid'?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`relative ${className}`}
      data-testid={dataTestId}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingState 
            message={loadingText} 
            size="sm" 
            inline 
            className="text-current" 
          />
        </div>
      )}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  )
}