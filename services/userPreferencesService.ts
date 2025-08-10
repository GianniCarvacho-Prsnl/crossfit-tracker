import { createClient } from '@/utils/supabase/client'
import { UserPreferences, NewUserPreferences, UpdateUserPreferences } from '@/types/database'
import { AppError, ErrorType } from '@/utils/errorHandling'

export class UserPreferencesService {
  /**
   * Get user preferences by user ID
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Preferences not found
        }
        throw new AppError(
          'Error al cargar preferencias de usuario',
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
        'Error inesperado al cargar preferencias de usuario',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Create user preferences with defaults
   */
  static async createUserPreferences(userId: string, preferences?: Partial<NewUserPreferences>): Promise<UserPreferences> {
    try {
      const supabase = createClient()
      
      // Default preferences
      const defaultPreferences: NewUserPreferences = {
        user_id: userId,
        preferred_units: 'imperial',
        theme: 'system',
        language: 'es',
        notifications_enabled: true,
        workout_reminders: true,
        preferred_1rm_formula: 'epley',
        ...preferences
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .insert(defaultPreferences)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new AppError(
            'Ya existen preferencias para este usuario',
            ErrorType.VALIDATION,
            error.message
          )
        }
        throw new AppError(
          'Error al crear preferencias de usuario',
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
        'Error inesperado al crear preferencias de usuario',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId: string, updates: UpdateUserPreferences): Promise<UserPreferences> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw new AppError(
          'Error al actualizar preferencias de usuario',
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
        'Error inesperado al actualizar preferencias de usuario',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Get or create user preferences (ensures preferences always exist)
   */
  static async getOrCreateUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      // Try to get existing preferences
      let preferences = await this.getUserPreferences(userId)
      
      // If no preferences exist, create them with defaults
      if (!preferences) {
        preferences = await this.createUserPreferences(userId)
      }

      return preferences
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al obtener o crear preferencias de usuario',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Reset preferences to defaults
   */
  static async resetUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const defaultUpdates: UpdateUserPreferences = {
        preferred_units: 'imperial',
        theme: 'system',
        language: 'es',
        notifications_enabled: true,
        workout_reminders: true,
        preferred_1rm_formula: 'epley'
      }

      return await this.updateUserPreferences(userId, defaultUpdates)
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al restablecer preferencias de usuario',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Delete user preferences
   */
  static async deleteUserPreferences(userId: string): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId)

      if (error) {
        throw new AppError(
          'Error al eliminar preferencias de usuario',
          ErrorType.DATABASE,
          error.message
        )
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al eliminar preferencias de usuario',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }
}