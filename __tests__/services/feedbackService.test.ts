/**
 * Unit tests for FeedbackService
 * These tests mock the Supabase client to test the service logic in isolation
 */

// Unmock the feedbackService to test the actual implementation
jest.unmock('@/services/feedbackService')

import { submitFeedback, FeedbackData } from '@/services/feedbackService'

// Mock the Supabase client module completely
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('FeedbackService Unit Tests', () => {
  let mockSupabase: any
  let mockCreateClient: jest.MockedFunction<any>

  beforeAll(() => {
    // Get the mocked createClient function
    mockCreateClient = require('@/utils/supabase/client').createClient as jest.MockedFunction<any>
  })

  beforeEach(() => {
    // Clear all mocks first
    jest.clearAllMocks()
    
    // Create fresh mocks for each test
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    }

    // Configure the mocked createClient to return our mock
    mockCreateClient.mockReturnValue(mockSupabase)

    // Mock console.error
    console.error = jest.fn()
  })

  describe('submitFeedback', () => {
    const validFeedbackData: FeedbackData = {
      type: 'bug',
      title: 'Test Bug Report',
      description: 'This is a test bug description'
    }

    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com'
    }

    describe('Successful submission', () => {
      it('should successfully submit feedback with authenticated user', async () => {
        // Mock successful auth
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        })

        // Mock successful insert
        const mockInsertedFeedback = {
          id: 'feedback-id',
          user_id: mockUser.id,
          type: 'bug',
          title: 'Test Bug Report',
          description: 'This is a test bug description',
          created_at: new Date().toISOString()
        }

        const mockSingleQuery = {
          single: jest.fn().mockResolvedValue({
            data: mockInsertedFeedback,
            error: null
          })
        }
        const mockSelectQuery = {
          select: jest.fn().mockReturnValue(mockSingleQuery)
        }
        const mockInsertQuery = {
          insert: jest.fn().mockReturnValue(mockSelectQuery)
        }
        mockSupabase.from.mockReturnValue(mockInsertQuery)

        const result = await submitFeedback(validFeedbackData)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockInsertedFeedback)
        expect(result.error).toBeUndefined()

        // Verify the correct data was inserted
        expect(mockInsertQuery.insert).toHaveBeenCalledWith({
          user_id: mockUser.id,
          type: 'bug',
          title: 'Test Bug Report',
          description: 'This is a test bug description'
        })
      })

      it('should trim title and description before inserting', async () => {
        const feedbackWithSpaces: FeedbackData = {
          type: 'improvement',
          title: '  Spaced Title  ',
          description: '  Spaced Description  '
        }

        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        })

        const mockSingleQuery = {
          single: jest.fn().mockResolvedValue({
            data: { id: 'feedback-id' },
            error: null
          })
        }
        const mockSelectQuery = {
          select: jest.fn().mockReturnValue(mockSingleQuery)
        }
        const mockInsertQuery = {
          insert: jest.fn().mockReturnValue(mockSelectQuery)
        }
        mockSupabase.from.mockReturnValue(mockInsertQuery)

        await submitFeedback(feedbackWithSpaces)

        expect(mockInsertQuery.insert).toHaveBeenCalledWith({
          user_id: mockUser.id,
          type: 'improvement',
          title: 'Spaced Title',
          description: 'Spaced Description'
        })
      })
    })

    describe('Authentication errors', () => {
      it('should handle unauthenticated user (no user)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null
        })

        const result = await submitFeedback(validFeedbackData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Debes iniciar sesión para enviar feedback')
        expect(result.data).toBeUndefined()

        // Verify no database operations were attempted
        expect(mockSupabase.from).not.toHaveBeenCalled()
      })

      it('should handle authentication error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Authentication failed' }
        })

        const result = await submitFeedback(validFeedbackData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Debes iniciar sesión para enviar feedback')
        expect(result.data).toBeUndefined()

        // Verify no database operations were attempted
        expect(mockSupabase.from).not.toHaveBeenCalled()
      })
    })

    describe('Validation errors', () => {
      beforeEach(() => {
        // Mock successful auth for validation tests
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        })
      })

      it('should handle empty description', async () => {
        const invalidFeedback: FeedbackData = {
          type: 'bug',
          title: 'Test Title',
          description: ''
        }

        const result = await submitFeedback(invalidFeedback)

        expect(result.success).toBe(false)
        expect(result.error).toBe('La descripción es requerida')
        expect(result.data).toBeUndefined()

        // Verify no database operations were attempted
        expect(mockSupabase.from).not.toHaveBeenCalled()
      })

      it('should handle whitespace-only description', async () => {
        const invalidFeedback: FeedbackData = {
          type: 'feature',
          title: 'Test Title',
          description: '   \n\t   '
        }

        const result = await submitFeedback(invalidFeedback)

        expect(result.success).toBe(false)
        expect(result.error).toBe('La descripción es requerida')
        expect(result.data).toBeUndefined()

        // Verify no database operations were attempted
        expect(mockSupabase.from).not.toHaveBeenCalled()
      })
    })

    describe('Database errors', () => {
      beforeEach(() => {
        // Mock successful auth for database error tests
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        })
      })

      it('should handle database insert errors', async () => {
        const mockSingleQuery = {
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database insert failed', code: 'INSERT_ERROR' }
          })
        }
        const mockSelectQuery = {
          select: jest.fn().mockReturnValue(mockSingleQuery)
        }
        const mockInsertQuery = {
          insert: jest.fn().mockReturnValue(mockSelectQuery)
        }
        mockSupabase.from.mockReturnValue(mockInsertQuery)

        const result = await submitFeedback(validFeedbackData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Error al enviar feedback. Inténtalo de nuevo.')
        expect(result.data).toBeUndefined()

        // Verify error was logged
        expect(console.error).toHaveBeenCalledWith(
          'Error inserting feedback:',
          expect.objectContaining({ message: 'Database insert failed' })
        )
      })

      it('should handle database connection errors', async () => {
        const mockSingleQuery = {
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Connection timeout', code: 'CONNECTION_ERROR' }
          })
        }
        const mockSelectQuery = {
          select: jest.fn().mockReturnValue(mockSingleQuery)
        }
        const mockInsertQuery = {
          insert: jest.fn().mockReturnValue(mockSelectQuery)
        }
        mockSupabase.from.mockReturnValue(mockInsertQuery)

        const result = await submitFeedback(validFeedbackData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Error al enviar feedback. Inténtalo de nuevo.')
        expect(result.data).toBeUndefined()

        // Verify error was logged
        expect(console.error).toHaveBeenCalledWith(
          'Error inserting feedback:',
          expect.objectContaining({ message: 'Connection timeout' })
        )
      })
    })

    describe('Unexpected errors', () => {
      it('should handle unexpected exceptions', async () => {
        // Mock auth to throw an unexpected error
        mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected network error'))

        const result = await submitFeedback(validFeedbackData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Error inesperado. Inténtalo de nuevo.')
        expect(result.data).toBeUndefined()

        // Verify error was logged
        expect(console.error).toHaveBeenCalledWith(
          'Unexpected error in submitFeedback:',
          expect.any(Error)
        )
      })

      it('should handle Supabase client creation errors', async () => {
        // Mock createClient to throw an error
        const { createClient } = require('@/utils/supabase/client')
        createClient.mockImplementation(() => {
          throw new Error('Failed to create Supabase client')
        })

        const result = await submitFeedback(validFeedbackData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Error inesperado. Inténtalo de nuevo.')
        expect(result.data).toBeUndefined()

        // Verify error was logged
        expect(console.error).toHaveBeenCalledWith(
          'Unexpected error in submitFeedback:',
          expect.any(Error)
        )
      })
    })

    describe('Different feedback types', () => {
      beforeEach(() => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        })

        const mockSingleQuery = {
          single: jest.fn().mockResolvedValue({
            data: { id: 'feedback-id' },
            error: null
          })
        }
        const mockSelectQuery = {
          select: jest.fn().mockReturnValue(mockSingleQuery)
        }
        const mockInsertQuery = {
          insert: jest.fn().mockReturnValue(mockSelectQuery)
        }
        mockSupabase.from.mockReturnValue(mockInsertQuery)
      })

      it('should handle bug feedback type', async () => {
        const bugFeedback: FeedbackData = {
          type: 'bug',
          title: 'Bug Report',
          description: 'Found a bug'
        }

        const result = await submitFeedback(bugFeedback)

        expect(result.success).toBe(true)
        expect(mockSupabase.from().insert).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'bug' })
        )
      })

      it('should handle improvement feedback type', async () => {
        const improvementFeedback: FeedbackData = {
          type: 'improvement',
          title: 'Improvement Suggestion',
          description: 'This could be better'
        }

        const result = await submitFeedback(improvementFeedback)

        expect(result.success).toBe(true)
        expect(mockSupabase.from().insert).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'improvement' })
        )
      })

      it('should handle feature feedback type', async () => {
        const featureFeedback: FeedbackData = {
          type: 'feature',
          title: 'Feature Request',
          description: 'Please add this feature'
        }

        const result = await submitFeedback(featureFeedback)

        expect(result.success).toBe(true)
        expect(mockSupabase.from().insert).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'feature' })
        )
      })
    })
  })
})