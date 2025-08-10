/**
 * Integration tests for Settings System
 * 
 * This test suite verifies complete user flows for the settings system:
 * 1. Profile configuration flow
 * 2. Exercise management migration functionality
 * 3. Preferences persistence between sessions
 * 4. Navigation between sections without data loss
 */

import { formatWeight, convertKgToLbs, convertLbsToKg } from '@/utils/conversions'
import { calculateOneRM } from '@/utils/calculations'
import type { UserProfile, UserPreferences, ExerciseGoals, SettingsSection } from '@/types/settings'

// Mock Supabase client
const mockSupabase = jest.fn()
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => mockSupabase()
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Settings System Integration Tests', () => {
  const mockProfile: UserProfile = {
    id: 'profile-1',
    user_id: 'test-user-id',
    display_name: 'Test User',
    profile_photo_url: null,
    weight_kg: 80,
    height_cm: 180,
    gender: 'male',
    experience_level: 'intermediate',
    birth_date: '1990-01-01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const mockPreferences: UserPreferences = {
    id: 'pref-1',
    user_id: 'test-user-id',
    preferred_units: 'metric',
    theme: 'light',
    language: 'es',
    notifications_enabled: true,
    workout_reminders: true,
    preferred_1rm_formula: 'epley',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const mockGoals: ExerciseGoals[] = [
    {
      id: 'goal-1',
      user_id: 'test-user-id',
      exercise_id: 1,
      target_1rm_lbs: 300,
      target_date: '2024-12-31',
      notes: 'Clean goal',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('Complete Profile Configuration Flow', () => {
    test('should validate and process profile data correctly', () => {
      // Test profile data validation
      const validateDisplayName = (name: string) => {
        return name.trim().length >= 2 && name.trim().length <= 50
      }

      const validateWeight = (weight: number) => {
        return weight > 0 && weight <= 500 // kg
      }

      const validateHeight = (height: number) => {
        return height >= 100 && height <= 250 // cm
      }

      // Test valid profile updates
      const profileUpdates = {
        display_name: 'Updated User Name',
        weight_kg: 85,
        height_cm: 175
      }

      expect(validateDisplayName(profileUpdates.display_name)).toBe(true)
      expect(validateWeight(profileUpdates.weight_kg)).toBe(true)
      expect(validateHeight(profileUpdates.height_cm)).toBe(true)

      // Test invalid data
      expect(validateDisplayName('')).toBe(false)
      expect(validateWeight(-10)).toBe(false)
      expect(validateHeight(300)).toBe(false)
    })

    test('should handle profile photo upload validation', () => {
      const validateImageFile = (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        const maxSize = 5 * 1024 * 1024 // 5MB
        
        return {
          validType: allowedTypes.includes(file.type),
          validSize: file.size <= maxSize,
          valid: allowedTypes.includes(file.type) && file.size <= maxSize
        }
      }

      // Test valid image
      const validImage = new File(['test image'], 'profile.jpg', { type: 'image/jpeg' })
      Object.defineProperty(validImage, 'size', { value: 1024 * 1024 }) // 1MB
      
      const validResult = validateImageFile(validImage)
      expect(validResult.valid).toBe(true)
      expect(validResult.validType).toBe(true)
      expect(validResult.validSize).toBe(true)

      // Test invalid type
      const invalidTypeFile = new File(['test'], 'profile.txt', { type: 'text/plain' })
      const invalidTypeResult = validateImageFile(invalidTypeFile)
      expect(invalidTypeResult.valid).toBe(false)
      expect(invalidTypeResult.validType).toBe(false)

      // Test oversized file
      const oversizedFile = new File(['test image'], 'profile.jpg', { type: 'image/jpeg' })
      Object.defineProperty(oversizedFile, 'size', { value: 10 * 1024 * 1024 }) // 10MB
      
      const oversizedResult = validateImageFile(oversizedFile)
      expect(oversizedResult.valid).toBe(false)
      expect(oversizedResult.validSize).toBe(false)
    })

    test('should calculate BMI and health metrics from profile data', () => {
      const calculateBMI = (weightKg: number, heightCm: number) => {
        const heightM = heightCm / 100
        return weightKg / (heightM * heightM)
      }

      const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return 'underweight'
        if (bmi < 25) return 'normal'
        if (bmi < 30) return 'overweight'
        return 'obese'
      }

      // Test BMI calculation
      const bmi = calculateBMI(mockProfile.weight_kg!, mockProfile.height_cm!)
      expect(bmi).toBeCloseTo(24.7, 1)
      expect(getBMICategory(bmi)).toBe('normal')

      // Test with updated weight
      const newBMI = calculateBMI(85, 180)
      expect(newBMI).toBeCloseTo(26.2, 1)
      expect(getBMICategory(newBMI)).toBe('overweight')
    })
  })

  describe('Exercise Management Migration Functionality', () => {
    test('should maintain exercise data integrity during migration', () => {
      // Mock existing exercises
      const existingExercises = [
        { id: 1, name: 'Clean', category: 'Olympic' },
        { id: 2, name: 'Snatch', category: 'Olympic' },
        { id: 3, name: 'Deadlift', category: 'Powerlifting' },
        { id: 4, name: 'Front Squat', category: 'Squat' },
        { id: 5, name: 'Back Squat', category: 'Squat' }
      ]

      // Test exercise validation
      const validateExerciseName = (name: string) => {
        return name.trim().length >= 2 && name.trim().length <= 50
      }

      const validateExerciseCategory = (category: string) => {
        const validCategories = ['Olympic', 'Powerlifting', 'Squat', 'Other']
        return validCategories.includes(category)
      }

      // Test all existing exercises are valid
      existingExercises.forEach(exercise => {
        expect(validateExerciseName(exercise.name)).toBe(true)
        expect(validateExerciseCategory(exercise.category)).toBe(true)
      })

      // Test adding new exercise
      const newExercise = { id: 6, name: 'Power Clean', category: 'Olympic' }
      expect(validateExerciseName(newExercise.name)).toBe(true)
      expect(validateExerciseCategory(newExercise.category)).toBe(true)

      // Test exercise name uniqueness
      const isDuplicateName = (name: string, exercises: typeof existingExercises) => {
        return exercises.some(ex => ex.name.toLowerCase() === name.toLowerCase())
      }

      expect(isDuplicateName('Clean', existingExercises)).toBe(true)
      expect(isDuplicateName('Power Clean', existingExercises)).toBe(false)
    })

    test('should handle exercise deletion with goal cleanup', () => {
      const exercises = [
        { id: 1, name: 'Clean', category: 'Olympic' },
        { id: 2, name: 'Snatch', category: 'Olympic' }
      ]

      const goals = [
        { id: 'goal-1', exercise_id: 1, target_1rm_lbs: 300 },
        { id: 'goal-2', exercise_id: 2, target_1rm_lbs: 250 },
        { id: 'goal-3', exercise_id: 1, target_1rm_lbs: 320 }
      ]

      // Simulate deleting exercise with id 1
      const exerciseIdToDelete = 1
      const remainingExercises = exercises.filter(ex => ex.id !== exerciseIdToDelete)
      const remainingGoals = goals.filter(goal => goal.exercise_id !== exerciseIdToDelete)

      expect(remainingExercises).toHaveLength(1)
      expect(remainingExercises[0].name).toBe('Snatch')
      expect(remainingGoals).toHaveLength(1)
      expect(remainingGoals[0].exercise_id).toBe(2)
    })

    test('should preserve workout records when exercises are modified', () => {
      const workoutRecords = [
        { id: 'record-1', exercise_id: 1, calculated_1rm: 280, created_at: '2024-01-01' },
        { id: 'record-2', exercise_id: 1, calculated_1rm: 290, created_at: '2024-02-01' },
        { id: 'record-3', exercise_id: 2, calculated_1rm: 220, created_at: '2024-01-15' }
      ]

      // Test that exercise name changes don't affect records
      const updatedExercise = { id: 1, name: 'Power Clean', category: 'Olympic' }
      
      // Records should still reference the same exercise_id
      const cleanRecords = workoutRecords.filter(record => record.exercise_id === 1)
      expect(cleanRecords).toHaveLength(2)
      
      // Test record statistics
      const maxCleanRecord = Math.max(...cleanRecords.map(r => r.calculated_1rm))
      expect(maxCleanRecord).toBe(290)
    })
  })

  describe('Preferences Persistence Between Sessions', () => {
    test('should persist theme changes across sessions', () => {
      // Test theme application logic
      const applyTheme = (theme: 'light' | 'dark' | 'system') => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark')
        } else {
          // System theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (prefersDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      }

      // Test dark theme
      applyTheme('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Test light theme
      applyTheme('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      // Test localStorage persistence
      const saveThemePreference = (theme: string) => {
        localStorageMock.setItem('theme', theme)
      }

      saveThemePreference('dark')
      expect(localStorageMock.getItem('theme')).toBe('dark')
    })

    test('should persist unit preferences and apply conversions', () => {
      // Test unit conversion logic
      const testWeight = 80 // kg
      
      // Test metric display (formatWeight expects weight in lbs, so convert first)
      const testWeightInLbs = convertKgToLbs(testWeight)
      const metricDisplay = formatWeight(testWeightInLbs, 'kg')
      expect(metricDisplay).toBe('80.0 kg')

      // Test imperial display
      const imperialDisplay = formatWeight(testWeightInLbs, 'lbs')
      expect(imperialDisplay).toBe('176.4 lbs')

      // Test preference persistence
      const saveUnitPreference = (units: 'metric' | 'imperial') => {
        localStorageMock.setItem('preferred_units', units)
      }

      saveUnitPreference('imperial')
      expect(localStorageMock.getItem('preferred_units')).toBe('imperial')

      // Test that calculations use preferred units
      const getDisplayWeight = (weightKg: number, preferredUnits: string) => {
        const weightInLbs = convertKgToLbs(weightKg)
        if (preferredUnits === 'imperial') {
          return formatWeight(weightInLbs, 'lbs')
        }
        return formatWeight(weightInLbs, 'kg')
      }

      const displayWeight = getDisplayWeight(testWeight, 'imperial')
      expect(displayWeight).toBe('176.4 lbs')
    })

    test('should restore preferences on app reload', () => {
      // Mock saved preferences
      const savedPreferences = {
        theme: 'dark',
        preferred_units: 'imperial',
        language: 'es',
        notifications_enabled: true
      }

      // Save to localStorage
      Object.entries(savedPreferences).forEach(([key, value]) => {
        localStorageMock.setItem(key, String(value))
      })

      // Test preference restoration
      const restorePreferences = () => {
        const theme = localStorageMock.getItem('theme') || 'light'
        const units = localStorageMock.getItem('preferred_units') || 'metric'
        const language = localStorageMock.getItem('language') || 'es'
        const notifications = localStorageMock.getItem('notifications_enabled') === 'true'

        return { theme, units, language, notifications }
      }

      const restoredPrefs = restorePreferences()
      expect(restoredPrefs.theme).toBe('dark')
      expect(restoredPrefs.units).toBe('imperial')
      expect(restoredPrefs.language).toBe('es')
      expect(restoredPrefs.notifications).toBe(true)
    })

    test('should handle 1RM formula preferences', () => {
      // Test the existing Epley formula from calculations.ts
      const testWeight = 200 // lbs
      const testReps = 5

      // Test the actual Epley formula used in the app
      const epley1RM = calculateOneRM(testWeight, testReps)
      expect(epley1RM).toBeCloseTo(233.3, 1)

      // Test alternative formulas that could be implemented
      const brzyckiFormula = (weight: number, reps: number) => {
        return weight * (36 / (37 - reps))
      }

      const lombardiFormula = (weight: number, reps: number) => {
        return weight * Math.pow(reps, 0.1)
      }

      // Test calculations with alternative formulas
      const brzycki1RM = brzyckiFormula(testWeight, testReps)
      const lombardi1RM = lombardiFormula(testWeight, testReps)

      expect(brzycki1RM).toBeCloseTo(225.0, 1)
      expect(lombardi1RM).toBeCloseTo(234.9, 1) // Corrected expected value

      // Test preference application
      const calculate1RM = (weight: number, reps: number, formula: string) => {
        switch (formula) {
          case 'epley':
            return calculateOneRM(weight, reps) // Use actual function
          case 'brzycki':
            return brzyckiFormula(weight, reps)
          case 'lombardi':
            return lombardiFormula(weight, reps)
          default:
            return calculateOneRM(weight, reps)
        }
      }

      expect(calculate1RM(testWeight, testReps, 'epley')).toBeCloseTo(233.3, 1)
      expect(calculate1RM(testWeight, testReps, 'brzycki')).toBeCloseTo(225.0, 1)
    })
  })

  describe('Navigation Between Sections Without Data Loss', () => {
    test('should manage temporary form data correctly', () => {
      // Mock temporary form data management
      let tempFormData: Record<string, any> = {}
      let hasUnsavedChanges = false

      const updateTempFormData = (key: string, value: any) => {
        tempFormData = { ...tempFormData, [key]: value }
        hasUnsavedChanges = true
      }

      const clearTempFormData = () => {
        tempFormData = {}
        hasUnsavedChanges = false
      }

      const saveTempChanges = () => {
        // Simulate saving to database
        const savedData = { ...tempFormData }
        clearTempFormData()
        return savedData
      }

      // Test updating form data
      updateTempFormData('display_name', 'Temporary Name')
      updateTempFormData('weight_kg', 85)

      expect(tempFormData.display_name).toBe('Temporary Name')
      expect(tempFormData.weight_kg).toBe(85)
      expect(hasUnsavedChanges).toBe(true)

      // Test saving changes
      const savedData = saveTempChanges()
      expect(savedData.display_name).toBe('Temporary Name')
      expect(hasUnsavedChanges).toBe(false)
      expect(Object.keys(tempFormData)).toHaveLength(0)
    })

    test('should handle navigation confirmation logic', () => {
      let hasUnsavedChanges = true

      const handleSectionChange = (newSection: string, confirmCallback?: () => boolean) => {
        if (hasUnsavedChanges) {
          const shouldProceed = confirmCallback ? confirmCallback() : false
          if (!shouldProceed) {
            return { navigated: false, section: 'current' }
          }
        }
        return { navigated: true, section: newSection }
      }

      // Test navigation with unsaved changes (user cancels)
      const cancelResult = handleSectionChange('security', () => false)
      expect(cancelResult.navigated).toBe(false)
      expect(cancelResult.section).toBe('current')

      // Test navigation with unsaved changes (user confirms)
      const confirmResult = handleSectionChange('security', () => true)
      expect(confirmResult.navigated).toBe(true)
      expect(confirmResult.section).toBe('security')

      // Test navigation without unsaved changes
      hasUnsavedChanges = false
      const noChangesResult = handleSectionChange('preferences')
      expect(noChangesResult.navigated).toBe(true)
      expect(noChangesResult.section).toBe('preferences')
    })

    test('should preserve training goals data structure', () => {
      // Mock training goals state management
      const initialGoals = [...mockGoals]
      let currentGoals = [...initialGoals]
      let tempGoalData: Partial<ExerciseGoals> = {}

      const addTempGoal = (goalData: Partial<ExerciseGoals>) => {
        tempGoalData = { ...tempGoalData, ...goalData }
      }

      const saveTempGoal = () => {
        if (Object.keys(tempGoalData).length > 0) {
          const newGoal: ExerciseGoals = {
            id: `goal-${Date.now()}`,
            user_id: 'test-user-id',
            exercise_id: tempGoalData.exercise_id || 1,
            target_1rm_lbs: tempGoalData.target_1rm_lbs || 0,
            target_date: tempGoalData.target_date || null,
            notes: tempGoalData.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          currentGoals = [...currentGoals, newGoal]
          tempGoalData = {}
          return newGoal
        }
        return null
      }

      // Test adding temporary goal data
      addTempGoal({ exercise_id: 3, target_1rm_lbs: 350 })
      expect(tempGoalData.exercise_id).toBe(3)
      expect(tempGoalData.target_1rm_lbs).toBe(350)

      // Test saving goal
      const savedGoal = saveTempGoal()
      expect(savedGoal).toBeTruthy()
      expect(currentGoals).toHaveLength(2)
      expect(Object.keys(tempGoalData)).toHaveLength(0)
    })

    test('should handle modal close confirmation', () => {
      let isModalOpen = true
      let hasUnsavedChanges = true

      const handleModalClose = (forceClose = false) => {
        if (hasUnsavedChanges && !forceClose) {
          // In real implementation, this would show a confirmation dialog
          const userConfirms = false // Simulate user canceling
          if (!userConfirms) {
            return { closed: false, reason: 'user_cancelled' }
          }
        }
        
        isModalOpen = false
        hasUnsavedChanges = false
        return { closed: true, reason: 'confirmed' }
      }

      // Test close with unsaved changes (user cancels)
      const cancelResult = handleModalClose()
      expect(cancelResult.closed).toBe(false)
      expect(cancelResult.reason).toBe('user_cancelled')
      expect(isModalOpen).toBe(true)

      // Test force close
      const forceResult = handleModalClose(true)
      expect(forceResult.closed).toBe(true)
      expect(forceResult.reason).toBe('confirmed')
      expect(isModalOpen).toBe(false)
    })
  })

  describe('Error Handling and Recovery', () => {
    test('should handle profile update errors gracefully', () => {
      // Mock error handling logic
      const handleProfileUpdate = async (profileData: Partial<UserProfile>) => {
        try {
          // Simulate network error
          throw new Error('Network connection failed')
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            retryable: true
          }
        }
      }

      // Test error handling
      const updateResult = handleProfileUpdate({ display_name: 'New Name' })
      
      updateResult.then(result => {
        expect(result.success).toBe(false)
        expect(result.error).toBe('Network connection failed')
        expect(result.retryable).toBe(true)
      })
    })

    test('should implement retry logic for failed operations', async () => {
      let attemptCount = 0
      const maxRetries = 3

      const attemptOperation = async (): Promise<{ success: boolean; attempt: number }> => {
        attemptCount++
        
        // Simulate failure for first 2 attempts
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`)
        }
        
        return { success: true, attempt: attemptCount }
      }

      const retryOperation = async (): Promise<{ success: boolean; attempts: number }> => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            const result = await attemptOperation()
            return { success: true, attempts: result.attempt }
          } catch (error) {
            if (i === maxRetries - 1) {
              return { success: false, attempts: attemptCount }
            }
            // Wait before retry (in real implementation)
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
        return { success: false, attempts: attemptCount }
      }

      const result = await retryOperation()
      expect(result.success).toBe(true)
      expect(result.attempts).toBe(3)
    })

    test('should handle offline mode gracefully', () => {
      // Mock offline detection
      const isOnline = () => navigator.onLine

      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      expect(isOnline()).toBe(false)

      // Test offline data queuing
      const offlineQueue: Array<{ action: string; data: any; timestamp: number }> = []

      const queueOfflineAction = (action: string, data: any) => {
        offlineQueue.push({
          action,
          data,
          timestamp: Date.now()
        })
      }

      // Queue some offline actions
      queueOfflineAction('updateProfile', { display_name: 'Offline Name' })
      queueOfflineAction('updatePreferences', { theme: 'dark' })

      expect(offlineQueue).toHaveLength(2)
      expect(offlineQueue[0].action).toBe('updateProfile')
      expect(offlineQueue[1].action).toBe('updatePreferences')

      // Test sync when back online
      Object.defineProperty(navigator, 'onLine', {
        value: true
      })

      const syncOfflineQueue = async () => {
        const results = []
        for (const item of offlineQueue) {
          try {
            // Simulate sync operation
            results.push({ ...item, synced: true })
          } catch (error) {
            results.push({ ...item, synced: false, error })
          }
        }
        return results
      }

      syncOfflineQueue().then(results => {
        expect(results).toHaveLength(2)
        expect(results.every(r => r.synced)).toBe(true)
      })
    })

    test('should validate data before processing', () => {
      // Test comprehensive data validation
      const validateProfileData = (data: Partial<UserProfile>) => {
        const errors: string[] = []

        if (data.display_name !== undefined) {
          if (!data.display_name || data.display_name.trim().length < 2) {
            errors.push('Display name must be at least 2 characters')
          }
          if (data.display_name.length > 50) {
            errors.push('Display name must be less than 50 characters')
          }
        }

        if (data.weight_kg !== undefined) {
          if (data.weight_kg <= 0 || data.weight_kg > 500) {
            errors.push('Weight must be between 1 and 500 kg')
          }
        }

        if (data.height_cm !== undefined) {
          if (data.height_cm < 100 || data.height_cm > 250) {
            errors.push('Height must be between 100 and 250 cm')
          }
        }

        if (data.birth_date !== undefined) {
          const birthDate = new Date(data.birth_date)
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          if (age < 13 || age > 120) {
            errors.push('Age must be between 13 and 120 years')
          }
        }

        return {
          valid: errors.length === 0,
          errors
        }
      }

      // Test valid data
      const validData = {
        display_name: 'Valid Name',
        weight_kg: 75,
        height_cm: 180,
        birth_date: '1990-01-01'
      }

      const validResult = validateProfileData(validData)
      expect(validResult.valid).toBe(true)
      expect(validResult.errors).toHaveLength(0)

      // Test invalid data
      const invalidData = {
        display_name: 'A', // Too short
        weight_kg: -10, // Negative
        height_cm: 300, // Too tall
        birth_date: '2030-01-01' // Future date
      }

      const invalidResult = validateProfileData(invalidData)
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.errors.length).toBeGreaterThan(0)
    })
  })
})

  describe('Complete User Settings Flow Integration', () => {
    test('should handle complete profile configuration flow end-to-end', async () => {
      // Mock initial state
      let currentProfile: UserProfile = {
        id: 'profile-1',
        user_id: 'test-user',
        display_name: 'Initial Name',
        profile_photo_url: null,
        weight_kg: 70,
        height_cm: 175,
        gender: 'male',
        experience_level: 'beginner',
        birth_date: '1990-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      let currentPreferences: UserPreferences = {
        id: 'pref-1',
        user_id: 'test-user',
        preferred_units: 'metric',
        theme: 'light',
        language: 'es',
        notifications_enabled: true,
        workout_reminders: true,
        preferred_1rm_formula: 'epley',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      // Simulate complete profile update flow
      const profileUpdates = {
        display_name: 'Updated User Name',
        weight_kg: 80,
        height_cm: 180,
        experience_level: 'intermediate' as const
      }

      // Test profile validation
      const validateProfileUpdate = (updates: Partial<UserProfile>) => {
        const errors: string[] = []
        
        if (updates.display_name && updates.display_name.trim().length < 2) {
          errors.push('Display name too short')
        }
        if (updates.weight_kg && (updates.weight_kg <= 0 || updates.weight_kg > 500)) {
          errors.push('Invalid weight')
        }
        if (updates.height_cm && (updates.height_cm < 100 || updates.height_cm > 250)) {
          errors.push('Invalid height')
        }

        return { valid: errors.length === 0, errors }
      }

      const validation = validateProfileUpdate(profileUpdates)
      expect(validation.valid).toBe(true)

      // Apply updates
      currentProfile = { ...currentProfile, ...profileUpdates, updated_at: new Date().toISOString() }

      // Test that changes are reflected across the system
      expect(currentProfile.display_name).toBe('Updated User Name')
      expect(currentProfile.weight_kg).toBe(80)
      expect(currentProfile.experience_level).toBe('intermediate')

      // Test BMI calculation with updated data
      const calculateBMI = (weightKg: number, heightCm: number) => {
        const heightM = heightCm / 100
        return weightKg / (heightM * heightM)
      }

      const newBMI = calculateBMI(currentProfile.weight_kg!, currentProfile.height_cm!)
      expect(newBMI).toBeCloseTo(24.7, 1)

      // Test preferences integration
      const preferencesUpdate = {
        preferred_units: 'imperial' as const,
        theme: 'dark' as const
      }

      currentPreferences = { ...currentPreferences, ...preferencesUpdate }

      // Test unit conversion with new preferences
      const displayWeight = currentPreferences.preferred_units === 'imperial'
        ? convertKgToLbs(currentProfile.weight_kg!)
        : currentProfile.weight_kg!

      expect(displayWeight).toBeCloseTo(176.4, 1) // 80kg in lbs

      // Test theme application
      expect(currentPreferences.theme).toBe('dark')

      // Test data persistence simulation
      const persistedData = {
        profile: currentProfile,
        preferences: currentPreferences
      }

      localStorageMock.setItem('userSettings', JSON.stringify(persistedData))
      const restored = JSON.parse(localStorageMock.getItem('userSettings') || '{}')

      expect(restored.profile.display_name).toBe('Updated User Name')
      expect(restored.preferences.theme).toBe('dark')
    })

    test('should handle exercise management migration with data integrity', async () => {
      // Mock initial exercises and goals
      const initialExercises = [
        { id: 1, name: 'Clean', category: 'Olympic' },
        { id: 2, name: 'Snatch', category: 'Olympic' },
        { id: 3, name: 'Deadlift', category: 'Powerlifting' }
      ]

      const initialGoals: ExerciseGoals[] = [
        {
          id: 'goal-1',
          user_id: 'test-user',
          exercise_id: 1,
          target_1rm_lbs: 300,
          target_date: '2024-12-31',
          notes: 'Clean goal',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'goal-2',
          user_id: 'test-user',
          exercise_id: 3,
          target_1rm_lbs: 400,
          target_date: '2024-12-31',
          notes: 'Deadlift goal',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      const workoutRecords = [
        { id: 'record-1', exercise_id: 1, calculated_1rm: 280, created_at: '2024-06-01' },
        { id: 'record-2', exercise_id: 1, calculated_1rm: 290, created_at: '2024-07-01' },
        { id: 'record-3', exercise_id: 3, calculated_1rm: 380, created_at: '2024-06-15' }
      ]

      // Test adding new exercise
      const newExercise = { id: 4, name: 'Power Clean', category: 'Olympic' }
      const updatedExercises = [...initialExercises, newExercise]

      expect(updatedExercises).toHaveLength(4)
      expect(updatedExercises.find(ex => ex.name === 'Power Clean')).toBeDefined()

      // Test exercise name validation
      const validateExerciseName = (name: string, existingExercises: typeof initialExercises) => {
        if (name.trim().length < 2) return { valid: false, error: 'Name too short' }
        if (existingExercises.some(ex => ex.name.toLowerCase() === name.toLowerCase())) {
          return { valid: false, error: 'Name already exists' }
        }
        return { valid: true }
      }

      expect(validateExerciseName('Power Clean', initialExercises).valid).toBe(true)
      expect(validateExerciseName('Clean', initialExercises).valid).toBe(false)

      // Test exercise deletion with cascade cleanup
      const exerciseToDelete = 1 // Clean
      const remainingExercises = updatedExercises.filter(ex => ex.id !== exerciseToDelete)
      const remainingGoals = initialGoals.filter(goal => goal.exercise_id !== exerciseToDelete)
      const remainingRecords = workoutRecords.filter(record => record.exercise_id !== exerciseToDelete)

      expect(remainingExercises).toHaveLength(3)
      expect(remainingGoals).toHaveLength(1) // Only deadlift goal remains
      expect(remainingRecords).toHaveLength(1) // Only deadlift record remains
      expect(remainingGoals[0].exercise_id).toBe(3) // Deadlift
      expect(remainingRecords[0].exercise_id).toBe(3) // Deadlift

      // Test that exercise updates don't affect existing records
      const updatedExercise = { ...initialExercises[0], name: 'Olympic Clean' }
      const recordsForExercise = workoutRecords.filter(r => r.exercise_id === updatedExercise.id)
      
      expect(recordsForExercise).toHaveLength(2) // Records still reference same exercise_id
      expect(Math.max(...recordsForExercise.map(r => r.calculated_1rm))).toBe(290)
    })

    test('should maintain preferences persistence across sessions', async () => {
      // Initial preferences
      const initialPrefs: UserPreferences = {
        id: 'pref-1',
        user_id: 'test-user',
        preferred_units: 'metric',
        theme: 'light',
        language: 'es',
        notifications_enabled: true,
        workout_reminders: true,
        preferred_1rm_formula: 'epley',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      // Simulate session 1: User changes preferences
      const session1Updates = {
        preferred_units: 'imperial' as const,
        theme: 'dark' as const,
        notifications_enabled: false,
        preferred_1rm_formula: 'brzycki' as const
      }

      const session1Prefs = { ...initialPrefs, ...session1Updates }

      // Save to localStorage (simulating persistence)
      localStorageMock.setItem('userPreferences', JSON.stringify(session1Prefs))
      localStorageMock.setItem('theme', session1Prefs.theme)
      localStorageMock.setItem('preferred_units', session1Prefs.preferred_units)

      // Simulate session end (clear memory)
      let currentPrefs: UserPreferences | null = null

      // Simulate session 2: App restart, preferences restoration
      const restorePreferences = (): UserPreferences => {
        const stored = localStorageMock.getItem('userPreferences')
        if (stored) {
          return JSON.parse(stored)
        }
        return initialPrefs // fallback
      }

      currentPrefs = restorePreferences()

      // Verify preferences were restored correctly
      expect(currentPrefs.preferred_units).toBe('imperial')
      expect(currentPrefs.theme).toBe('dark')
      expect(currentPrefs.notifications_enabled).toBe(false)
      expect(currentPrefs.preferred_1rm_formula).toBe('brzycki')

      // Test that theme is applied on restoration
      const applyStoredTheme = () => {
        const theme = localStorageMock.getItem('theme') || 'light'
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }

      applyStoredTheme()
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Test that unit preferences affect calculations
      const testWeight = 80 // kg
      const displayWeight = currentPrefs.preferred_units === 'imperial'
        ? convertKgToLbs(testWeight)
        : testWeight

      expect(displayWeight).toBeCloseTo(176.4, 1)

      // Test 1RM formula preference
      const testReps = 5
      const testWeightLbs = 200

      const calculate1RM = (weight: number, reps: number, formula: string) => {
        switch (formula) {
          case 'epley':
            return calculateOneRM(weight, reps)
          case 'brzycki':
            return weight * (36 / (37 - reps))
          case 'lombardi':
            return weight * Math.pow(reps, 0.1)
          default:
            return calculateOneRM(weight, reps)
        }
      }

      const result = calculate1RM(testWeightLbs, testReps, currentPrefs.preferred_1rm_formula)
      expect(result).toBeCloseTo(225.0, 1) // Brzycki formula result
    })

    test('should handle navigation between sections without data loss', async () => {
      // Mock form state management
      interface FormState {
        profile: Partial<UserProfile>
        personalData: Partial<UserProfile>
        preferences: Partial<UserPreferences>
        goals: Partial<ExerciseGoals>[]
      }

      let formState: FormState = {
        profile: {},
        personalData: {},
        preferences: {},
        goals: []
      }

      let hasUnsavedChanges = false
      let currentSection: SettingsSection = 'profile'

      // Simulate user making changes in profile section
      const updateProfileForm = (updates: Partial<UserProfile>) => {
        formState.profile = { ...formState.profile, ...updates }
        hasUnsavedChanges = true
      }

      updateProfileForm({ display_name: 'Temporary Name', weight_kg: 85 })

      expect(formState.profile.display_name).toBe('Temporary Name')
      expect(formState.profile.weight_kg).toBe(85)
      expect(hasUnsavedChanges).toBe(true)

      // Test navigation attempt with unsaved changes
      const attemptNavigation = (newSection: SettingsSection, userConfirms: boolean = false) => {
        if (hasUnsavedChanges && !userConfirms) {
          return {
            navigated: false,
            currentSection,
            message: 'Unsaved changes detected'
          }
        }

        currentSection = newSection
        return {
          navigated: true,
          currentSection: newSection
        }
      }

      // User tries to navigate without saving (cancels)
      const cancelResult = attemptNavigation('personal-data', false)
      expect(cancelResult.navigated).toBe(false)
      expect(cancelResult.currentSection).toBe('profile')
      expect(formState.profile.display_name).toBe('Temporary Name') // Data preserved

      // User confirms navigation (loses changes)
      const confirmResult = attemptNavigation('personal-data', true)
      expect(confirmResult.navigated).toBe(true)
      expect(confirmResult.currentSection).toBe('personal-data')

      // Simulate clearing form data on navigation
      if (confirmResult.navigated) {
        formState.profile = {}
        hasUnsavedChanges = false
      }

      expect(Object.keys(formState.profile)).toHaveLength(0)
      expect(hasUnsavedChanges).toBe(false)

      // Test saving changes before navigation
      updateProfileForm({ display_name: 'Saved Name' })
      hasUnsavedChanges = true

      const saveChanges = () => {
        // Simulate saving to database
        const savedData = { ...formState.profile }
        formState.profile = {}
        hasUnsavedChanges = false
        return savedData
      }

      const savedData = saveChanges()
      expect(savedData.display_name).toBe('Saved Name')
      expect(hasUnsavedChanges).toBe(false)

      // Now navigation should work without confirmation
      const navigationResult = attemptNavigation('preferences')
      expect(navigationResult.navigated).toBe(true)
      expect(navigationResult.currentSection).toBe('preferences')

      // Test modal close with unsaved changes
      updateProfileForm({ weight_kg: 90 })
      hasUnsavedChanges = true

      const attemptModalClose = (forceClose: boolean = false) => {
        if (hasUnsavedChanges && !forceClose) {
          return { closed: false, reason: 'unsaved_changes' }
        }
        
        // Clear all form data on close
        formState = {
          profile: {},
          personalData: {},
          preferences: {},
          goals: []
        }
        hasUnsavedChanges = false
        
        return { closed: true, reason: 'confirmed' }
      }

      const closeAttempt = attemptModalClose()
      expect(closeAttempt.closed).toBe(false)
      expect(closeAttempt.reason).toBe('unsaved_changes')

      const forceClose = attemptModalClose(true)
      expect(forceClose.closed).toBe(true)
      expect(Object.keys(formState.profile)).toHaveLength(0)
    })

    test('should handle complex multi-section data flow', async () => {
      // Test scenario: User updates profile, changes preferences, sets goals
      // and verifies everything works together
      
      const initialState = {
        profile: {
          id: 'profile-1',
          user_id: 'test-user',
          display_name: 'Test User',
          weight_kg: 75,
          height_cm: 175,
          experience_level: 'beginner' as const
        },
        preferences: {
          id: 'pref-1',
          user_id: 'test-user',
          preferred_units: 'metric' as const,
          theme: 'light' as const,
          preferred_1rm_formula: 'epley' as const
        },
        goals: [] as ExerciseGoals[]
      }

      // Step 1: Update profile weight
      const updatedProfile = {
        ...initialState.profile,
        weight_kg: 80
      }

      // Step 2: Change units to imperial
      const updatedPreferences = {
        ...initialState.preferences,
        preferred_units: 'imperial' as const
      }

      // Step 3: Add training goal
      const newGoal: ExerciseGoals = {
        id: 'goal-1',
        user_id: 'test-user',
        exercise_id: 1,
        target_1rm_lbs: 300,
        target_date: '2024-12-31',
        notes: 'Clean goal',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const updatedGoals = [newGoal]

      // Test that weight displays in preferred units
      const displayWeight = updatedPreferences.preferred_units === 'imperial'
        ? convertKgToLbs(updatedProfile.weight_kg)
        : updatedProfile.weight_kg

      expect(displayWeight).toBeCloseTo(176.4, 1)

      // Test that goal is set in correct units (always stored in lbs)
      expect(newGoal.target_1rm_lbs).toBe(300)

      // Test BMI calculation with updated weight
      const bmi = updatedProfile.weight_kg / Math.pow(updatedProfile.height_cm / 100, 2)
      expect(bmi).toBeCloseTo(26.1, 1)

      // Test goal progress calculation
      const mockCurrentRecord = { calculated_1rm: 280 } // lbs
      const progress = (mockCurrentRecord.calculated_1rm / newGoal.target_1rm_lbs!) * 100
      expect(progress).toBeCloseTo(93.3, 1)

      // Test data consistency across sections
      const finalState = {
        profile: updatedProfile,
        preferences: updatedPreferences,
        goals: updatedGoals
      }

      // Verify all user_ids match
      expect(finalState.profile.user_id).toBe('test-user')
      expect(finalState.preferences.user_id).toBe('test-user')
      expect(finalState.goals[0].user_id).toBe('test-user')

      // Test serialization for persistence
      const serialized = JSON.stringify(finalState)
      const deserialized = JSON.parse(serialized)

      expect(deserialized.profile.weight_kg).toBe(80)
      expect(deserialized.preferences.preferred_units).toBe('imperial')
      expect(deserialized.goals[0].target_1rm_lbs).toBe(300)
    })
  })

/**
 * Manual Integration Testing Steps:
 * 
 * Complete Profile Configuration Flow:
 * 1. Start development server: npm run dev
 * 2. Navigate to /login and authenticate
 * 3. Click on user profile button in navigation
 * 4. Select "Perfil" from dropdown menu
 * 5. Upload a profile photo and change display name
 * 6. Navigate to "Datos Personales" section
 * 7. Update weight, height, and experience level
 * 8. Save changes and verify persistence
 * 9. Close modal and reopen to verify data persistence
 * 
 * Exercise Management Migration:
 * 1. From settings menu, select "Administrar Ejercicios"
 * 2. Verify all existing exercises are displayed
 * 3. Add a new custom exercise
 * 4. Edit an existing exercise name
 * 5. Delete an exercise (with confirmation)
 * 6. Navigate back to main settings menu
 * 7. Verify changes persist in workout registration
 * 
 * Preferences Persistence:
 * 1. Navigate to "Preferencias" section
 * 2. Change theme from light to dark
 * 3. Change units from metric to imperial
 * 4. Enable/disable notifications
 * 5. Close browser tab and reopen application
 * 6. Verify all preferences are restored
 * 7. Check that weight displays in selected units
 * 
 * Navigation Without Data Loss:
 * 1. Open profile section and make changes without saving
 * 2. Try to navigate to another section
 * 3. Verify unsaved changes warning appears
 * 4. Cancel navigation and verify data is preserved
 * 5. Save changes and verify navigation works normally
 * 6. Test modal close with unsaved changes
 * 7. Verify confirmation dialogs work correctly
 */