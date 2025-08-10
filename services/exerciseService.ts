import { createClient } from '@/utils/supabase/client'
import { Exercise } from '@/types/workout'
import { AppError, ErrorType } from '@/utils/errorHandling'

export class ExerciseService {
  /**
   * Get all available exercises
   */
  static async getAllExercises(): Promise<Exercise[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        throw new AppError(
          'Error al cargar ejercicios',
          ErrorType.DATABASE,
          error.message
        )
      }

      return data || []
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al cargar ejercicios',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Get exercise by name
   */
  static async getExerciseByName(name: string): Promise<Exercise | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('name', name)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Exercise not found
        }
        throw new AppError(
          'Error al buscar ejercicio',
          ErrorType.DATABASE,
          error.message
        )
      }

      return data
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al buscar ejercicio',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Create a new exercise
   */
  static async createExercise(name: string): Promise<Exercise> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('exercises')
        .insert({ name: name.trim() })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new AppError(
            'Este ejercicio ya existe',
            ErrorType.VALIDATION,
            error.message
          )
        }
        throw new AppError(
          'Error al crear ejercicio',
          ErrorType.DATABASE,
          error.message
        )
      }

      return data
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al crear ejercicio',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Update exercise name
   */
  static async updateExercise(id: number, name: string): Promise<Exercise> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('exercises')
        .update({ name: name.trim() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new AppError(
            'Este nombre de ejercicio ya existe',
            ErrorType.VALIDATION,
            error.message
          )
        }
        throw new AppError(
          'Error al actualizar ejercicio',
          ErrorType.DATABASE,
          error.message
        )
      }

      return data
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al actualizar ejercicio',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Delete exercise (only if no workout records exist)
   */
  static async deleteExercise(id: number): Promise<void> {
    try {
      const supabase = createClient()
      // First check if there are any workout records using this exercise
      const { data: records, error: checkError } = await supabase
        .from('workout_records')
        .select('id')
        .eq('exercise_id', id)
        .limit(1)

      if (checkError) {
        throw new AppError(
          'Error al verificar registros existentes',
          ErrorType.DATABASE,
          checkError.message
        )
      }

      if (records && records.length > 0) {
        throw new AppError(
          'No se puede eliminar este ejercicio porque tiene registros asociados',
          ErrorType.VALIDATION,
          'Exercise has associated workout records',
          false
        )
      }

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)

      if (error) {
        throw new AppError(
          'Error al eliminar ejercicio',
          ErrorType.DATABASE,
          error.message
        )
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al eliminar ejercicio',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }
}