import {
  classifyError,
  ErrorType,
  retryWithBackoff,
  getErrorMessage,
  createValidationError,
  createNetworkError,
  isOnline
} from '@/utils/errorHandling'

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
})

describe('Error Handling Utilities', () => {
  describe('classifyError', () => {
    it('should classify network errors correctly', () => {
      const networkError = new Error('fetch failed')
      const result = classifyError(networkError)
      
      expect(result.type).toBe(ErrorType.NETWORK)
      expect(result.retryable).toBe(true)
      expect(result.userMessage).toContain('conexión')
    })

    it('should classify authentication errors correctly', () => {
      const authError = { message: 'unauthorized', status: 401 }
      const result = classifyError(authError)
      
      expect(result.type).toBe(ErrorType.AUTHENTICATION)
      expect(result.retryable).toBe(false)
      expect(result.userMessage).toContain('autenticación')
    })

    it('should classify database errors correctly', () => {
      const dbError = { message: 'supabase connection failed' }
      const result = classifyError(dbError)
      
      expect(result.type).toBe(ErrorType.DATABASE)
      expect(result.retryable).toBe(true)
      expect(result.userMessage).toContain('base de datos')
    })

    it('should classify validation errors correctly', () => {
      const validationError = new Error('validation failed: required field missing')
      const result = classifyError(validationError)
      
      expect(result.type).toBe(ErrorType.VALIDATION)
      expect(result.retryable).toBe(false)
    })

    it('should classify unknown errors correctly', () => {
      const unknownError = new Error('something went wrong')
      const result = classifyError(unknownError)
      
      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.retryable).toBe(true)
      expect(result.userMessage).toContain('inesperado')
    })
  })

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      
      const result = await retryWithBackoff(mockFn)
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success')
      
      const result = await retryWithBackoff(mockFn, { maxAttempts: 2, baseDelay: 10 })
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should not retry on non-retryable errors', async () => {
      const authError = { message: 'unauthorized', status: 401 }
      const mockFn = jest.fn().mockRejectedValue(authError)
      
      await expect(retryWithBackoff(mockFn)).rejects.toEqual(authError)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should throw after max attempts', async () => {
      const error = new Error('persistent error')
      const mockFn = jest.fn().mockRejectedValue(error)
      
      await expect(retryWithBackoff(mockFn, { maxAttempts: 2, baseDelay: 10 }))
        .rejects.toThrow('persistent error')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('getErrorMessage', () => {
    it('should return string errors as-is', () => {
      const result = getErrorMessage('Custom error message')
      expect(result).toBe('Custom error message')
    })

    it('should extract user message from Error objects', () => {
      const error = new Error('network failed')
      const result = getErrorMessage(error)
      expect(result).toContain('conexión')
    })

    it('should return fallback for null/undefined', () => {
      const result = getErrorMessage(null, 'Fallback message')
      expect(result).toBe('Fallback message')
    })
  })

  describe('createValidationError', () => {
    it('should create validation error with correct properties', () => {
      const error = createValidationError('email', 'Email is required')
      
      expect(error.type).toBe(ErrorType.VALIDATION)
      expect(error.retryable).toBe(false)
      expect(error.userMessage).toBe('Email is required')
      expect(error.message).toContain('email')
    })
  })

  describe('createNetworkError', () => {
    it('should create network error with correct properties', () => {
      const originalError = new Error('Connection failed')
      const error = createNetworkError(originalError)
      
      expect(error.type).toBe(ErrorType.NETWORK)
      expect(error.retryable).toBe(true)
      expect(error.originalError).toBe(originalError)
      expect(error.userMessage).toContain('conexión')
    })

    it('should create network error without original error', () => {
      const error = createNetworkError()
      
      expect(error.type).toBe(ErrorType.NETWORK)
      expect(error.retryable).toBe(true)
      expect(error.originalError).toBeUndefined()
    })
  })

  describe('isOnline', () => {
    it('should return navigator.onLine value', () => {
      // Test online
      ;(navigator as any).onLine = true
      expect(isOnline()).toBe(true)
      
      // Test offline
      ;(navigator as any).onLine = false
      expect(isOnline()).toBe(false)
    })
  })
})