import { useState, useEffect, useCallback } from 'react'
import { UserPreferences, NewUserPreferences, UpdateUserPreferences } from '@/types/database'
import { UserPreferencesService } from '@/services/userPreferencesService'
import { AppError, ErrorType } from '@/utils/errorHandling'
import { PreferencesCache, ThemeCache } from '@/utils/preferencesCache'

interface UseUserPreferencesReturn {
  preferences: UserPreferences | null
  loading: boolean
  error: AppError | null
  refetch: () => Promise<void>
  updatePreferences: (updates: UpdateUserPreferences) => Promise<UserPreferences>
  resetPreferences: () => Promise<UserPreferences>
  updateSinglePreference: <K extends keyof UpdateUserPreferences>(
    key: K, 
    value: UpdateUserPreferences[K]
  ) => Promise<UserPreferences>
}

export function useUserPreferences(userId: string): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)

  const fetchPreferences = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Try to get from cache first
      const cachedPreferences = PreferencesCache.get(userId)
      if (cachedPreferences) {
        setPreferences(cachedPreferences)
        setLoading(false)
        
        // Apply cached theme immediately
        applyTheme(cachedPreferences.theme)
        
        // Still fetch fresh data in background for next time
        UserPreferencesService.getOrCreateUserPreferences(userId)
          .then(freshData => {
            PreferencesCache.set(userId, freshData)
            // Only update state if data actually changed
            if (JSON.stringify(freshData) !== JSON.stringify(cachedPreferences)) {
              setPreferences(freshData)
            }
          })
          .catch(console.warn) // Silent background update failure
        
        return
      }
      
      // No cache, fetch from server
      const data = await UserPreferencesService.getOrCreateUserPreferences(userId)
      setPreferences(data)
      PreferencesCache.set(userId, data)
      
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError(
        'Error al cargar preferencias de usuario',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      ))
    } finally {
      setLoading(false)
    }
  }, [userId])

  const updatePreferences = async (updates: UpdateUserPreferences): Promise<UserPreferences> => {
    try {
      setError(null)
      
      // Optimistic update for immediate UI feedback
      if (preferences) {
        const optimisticUpdate = { ...preferences, ...updates }
        setPreferences(optimisticUpdate)
        PreferencesCache.set(userId, optimisticUpdate)
        
        // Apply theme change immediately if theme was updated
        if (updates.theme) {
          applyTheme(updates.theme)
        }
      }
      
      // Perform actual update
      const updatedPreferences = await UserPreferencesService.updateUserPreferences(userId, updates)
      setPreferences(updatedPreferences)
      PreferencesCache.set(userId, updatedPreferences)

      return updatedPreferences
    } catch (err) {
      // Revert optimistic update on error
      if (preferences) {
        setPreferences(preferences)
        PreferencesCache.set(userId, preferences)
      }
      
      const error = err instanceof AppError ? err : new AppError(
        'Error al actualizar preferencias de usuario',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  const updateSinglePreference = async <K extends keyof UpdateUserPreferences>(
    key: K, 
    value: UpdateUserPreferences[K]
  ): Promise<UserPreferences> => {
    return await updatePreferences({ [key]: value } as UpdateUserPreferences)
  }

  const resetPreferences = async (): Promise<UserPreferences> => {
    try {
      setError(null)
      const resetPrefs = await UserPreferencesService.resetUserPreferences(userId)
      setPreferences(resetPrefs)
      
      // Apply default theme
      applyTheme('system')
      
      return resetPrefs
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al restablecer preferencias de usuario',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  // Helper function to apply theme changes to the DOM
  const applyTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement
    
    if (theme === 'system') {
      // Remove any manually set theme classes and let system preference take over
      root.classList.remove('light', 'dark')
      
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      }
    } else {
      // Remove existing theme classes
      root.classList.remove('light', 'dark')
      // Add the selected theme
      root.classList.add(theme)
    }

    // Store in theme cache for immediate access
    ThemeCache.set(theme)
  }, [])

  // Initialize theme on preferences load
  useEffect(() => {
    if (preferences?.theme) {
      applyTheme(preferences.theme)
    }
  }, [preferences?.theme])

  // Listen for system theme changes when using system preference
  useEffect(() => {
    if (preferences?.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        if (e.matches) {
          root.classList.add('dark')
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [preferences?.theme])

  // Initialize theme from cache on mount for immediate application
  useEffect(() => {
    const cachedTheme = ThemeCache.get()
    if (cachedTheme) {
      applyTheme(cachedTheme)
    }
  }, [applyTheme])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  return {
    preferences,
    loading,
    error,
    refetch: fetchPreferences,
    updatePreferences,
    resetPreferences,
    updateSinglePreference
  }
}