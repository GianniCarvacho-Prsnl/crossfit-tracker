/**
 * Settings-specific error handling utilities
 * Provides validation, error classification, and retry logic for settings forms
 */

import React from 'react'
import { 
  AppError, 
  ErrorType, 
  classifyError 
} from './errorHandling'

/**
 * Settings validation errors
 */
export interface ValidationError {
  field: string
  message: string
  type: 'required' | 'format' | 'range' | 'custom'
}

/**
 * Settings form validation results
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: string[]
}

/**
 * Profile validation functions
 */
export const profileValidation = {
  displayName: (value: string): ValidationError | null => {
    if (!value?.trim()) {
      return { field: 'displayName', message: 'El nombre de usuario es requerido', type: 'required' }
    }
    if (value.length < 2) {
      return { field: 'displayName', message: 'El nombre debe tener al menos 2 caracteres', type: 'format' }
    }
    if (value.length > 50) {
      return { field: 'displayName', message: 'El nombre no puede exceder 50 caracteres', type: 'format' }
    }
    if (!/^[a-zA-Z0-9\s\u00C0-\u017F]+$/.test(value)) {
      return { field: 'displayName', message: 'El nombre solo puede contener letras, números y espacios', type: 'format' }
    }
    return null
  },

  profilePhoto: (file: File): ValidationError | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { field: 'profilePhoto', message: 'Formato de imagen no válido. Use JPG, PNG o WebP', type: 'format' }
    }
    if (file.size > maxSize) {
      return { field: 'profilePhoto', message: 'La imagen es demasiado grande. Máximo 5MB', type: 'range' }
    }
    return null
  }
}

/**
 * Personal data validation functions
 */
export const personalDataValidation = {
  weight: (value: string, isMetric: boolean): ValidationError | null => {
    if (!value?.trim()) return null // Optional field

    const num = parseFloat(value)
    if (isNaN(num)) {
      return { field: 'weight', message: 'El peso debe ser un número válido', type: 'format' }
    }
    if (num <= 0) {
      return { field: 'weight', message: 'El peso debe ser mayor que 0', type: 'range' }
    }

    if (isMetric) {
      if (num < 20 || num > 300) {
        return { field: 'weight', message: 'El peso debe estar entre 20 y 300 kg', type: 'range' }
      }
    } else {
      if (num < 44 || num > 660) {
        return { field: 'weight', message: 'El peso debe estar entre 44 y 660 lbs', type: 'range' }
      }
    }
    return null
  },

  height: (value: string | { feet: string, inches: string }, isMetric: boolean): ValidationError | null => {
    if (isMetric) {
      const heightValue = value as string
      if (!heightValue?.trim()) return null // Optional field

      const num = parseFloat(heightValue)
      if (isNaN(num)) {
        return { field: 'height', message: 'La estatura debe ser un número válido', type: 'format' }
      }
      if (num <= 0) {
        return { field: 'height', message: 'La estatura debe ser mayor que 0', type: 'range' }
      }
      if (num < 100 || num > 250) {
        return { field: 'height', message: 'La estatura debe estar entre 100 y 250 cm', type: 'range' }
      }
    } else {
      const { feet, inches } = value as { feet: string, inches: string }
      if (!feet?.trim() && !inches?.trim()) return null // Optional field

      const feetNum = parseInt(feet) || 0
      const inchesNum = parseFloat(inches) || 0

      if (feetNum < 0 || inchesNum < 0) {
        return { field: 'height', message: 'Los valores de estatura no pueden ser negativos', type: 'range' }
      }
      if (inchesNum >= 12) {
        return { field: 'height', message: 'Las pulgadas deben ser menores que 12', type: 'range' }
      }
      if (feetNum < 3 || feetNum > 8) {
        return { field: 'height', message: 'Los pies deben estar entre 3 y 8', type: 'range' }
      }
    }
    return null
  },

  birthDate: (value: string): ValidationError | null => {
    if (!value?.trim()) return null // Optional field

    const date = new Date(value)
    const today = new Date()
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())

    if (isNaN(date.getTime())) {
      return { field: 'birthDate', message: 'Fecha de nacimiento no válida', type: 'format' }
    }
    if (date < minDate) {
      return { field: 'birthDate', message: 'Fecha de nacimiento demasiado antigua', type: 'range' }
    }
    if (date > maxDate) {
      return { field: 'birthDate', message: 'Debe tener al menos 13 años', type: 'range' }
    }
    return null
  }
}

/**
 * Security validation functions
 */
export const securityValidation = {
  password: (password: string): ValidationError[] => {
    const errors: ValidationError[] = []
    
    if (!password) {
      errors.push({ field: 'password', message: 'La contraseña es requerida', type: 'required' })
      return errors
    }

    if (password.length < 6) {
      errors.push({ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres', type: 'format' })
    }

    return errors
  },

  passwordConfirmation: (password: string, confirmation: string): ValidationError | null => {
    if (!confirmation) {
      return { field: 'passwordConfirmation', message: 'La confirmación de contraseña es requerida', type: 'required' }
    }
    if (password !== confirmation) {
      return { field: 'passwordConfirmation', message: 'Las contraseñas no coinciden', type: 'custom' }
    }
    return null
  }
}

/**
 * Training validation functions
 */
export const trainingValidation = {
  exerciseGoal: (value: string, exerciseName: string): ValidationError | null => {
    if (!value?.trim()) return null // Optional field

    const num = parseFloat(value)
    if (isNaN(num)) {
      return { field: 'exerciseGoal', message: `La meta para ${exerciseName} debe ser un número válido`, type: 'format' }
    }
    if (num <= 0) {
      return { field: 'exerciseGoal', message: `La meta para ${exerciseName} debe ser mayor que 0`, type: 'range' }
    }
    if (num > 1000) {
      return { field: 'exerciseGoal', message: `La meta para ${exerciseName} parece demasiado alta (máximo 1000 lbs)`, type: 'range' }
    }
    return null
  },

  targetDate: (value: string): ValidationError | null => {
    if (!value?.trim()) return null // Optional field

    const date = new Date(value)
    const today = new Date()
    const maxDate = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate())

    if (isNaN(date.getTime())) {
      return { field: 'targetDate', message: 'Fecha objetivo no válida', type: 'format' }
    }
    if (date <= today) {
      return { field: 'targetDate', message: 'La fecha objetivo debe ser en el futuro', type: 'range' }
    }
    if (date > maxDate) {
      return { field: 'targetDate', message: 'La fecha objetivo no puede ser más de 5 años en el futuro', type: 'range' }
    }
    return null
  }
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
export const SETTINGS_RETRY_CONFIG: Record<string, any> = {
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
 * Settings error handler hook
 */
export function useSettingsErrorHandler(context: string) {
  const [error, setError] = React.useState<AppError | null>(null)
  const [isRetrying, setIsRetrying] = React.useState(false)

  const handleError = (err: any) => {
    const classified = classifyError(err)
    const settingsError = createSettingsError(
      classified.userMessage,
      classified.type,
      classified.originalError,
      classified.retryable
    )
    setError(settingsError)
  }

  const retry = async (operation: () => Promise<any>) => {
    if (!error?.retryable) return

    setIsRetrying(true)
    try {
      // Simple retry without complex backoff for now
      await operation()
      setError(null)
    } catch (err) {
      handleError(err)
    } finally {
      setIsRetrying(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    error,
    isRetrying,
    handleError,
    retry,
    clearError
  }
}

