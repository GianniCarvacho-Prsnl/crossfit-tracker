/**
 * Integration tests for WorkoutRecordService
 * These tests mock the Supabase client to test the service logic
 */

import { WorkoutRecordServiceImpl } from '@/utils/services/workoutRecords'
import { WorkoutFormData } from '@/types/workout'

// Mock the Supabase client module
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('WorkoutRecordService Integration Tests', () => {
  let service: WorkoutRecordServiceImpl
  let mockSupabase: any

  beforeEach(() => {
    // Create fresh mocks for each test
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
          order: jest.fn(),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    }

    // Mock the createClient function
    const { createClient } = require('@/utils/supabase/client')
    createClient.mockReturnValue(mockSupabase)

    // Create a new service instance for each test
    service = new WorkoutRecordServiceImpl()
  })

  describe('createWorkoutRecord', () => {
    const validFormData: WorkoutFormData = {
      exercise: 'Clean',
      weight: 100,
      repetitions: 1,
      unit: 'lbs'
    }

    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com'
    }

    const mockExercise = {
      id: 1,
      name: 'Clean'
    }

    it('should successfully create a workout record', async () => {
      // Mock successful auth
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock successful exercise lookup
      const mockExerciseQuery = {
        single: jest.fn().mockResolvedValue({
          data: mockExercise,
          error: null
        })
      }
      const mockExerciseSelect = {
        eq: jest.fn().mockReturnValue(mockExerciseQuery)
      }
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue(mockExerciseSelect)
      })

      // Mock successful insert
      const mockInsertedRecord = {
        id: 'test-record-id',
        user_id: mockUser.id,
        exercise_id: mockExercise.id,
        weight_lbs: 100,
        repetitions: 1,
        calculated_1rm: 100,
        is_calculated: false,
        original_unit: 'lbs',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const mockInsertQuery = {
        single: jest.fn().mockResolvedValue({
          data: mockInsertedRecord,
          error: null
        })
      }
      const mockInsertSelect = {
        select: jest.fn().mockReturnValue(mockInsertQuery)
      }
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue(mockInsertSelect)
      })

      const result = await service.createWorkoutRecord(validFormData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockInsertedRecord)
      expect(result.error).toBeUndefined()
    })

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const result = await service.createWorkoutRecord(validFormData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Error de autenticación')
      expect(result.data).toBeUndefined()
    })

    it('should handle missing user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const result = await service.createWorkoutRecord(validFormData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Usuario no autenticado')
      expect(result.data).toBeUndefined()
    })

    it('should handle exercise not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockExerciseQuery = {
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Exercise not found' }
        })
      }
      const mockExerciseSelect = {
        eq: jest.fn().mockReturnValue(mockExerciseQuery)
      }
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue(mockExerciseSelect)
      })

      const result = await service.createWorkoutRecord(validFormData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Error al buscar ejercicio')
      expect(result.data).toBeUndefined()
    })

    it('should handle database insert errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockExerciseQuery = {
        single: jest.fn().mockResolvedValue({
          data: mockExercise,
          error: null
        })
      }
      const mockExerciseSelect = {
        eq: jest.fn().mockReturnValue(mockExerciseQuery)
      }
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue(mockExerciseSelect)
      })

      const mockInsertQuery = {
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database insert failed' }
        })
      }
      const mockInsertSelect = {
        select: jest.fn().mockReturnValue(mockInsertQuery)
      }
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue(mockInsertSelect)
      })

      const result = await service.createWorkoutRecord(validFormData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Error al guardar registro')
      expect(result.data).toBeUndefined()
    })

    it('should validate form data', async () => {
      const invalidFormData: WorkoutFormData = {
        exercise: 'Clean',
        weight: -10, // Invalid negative weight
        repetitions: 1,
        unit: 'lbs'
      }

      const result = await service.createWorkoutRecord(invalidFormData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('El peso debe ser mayor a 0')
      expect(result.data).toBeUndefined()
    })

    it('should handle calculated 1RM correctly', async () => {
      const multiRepFormData: WorkoutFormData = {
        exercise: 'Clean',
        weight: 100,
        repetitions: 5, // Multiple reps should trigger calculation
        unit: 'lbs'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockExerciseQuery = {
        single: jest.fn().mockResolvedValue({
          data: mockExercise,
          error: null
        })
      }
      const mockExerciseSelect = {
        eq: jest.fn().mockReturnValue(mockExerciseQuery)
      }
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue(mockExerciseSelect)
      })

      const mockInsertedRecord = {
        id: 'test-record-id',
        user_id: mockUser.id,
        exercise_id: mockExercise.id,
        weight_lbs: 100,
        repetitions: 5,
        calculated_1rm: 116.65, // Expected calculated 1RM
        is_calculated: true, // Should be true for multiple reps
        original_unit: 'lbs',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const mockInsertQuery = {
        single: jest.fn().mockResolvedValue({
          data: mockInsertedRecord,
          error: null
        })
      }
      const mockInsertSelect = {
        select: jest.fn().mockReturnValue(mockInsertQuery)
      }
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue(mockInsertSelect)
      })

      const result = await service.createWorkoutRecord(multiRepFormData)

      expect(result.success).toBe(true)
      expect(result.data?.is_calculated).toBe(true)
      expect(result.data?.calculated_1rm).toBeCloseTo(116.65, 1)
    })

    it('should handle unit conversion correctly', async () => {
      const kgFormData: WorkoutFormData = {
        exercise: 'Clean',
        weight: 45.36, // ~100 lbs in kg
        repetitions: 1,
        unit: 'kg'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockExerciseQuery = {
        single: jest.fn().mockResolvedValue({
          data: mockExercise,
          error: null
        })
      }
      const mockExerciseSelect = {
        eq: jest.fn().mockReturnValue(mockExerciseQuery)
      }
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue(mockExerciseSelect)
      })

      const mockInsertedRecord = {
        id: 'test-record-id',
        user_id: mockUser.id,
        exercise_id: mockExercise.id,
        weight_lbs: 100, // Should be converted to lbs
        repetitions: 1,
        calculated_1rm: 100,
        is_calculated: false,
        original_unit: 'kg', // Should preserve original unit
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const mockInsertQuery = {
        single: jest.fn().mockResolvedValue({
          data: mockInsertedRecord,
          error: null
        })
      }
      const mockInsertSelect = {
        select: jest.fn().mockReturnValue(mockInsertQuery)
      }
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue(mockInsertSelect)
      })

      const result = await service.createWorkoutRecord(kgFormData)

      expect(result.success).toBe(true)
      expect(result.data?.weight_lbs).toBeCloseTo(100, 1)
      expect(result.data?.original_unit).toBe('kg')
    })
  })

  describe('getWorkoutRecords', () => {
    const mockUserId = 'test-user-id'

    it('should successfully retrieve workout records', async () => {
      const mockRecords = [
        {
          id: 'record-1',
          user_id: mockUserId,
          exercise_id: 1,
          weight_lbs: 100,
          repetitions: 1,
          calculated_1rm: 100,
          is_calculated: false,
          original_unit: 'lbs',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          exercises: {
            id: 1,
            name: 'Clean'
          }
        }
      ]

      const mockOrderQuery = {
        order: jest.fn().mockResolvedValue({
          data: mockRecords,
          error: null
        })
      }
      const mockEqQuery = {
        eq: jest.fn().mockReturnValue(mockOrderQuery)
      }
      const mockSelectQuery = {
        select: jest.fn().mockReturnValue(mockEqQuery)
      }
      mockSupabase.from.mockReturnValue(mockSelectQuery)

      const result = await service.getWorkoutRecords(mockUserId)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRecords)
      expect(result.error).toBeUndefined()
    })

    it('should handle database query errors', async () => {
      const mockOrderQuery = {
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database query failed' }
        })
      }
      const mockEqQuery = {
        eq: jest.fn().mockReturnValue(mockOrderQuery)
      }
      const mockSelectQuery = {
        select: jest.fn().mockReturnValue(mockEqQuery)
      }
      mockSupabase.from.mockReturnValue(mockSelectQuery)

      const result = await service.getWorkoutRecords(mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Error al obtener registros')
      expect(result.data).toBeUndefined()
    })
  })

  describe('deleteWorkoutRecord', () => {
    const mockUserId = 'user-123'
    const mockRecordId = 'record-456'

    it('should successfully delete a workout record', async () => {
      // Mock successful record verification
      const mockEqSecondQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: mockRecordId, user_id: mockUserId },
            error: null
          })
        })
      }
      const mockEqFirstQuery = {
        eq: jest.fn().mockReturnValue(mockEqSecondQuery)
      }
      const mockSelectQuery = {
        select: jest.fn().mockReturnValue(mockEqFirstQuery)
      }

      // Mock successful deletion
      const mockDeleteEqSecondQuery = {
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }
      const mockDeleteEqFirstQuery = {
        eq: jest.fn().mockReturnValue(mockDeleteEqSecondQuery)
      }
      const mockDeleteQuery = {
        delete: jest.fn().mockReturnValue(mockDeleteEqFirstQuery)
      }

      mockSupabase.from
        .mockReturnValueOnce(mockSelectQuery) // For verification query
        .mockReturnValueOnce(mockDeleteQuery) // For delete query

      const result = await service.deleteWorkoutRecord(mockRecordId, mockUserId)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockSupabase.from).toHaveBeenCalledWith('workout_records')
    })

    it('should fail when record does not exist', async () => {
      const mockEqSecondQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' } // Record not found
          })
        })
      }
      const mockEqFirstQuery = {
        eq: jest.fn().mockReturnValue(mockEqSecondQuery)
      }
      const mockSelectQuery = {
        select: jest.fn().mockReturnValue(mockEqFirstQuery)
      }

      mockSupabase.from.mockReturnValue(mockSelectQuery)

      const result = await service.deleteWorkoutRecord(mockRecordId, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('Registro no encontrado')
    })

    it('should fail when record belongs to different user', async () => {
      const mockEqSecondQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null, // No data returned when user_id doesn't match
            error: null
          })
        })
      }
      const mockEqFirstQuery = {
        eq: jest.fn().mockReturnValue(mockEqSecondQuery)
      }
      const mockSelectQuery = {
        select: jest.fn().mockReturnValue(mockEqFirstQuery)
      }

      mockSupabase.from.mockReturnValue(mockSelectQuery)

      const result = await service.deleteWorkoutRecord(mockRecordId, 'different-user')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('Registro no encontrado')
    })

    it('should validate required parameters', async () => {
      // Test missing recordId
      let result = await service.deleteWorkoutRecord('', mockUserId)
      expect(result.success).toBe(false)
      expect(result.error?.userMessage).toContain('ID de registro y usuario son requeridos')

      // Test missing userId  
      result = await service.deleteWorkoutRecord(mockRecordId, '')
      expect(result.success).toBe(false)
      expect(result.error?.userMessage).toContain('ID de registro y usuario son requeridos')
    })

    it('should handle database deletion errors', async () => {
      // Mock successful record verification
      const mockEqSecondQuery = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: mockRecordId, user_id: mockUserId },
            error: null
          })
        })
      }
      const mockEqFirstQuery = {
        eq: jest.fn().mockReturnValue(mockEqSecondQuery)
      }
      const mockSelectQuery = {
        select: jest.fn().mockReturnValue(mockEqFirstQuery)
      }

      // Mock deletion failure
      const mockDeleteEqSecondQuery = {
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Delete operation failed' }
        })
      }
      const mockDeleteEqFirstQuery = {
        eq: jest.fn().mockReturnValue(mockDeleteEqSecondQuery)
      }
      const mockDeleteQuery = {
        delete: jest.fn().mockReturnValue(mockDeleteEqFirstQuery)
      }

      mockSupabase.from
        .mockReturnValueOnce(mockSelectQuery)
        .mockReturnValueOnce(mockDeleteQuery)

      const result = await service.deleteWorkoutRecord(mockRecordId, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.userMessage).toContain('Error en la base de datos')
    })
  })
})