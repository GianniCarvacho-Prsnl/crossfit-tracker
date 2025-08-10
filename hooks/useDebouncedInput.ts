import { useState, useEffect, useCallback, useRef } from 'react'

interface UseDebouncedInputOptions {
  delay?: number
  validateOnChange?: boolean
  validator?: (value: string) => string | null
}

interface UseDebouncedInputReturn {
  value: string
  debouncedValue: string
  setValue: (value: string) => void
  error: string | null
  isValidating: boolean
  hasChanged: boolean
}

export function useDebouncedInput(
  initialValue: string = '',
  options: UseDebouncedInputOptions = {}
): UseDebouncedInputReturn {
  const {
    delay = 300,
    validateOnChange = false,
    validator
  } = options

  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const validationTimeoutRef = useRef<NodeJS.Timeout>()

  // Debounce the value
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  // Handle validation
  useEffect(() => {
    if (!validateOnChange || !validator || value === initialValue) {
      return
    }

    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }

    setIsValidating(true)

    validationTimeoutRef.current = setTimeout(() => {
      const validationError = validator(value)
      setError(validationError)
      setIsValidating(false)
    }, delay)

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [value, validator, validateOnChange, delay, initialValue])

  // Track if value has changed from initial
  useEffect(() => {
    setHasChanged(value !== initialValue)
  }, [value, initialValue])

  // Update internal value when initialValue changes (e.g., after successful update)
  useEffect(() => {
    setValue(initialValue)
    setDebouncedValue(initialValue)
    setError(null)
    setHasChanged(false)
  }, [initialValue])

  const handleSetValue = useCallback((newValue: string) => {
    setValue(newValue)
    
    // Clear error when user starts typing
    if (error && newValue !== value) {
      setError(null)
    }
  }, [value, error])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [])

  return {
    value,
    debouncedValue,
    setValue: handleSetValue,
    error,
    isValidating,
    hasChanged
  }
}

// Specialized hook for settings forms
export function useSettingsInput(
  initialValue: string = '',
  validator?: (value: string) => string | null
) {
  return useDebouncedInput(initialValue, {
    delay: 500, // Longer delay for settings to avoid too many validations
    validateOnChange: true,
    validator
  })
}