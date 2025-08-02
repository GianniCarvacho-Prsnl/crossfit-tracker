/**
 * Integration tests for the error handling system
 * Tests the complete error handling flow without external dependencies
 */

import { classifyError, retryWithBackoff, ErrorType, getErrorMessage } from '@/utils/errorHandling'

describe('Error Handling Integration', () => {

  describe('Error Classification Integration', () => {
    it('should correctly classify Supabase errors', () => {
      const supabaseError = {
        message: 'relation "workout_records" does not exist',
        code: 'PGRST116'
      }

      const classified = classifyError(supabaseError)

      expect(classified.type).toBe(ErrorType.DATABASE)
      expect(classified.retryable).toBe(true)
      expect(classified.userMessage).toContain('base de datos')
    })

    it('should correctly classify network errors', () => {
      const networkError = new Error('Failed to fetch')

      const classified = classifyError(networkError)

      expect(classified.type).toBe(ErrorType.NETWORK)
      expect(classified.retryable).toBe(true)
      expect(classified.userMessage).toContain('conexión')
    })

    it('should correctly classify auth errors', () => {
      const authError = {
        message: 'JWT expired',
        status: 401
      }

      const classified = classifyError(authError)

      expect(classified.type).toBe(ErrorType.AUTHENTICATION)
      expect(classified.retryable).toBe(false)
      expect(classified.userMessage).toContain('autenticación')
    })
  })

  describe('Retry Logic Integration', () => {
    it('should retry network operations with exponential backoff', async () => {
      let attempts = 0
      const mockOperation = jest.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          throw new Error('network error')
        }
        return 'success'
      })

      const result = await retryWithBackoff(mockOperation, {
        maxAttempts: 3,
        baseDelay: 10
      })

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(3)
    })

    it('should not retry non-retryable errors', async () => {
      const mockOperation = jest.fn().mockRejectedValue({
        message: 'unauthorized',
        status: 401
      })

      await expect(retryWithBackoff(mockOperation)).rejects.toMatchObject({
        message: 'unauthorized',
        status: 401
      })

      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should respect maximum retry attempts', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('persistent error'))

      await expect(retryWithBackoff(mockOperation, {
        maxAttempts: 2,
        baseDelay: 10
      })).rejects.toThrow('persistent error')

      expect(mockOperation).toHaveBeenCalledTimes(2)
    })
  })

  describe('End-to-End Error Flow', () => {
    it('should provide consistent error messages across the system', () => {
      const errors = [
        new Error('fetch failed'),
        { message: 'unauthorized', status: 401 },
        { message: 'supabase connection failed' },
        new Error('validation failed: required field missing'),
        'Custom error message'
      ]

      errors.forEach(error => {
        const classified = classifyError(error)
        const message = getErrorMessage(error)
        
        // All errors should have consistent structure
        expect(classified).toHaveProperty('type')
        expect(classified).toHaveProperty('retryable')
        expect(classified).toHaveProperty('userMessage')
        expect(typeof message).toBe('string')
        expect(message.length).toBeGreaterThan(0)
      })
    })

    it('should handle error chains correctly', async () => {
      let attempt = 0
      const chainedOperation = async () => {
        attempt++
        
        if (attempt === 1) {
          throw new Error('network timeout')
        } else if (attempt === 2) {
          throw new Error('database connection failed')
        } else {
          return 'success'
        }
      }

      const result = await retryWithBackoff(chainedOperation, {
        maxAttempts: 3,
        baseDelay: 10
      })

      expect(result).toBe('success')
      expect(attempt).toBe(3)
    })

    it('should respect error type hierarchy', () => {
      const authError = { message: 'unauthorized', status: 401 }
      const networkError = new Error('fetch failed')
      const validationError = new Error('validation failed: email required')

      const authClassified = classifyError(authError)
      const networkClassified = classifyError(networkError)
      const validationClassified = classifyError(validationError)

      // Auth errors should not be retryable
      expect(authClassified.retryable).toBe(false)
      
      // Network errors should be retryable
      expect(networkClassified.retryable).toBe(true)
      
      // Validation errors should not be retryable
      expect(validationClassified.retryable).toBe(false)
      
      // Each should have appropriate user messages
      expect(authClassified.userMessage).toContain('autenticación')
      expect(networkClassified.userMessage).toContain('conexión')
      // Validation errors use the original message as user message
      expect(validationClassified.userMessage).toBe('validation failed: email required')
    })
  })
})