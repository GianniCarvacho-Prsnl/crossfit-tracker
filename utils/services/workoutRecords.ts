import { createClient } from '@/utils/supabase/client'
import { WorkoutFormData, WorkoutRecord } from '@/types/workout'
import { calculateOneRM, isCalculatedRM } from '@/utils/calculations'
import { convertToLbs } from '@/utils/conversions'
import { retryWithBackoff, classifyError, logError, AppError } from '@/utils/errorHandling'

export interface CreateWorkoutRecordResult {
  success: boolean
  data?: WorkoutRecord
  error?: AppError
}

export interface GetWorkoutRecordsResult {
  success: boolean
  data?: any[]
  error?: AppError
}

export interface WorkoutRecordService {
  createWorkoutRecord: (formData: WorkoutFormData) => Promise<CreateWorkoutRecordResult>
  getWorkoutRecords: (userId: string) => Promise<GetWorkoutRecordsResult>
}

/**
 * Service for managing workout records with proper error handling
 */
export class WorkoutRecordServiceImpl implements WorkoutRecordService {
  private supabase = createClient()

  /**
   * Create a new workout record with retry logic and proper error handling
   */
  async createWorkoutRecord(formData: WorkoutFormData): Promise<CreateWorkoutRecordResult> {
    try {
      // Validate input data
      const validationError = this.validateFormData(formData)
      if (validationError) {
        const appError = classifyError(new Error(validationError))
        logError(appError, 'createWorkoutRecord validation')
        return { success: false, error: appError }
      }

      // Use retry logic for the database operations
      const result = await retryWithBackoff(async () => {
        // Get current user
        const { data: { user }, error: userError } = await this.supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('Usuario no autenticado')

        // Get exercise ID from exercises table
        const { data: exerciseData, error: exerciseError } = await this.supabase
          .from('exercises')
          .select('id')
          .eq('name', formData.exercise)
          .single()

        if (exerciseError) throw exerciseError
        if (!exerciseData) throw new Error('Ejercicio no encontrado')

        // Convert weight to pounds for storage
        const weightInLbs = convertToLbs(formData.weight, formData.unit)
        
        // Calculate 1RM
        const calculatedRM = calculateOneRM(formData.weight, formData.repetitions)
        const calculatedRMInLbs = convertToLbs(calculatedRM, formData.unit)
        
        // Prepare workout record
        const workoutRecord = {
          user_id: user.id,
          exercise_id: exerciseData.id,
          weight_lbs: weightInLbs,
          repetitions: formData.repetitions,
          calculated_1rm: calculatedRMInLbs,
          is_calculated: isCalculatedRM(formData.repetitions),
          original_unit: formData.unit
        }

        // Insert workout record
        const { data, error: insertError } = await this.supabase
          .from('workout_records')
          .insert(workoutRecord)
          .select()
          .single()

        if (insertError) throw insertError
        return data as WorkoutRecord
      }, {
        maxAttempts: 3,
        baseDelay: 1000
      })

      return { success: true, data: result }

    } catch (error) {
      const appError = classifyError(error)
      logError(appError, 'createWorkoutRecord')
      return { success: false, error: appError }
    }
  }

  /**
   * Get workout records for a user with retry logic and proper error handling
   */
  async getWorkoutRecords(userId: string): Promise<GetWorkoutRecordsResult> {
    try {
      const data = await retryWithBackoff(async () => {
        const { data, error } = await this.supabase
          .from('workout_records')
          .select(`
            *,
            exercise:exercises (
              id,
              name
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data
      }, {
        maxAttempts: 3,
        baseDelay: 1000
      })

      return { success: true, data }

    } catch (error) {
      const appError = classifyError(error)
      logError(appError, 'getWorkoutRecords')
      return { success: false, error: appError }
    }
  }

  /**
   * Get the latest PR (Personal Record) for each exercise for a user
   */
  async getLatestPRs(userId: string): Promise<GetWorkoutRecordsResult> {
    try {
      const data = await retryWithBackoff(async () => {
        const { data, error } = await this.supabase
          .from('workout_records')
          .select(`
            exercise_id,
            calculated_1rm,
            created_at,
            exercise:exercises (
              id,
              name
            )
          `)
          .eq('user_id', userId)
          .order('calculated_1rm', { ascending: false })

        if (error) throw error
        
        // Group by exercise and get the highest 1RM for each
        const prsByExercise = new Map()
        
        data?.forEach((record: any) => {
          const exerciseName = record.exercise?.name
          if (exerciseName && (!prsByExercise.has(exerciseName) || 
              record.calculated_1rm > prsByExercise.get(exerciseName).calculated_1rm)) {
            prsByExercise.set(exerciseName, record)
          }
        })
        
        return Array.from(prsByExercise.values())
      }, {
        maxAttempts: 3,
        baseDelay: 1000
      })

      return { success: true, data }

    } catch (error) {
      const appError = classifyError(error)
      logError(appError, 'getLatestPRs')
      return { success: false, error: appError }
    }
  }

  /**
   * Validate form data before processing
   */
  private validateFormData(formData: WorkoutFormData): string | null {
    if (!formData.exercise) {
      return 'Selecciona un ejercicio'
    }

    if (formData.weight <= 0) {
      return 'El peso debe ser mayor a 0'
    }

    if (formData.repetitions <= 0) {
      return 'Las repeticiones deben ser mayor a 0'
    }

    if (formData.repetitions > 20) {
      return 'Máximo 20 repeticiones para cálculo preciso'
    }

    if (!['lbs', 'kg'].includes(formData.unit)) {
      return 'Unidad de peso inválida'
    }

    return null
  }
}

// Export singleton instance
export const workoutRecordService = new WorkoutRecordServiceImpl()