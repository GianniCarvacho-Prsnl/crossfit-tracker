import { createClient } from '@/utils/supabase/client'
import { ExerciseGoals, NewExerciseGoals, UpdateExerciseGoals } from '@/types/database'
import { AppError, ErrorType } from '@/utils/errorHandling'

export class ExerciseGoalsService {
  /**
   * Get all exercise goals for a user
   */
  static async getUserExerciseGoals(userId: string): Promise<ExerciseGoals[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('exercise_goals')
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new AppError(
          'Error al cargar metas de ejercicios',
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
        'Error inesperado al cargar metas de ejercicios',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Get exercise goal by user and exercise ID
   */
  static async getExerciseGoal(userId: string, exerciseId: number): Promise<ExerciseGoals | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('exercise_goals')
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Goal not found
        }
        throw new AppError(
          'Error al cargar meta de ejercicio',
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
        'Error inesperado al cargar meta de ejercicio',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Create exercise goal
   */
  static async createExerciseGoal(goal: NewExerciseGoals): Promise<ExerciseGoals> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('exercise_goals')
        .insert(goal)
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new AppError(
            'Ya existe una meta para este ejercicio',
            ErrorType.VALIDATION,
            error.message
          )
        }
        if (error.code === '23503') { // Foreign key constraint violation
          throw new AppError(
            'El ejercicio especificado no existe',
            ErrorType.VALIDATION,
            error.message
          )
        }
        throw new AppError(
          'Error al crear meta de ejercicio',
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
        'Error inesperado al crear meta de ejercicio',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Update exercise goal
   */
  static async updateExerciseGoal(goalId: string, updates: UpdateExerciseGoals): Promise<ExerciseGoals> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('exercise_goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', goalId)
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .single()

      if (error) {
        throw new AppError(
          'Error al actualizar meta de ejercicio',
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
        'Error inesperado al actualizar meta de ejercicio',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Delete exercise goal
   */
  static async deleteExerciseGoal(goalId: string): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('exercise_goals')
        .delete()
        .eq('id', goalId)

      if (error) {
        throw new AppError(
          'Error al eliminar meta de ejercicio',
          ErrorType.DATABASE,
          error.message
        )
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al eliminar meta de ejercicio',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Set or update exercise goal (upsert operation)
   */
  static async setExerciseGoal(
    userId: string, 
    exerciseId: number, 
    goalData: Omit<NewExerciseGoals, 'user_id' | 'exercise_id'>
  ): Promise<ExerciseGoals> {
    try {
      // Check if goal already exists
      const existingGoal = await this.getExerciseGoal(userId, exerciseId)
      
      if (existingGoal) {
        // Update existing goal
        return await this.updateExerciseGoal(existingGoal.id, goalData)
      } else {
        // Create new goal
        return await this.createExerciseGoal({
          user_id: userId,
          exercise_id: exerciseId,
          ...goalData
        })
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al establecer meta de ejercicio',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Get goals that are due soon (within specified days)
   */
  static async getUpcomingGoals(userId: string, daysAhead: number = 30): Promise<ExerciseGoals[]> {
    try {
      const supabase = createClient()
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + daysAhead)

      const { data, error } = await supabase
        .from('exercise_goals')
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .not('target_date', 'is', null)
        .lte('target_date', futureDate.toISOString().split('T')[0])
        .gte('target_date', new Date().toISOString().split('T')[0])
        .order('target_date', { ascending: true })

      if (error) {
        throw new AppError(
          'Error al cargar metas próximas',
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
        'Error inesperado al cargar metas próximas',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }
}