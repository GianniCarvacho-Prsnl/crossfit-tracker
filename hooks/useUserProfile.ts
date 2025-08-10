import { useState, useEffect } from 'react'
import { UserProfile, NewUserProfile, UpdateUserProfile } from '@/types/database'
import { UserProfileService } from '@/services/userProfileService'
import { AppError, ErrorType } from '@/utils/errorHandling'

interface UseUserProfileReturn {
  profile: UserProfile | null
  loading: boolean
  error: AppError | null
  refetch: () => Promise<void>
  createProfile: (profileData: NewUserProfile) => Promise<UserProfile>
  updateProfile: (updates: UpdateUserProfile) => Promise<UserProfile>
  uploadProfilePhoto: (file: File) => Promise<string>
  deleteProfile: () => Promise<void>
}

export function useUserProfile(userId: string): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)

  const fetchProfile = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      let data = await UserProfileService.getUserProfile(userId)
      
      // If profile doesn't exist, create a default one
      if (!data) {
        data = await UserProfileService.createUserProfile({
          user_id: userId,
          display_name: null,
          profile_photo_url: null,
          weight_kg: null,
          height_cm: null,
          gender: null,
          experience_level: null,
          birth_date: null
        })
      }
      
      setProfile(data)
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError(
        'Error al cargar perfil de usuario',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      ))
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (profileData: NewUserProfile): Promise<UserProfile> => {
    try {
      setError(null)
      const newProfile = await UserProfileService.createUserProfile(profileData)
      setProfile(newProfile)
      return newProfile
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al crear perfil de usuario',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  const updateProfile = async (updates: UpdateUserProfile): Promise<UserProfile> => {
    try {
      setError(null)
      const updatedProfile = await UserProfileService.updateUserProfile(userId, updates)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al actualizar perfil de usuario',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  const uploadProfilePhoto = async (file: File): Promise<string> => {
    try {
      setError(null)
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new AppError(
          'Formato de imagen no válido. Use JPG, PNG o WebP.',
          ErrorType.VALIDATION,
          'Invalid file type'
        )
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        throw new AppError(
          'La imagen es demasiado grande. Máximo 5MB.',
          ErrorType.VALIDATION,
          'File too large'
        )
      }

      const photoUrl = await UserProfileService.uploadProfilePhoto(userId, file)
      
      // Update profile with new photo URL
      if (profile) {
        await updateProfile({ profile_photo_url: photoUrl })
      }

      return photoUrl
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al subir foto de perfil',
        ErrorType.STORAGE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  const deleteProfile = async (): Promise<void> => {
    try {
      setError(null)
      await UserProfileService.deleteUserProfile(userId)
      setProfile(null)
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al eliminar perfil de usuario',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [userId])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    createProfile,
    updateProfile,
    uploadProfilePhoto,
    deleteProfile
  }
}