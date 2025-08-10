import { createClient } from '@/utils/supabase/client'
import { UserProfile, NewUserProfile, UpdateUserProfile } from '@/types/database'
import { AppError, ErrorType } from '@/utils/errorHandling'

export class UserProfileService {
  /**
   * Get user profile by user ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Profile not found
        }
        throw new AppError(
          'Error al cargar perfil de usuario',
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
        'Error inesperado al cargar perfil de usuario',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Create user profile
   */
  static async createUserProfile(profile: NewUserProfile): Promise<UserProfile> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new AppError(
            'Ya existe un perfil para este usuario',
            ErrorType.VALIDATION,
            error.message
          )
        }
        throw new AppError(
          'Error al crear perfil de usuario',
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
        'Error inesperado al crear perfil de usuario',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<UserProfile> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw new AppError(
          'Error al actualizar perfil de usuario',
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
        'Error inesperado al actualizar perfil de usuario',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Delete user profile
   */
  static async deleteUserProfile(userId: string): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId)

      if (error) {
        throw new AppError(
          'Error al eliminar perfil de usuario',
          ErrorType.DATABASE,
          error.message
        )
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al eliminar perfil de usuario',
        ErrorType.UNKNOWN,
        error instanceof Error ? error : 'Unknown error'
      )
    }
  }

  /**
   * Upload profile photo and update profile
   */
  static async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    try {
      const supabase = createClient()
      
      // Generate unique filename with user folder structure
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/profile-${Date.now()}.${fileExt}`

      // First, try to delete any existing profile photo for this user
      const { data: existingFiles } = await supabase.storage
        .from('profile-photos')
        .list(userId)

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`)
        await supabase.storage
          .from('profile-photos')
          .remove(filesToDelete)
      }

      // Upload new file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new AppError(
          `Error al subir foto de perfil: ${uploadError.message}`,
          ErrorType.STORAGE,
          uploadError.message
        )
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Upload profile photo error:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        'Error inesperado al subir foto de perfil',
        ErrorType.UNKNOWN,
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }
}