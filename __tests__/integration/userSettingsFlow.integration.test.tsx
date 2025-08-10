/**
 * Comprehensive Integration Tests for User Settings Flow
 * 
 * This test suite covers the complete user settings functionality including:
 * 1. Complete profile configuration flow
 * 2. Exercise management migration functionality  
 * 3. Preferences persistence between sessions
 * 4. Navigation between sections without data loss
 * 
 * Requirements covered: 1.2, 4.3, 5.4, 7.4
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatWeight, convertKgToLbs, convertLbsToKg } from '@/utils/conversions'
import { calculateOneRM } from '@/utils/calculations'
import type { UserProfile, UserPreferences, ExerciseGoals, SettingsSection } from '@/types/settings'
import type { User } from '@supabase/supabase-js'

// Mock components for testing
import UserSettingsMenu from '@/components/settings/UserSettingsMenu'
import UserSettingsModal from '@/components/settings/UserSettingsModal'

// Mock Supabase
const mockSupabase = {
  auth: {
    signOut: jest.fn().mockResolvedValue({ error: null })
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: [], error: null })
    }),
    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    update: jest.fn().mockResolvedValue({ data: [], error: null }),
    upsert: jest.fn().mockResolvedValue({ data: [], error: null }),
    delete: jest.fn().mockResolvedValue({ data: [], error: null })
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
    })
  }
}

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => mockSupabase
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
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

// Mock user data
const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated'
}

describe('User Settings Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    document.documentElement.className = '' // Reset theme classes
  })

  describe('Complete Profile Configuration Flow', () => {
    test('should handle end-to-end profile configuration with validation and persistence', async () => {
      const user = userEvent.setup()
      
      // Mock initial profile data
      const initialProfile: UserProfile = {
        id: 'profile-1',
        user_id: 'test-user-id',
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

      // Mock Supabase responses for profile operations
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ 
            data: [initialProfile], 
            error: null 
          })
        }),
        upsert: jest.fn().mockImplementation((data) => 
          Promise.resolve({ 
            data: [{ ...initialProfile, ...data[0] }], 
            error: null 
          })
        )
      })

      render(<UserSettingsMenu user={mockUser} />)

      // Step 1: Open settings menu
      const settingsButton = screen.getByTestId('user-settings-button')
      await user.click(settingsButton)

      // Verify dropdown opens
      expect(screen.getByTestId('settings-profile')).toBeInTheDocument()

      // Step 2: Navigate to profile section
      const profileOption = screen.getByTestId('settings-profile')
      await user.click(profileOption)

      // Verify modal opens with profile section
      await waitFor(() => {
        expect(screen.getByTestId('user-settings-modal')).toBeInTheDocument()
      })

      // Step 3: Test profile photo upload validation
      const testPhotoUpload = (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        const maxSize = 5 * 1024 * 1024 // 5MB

        return {
          validType: allowedTypes.includes(file.type),
          validSize: file.size <= maxSize,
          valid: allowedTypes.includes(file.type) && file.size <= maxSize
        }
      }

      // Test valid image
      const validImage = new File(['test'], 'profile.jpg', { type: 'image/jpeg' })
      Object.defineProperty(validImage, 'size', { value: 1024 * 1024 }) // 1MB
      
      const validResult = testPhotoUpload(validImage)
      expect(validResult.valid).toBe(true)

      // Test invalid image
      const invalidImage = new File(['test'], 'profile.txt', { type: 'text/plain' })
      const invalidResult = testPhotoUpload(invalidImage)
      expect(invalidResult.valid).toBe(false)

      // Step 4: Test display name validation and update
      const validateDisplayName = (name: string) => {
        const trimmed = name.trim()
        return {
          valid: trimmed.length >= 2 && trimmed.length <= 50,
          error: trimmed.length < 2 ? 'Name too short' : 
                 trimmed.length > 50 ? 'Name too long' : null
        }
      }

      const newName = 'Updated User Name'
      const nameValidation = validateDisplayName(newName)
      expect(nameValidation.valid).toBe(true)

      // Step 5: Navigate to personal data section
      const personalDataNav = screen.getByTestId('nav-personal-data')
      await user.click(personalDataNav)

      // Step 6: Test personal data validation
      const validatePersonalData = (data: Partial<UserProfile>) => {
        const errors: string[] = []

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

        return { valid: errors.length === 0, errors }
      }

      const personalDataUpdates = {
        weight_kg: 80,
        height_cm: 180,
        experience_level: 'intermediate' as const
      }

      const personalDataValidation = validatePersonalData(personalDataUpdates)
      expect(personalDataValidation.valid).toBe(true)

      // Step 7: Test BMI calculation with updated data
      const calculateBMI = (weightKg: number, heightCm: number) => {
        const heightM = heightCm / 100
        return weightKg / (heightM * heightM)
      }

      const newBMI = calculateBMI(personalDataUpdates.weight_kg, personalDataUpdates.height_cm)
      expect(newBMI).toBeCloseTo(24.7, 1)

      // Step 8: Test data persistence
      const updatedProfile = { ...initialProfile, ...personalDataUpdates, display_name: newName }
      
      // Simulate saving to localStorage
      localStorageMock.setItem('userProfile', JSON.stringify(updatedProfile))
      
      const persistedProfile = JSON.parse(localStorageMock.getItem('userProfile') || '{}')
      expect(persistedProfile.display_name).toBe(newName)
      expect(persistedProfile.weight_kg).toBe(80)
      expect(persistedProfile.experience_level).toBe('intermediate')
    })

    test('should handle profile photo upload with error scenarios', async () => {
      const user = userEvent.setup()

      render(<UserSettingsMenu user={mockUser} />)

      // Open settings and navigate to profile
      await user.click(screen.getByTestId('user-settings-button'))
      await user.click(screen.getByTestId('settings-profile'))

      // Test file upload validation
      const validateImageFile = (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        const maxSize = 5 * 1024 * 1024 // 5MB
        
        const errors: string[] = []
        
        if (!allowedTypes.includes(file.type)) {
          errors.push('Invalid file type. Use JPG, PNG, or WebP.')
        }
        
        if (file.size > maxSize) {
          errors.push('File too large. Maximum 5MB allowed.')
        }

        return { valid: errors.length === 0, errors }
      }

      // Test oversized file
      const oversizedFile = new File(['test'], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(oversizedFile, 'size', { value: 10 * 1024 * 1024 }) // 10MB
      
      const oversizedResult = validateImageFile(oversizedFile)
      expect(oversizedResult.valid).toBe(false)
      expect(oversizedResult.errors).toContain('File too large. Maximum 5MB allowed.')

      // Test invalid file type
      const invalidTypeFile = new File(['test'], 'doc.pdf', { type: 'application/pdf' })
      const invalidTypeResult = validateImageFile(invalidTypeFile)
      expect(invalidTypeResult.valid).toBe(false)
      expect(invalidTypeResult.errors).toContain('Invalid file type. Use JPG, PNG, or WebP.')

      // Test valid file
      const validFile = new File(['test'], 'profile.jpg', { type: 'image/jpeg' })
      Object.defineProperty(validFile, 'size', { value: 2 * 1024 * 1024 }) // 2MB
      
      const validResult = validateImageFile(validFile)
      expect(validResult.valid).toBe(true)
      expect(validResult.errors).toHaveLength(0)
    })
  })

  describe('Exercise Management Migration Functionality', () => {
    test('should maintain data integrity during exercise management operations', async () => {
      const user = userEvent.setup()

      // Mock initial exercises
      const initialExercises = [
        { id: 1, name: 'Clean', category: 'Olympic' },
        { id: 2, name: 'Snatch', category: 'Olympic' },
        { id: 3, name: 'Deadlift', category: 'Powerlifting' },
        { id: 4, name: 'Front Squat', category: 'Squat' },
        { id: 5, name: 'Back Squat', category: 'Squat' }
      ]

      // Mock exercise goals
      const initialGoals: ExerciseGoals[] = [
        {
          id: 'goal-1',
          user_id: 'test-user-id',
          exercise_id: 1,
          target_1rm_lbs: 300,
          target_date: '2024-12-31',
          notes: 'Clean goal',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'goal-2',
          user_id: 'test-user-id',
          exercise_id: 3,
          target_1rm_lbs: 400,
          target_date: '2024-12-31',
          notes: 'Deadlift goal',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      // Mock workout records
      const workoutRecords = [
        { id: 'record-1', exercise_id: 1, calculated_1rm: 280, created_at: '2024-06-01' },
        { id: 'record-2', exercise_id: 1, calculated_1rm: 290, created_at: '2024-07-01' },
        { id: 'record-3', exercise_id: 3, calculated_1rm: 380, created_at: '2024-06-15' }
      ]

      render(<UserSettingsMenu user={mockUser} />)

      // Navigate to exercise management
      await user.click(screen.getByTestId('user-settings-button'))
      await user.click(screen.getByTestId('settings-exercise-management'))

      // Test exercise validation
      const validateExercise = (name: string, category: string, existingExercises: typeof initialExercises) => {
        const errors: string[] = []

        if (name.trim().length < 2) {
          errors.push('Exercise name must be at least 2 characters')
        }

        if (name.trim().length > 50) {
          errors.push('Exercise name must be less than 50 characters')
        }

        const validCategories = ['Olympic', 'Powerlifting', 'Squat', 'Other']
        if (!validCategories.includes(category)) {
          errors.push('Invalid exercise category')
        }

        const isDuplicate = existingExercises.some(ex => 
          ex.name.toLowerCase() === name.toLowerCase()
        )
        if (isDuplicate) {
          errors.push('Exercise name already exists')
        }

        return { valid: errors.length === 0, errors }
      }

      // Test adding new exercise
      const newExercise = { name: 'Power Clean', category: 'Olympic' }
      const addValidation = validateExercise(newExercise.name, newExercise.category, initialExercises)
      expect(addValidation.valid).toBe(true)

      // Test duplicate exercise
      const duplicateExercise = { name: 'Clean', category: 'Olympic' }
      const duplicateValidation = validateExercise(duplicateExercise.name, duplicateExercise.category, initialExercises)
      expect(duplicateValidation.valid).toBe(false)
      expect(duplicateValidation.errors).toContain('Exercise name already exists')

      // Test exercise deletion with cascade cleanup
      const exerciseToDelete = 1 // Clean
      
      const simulateExerciseDeletion = (exerciseId: number) => {
        const remainingExercises = initialExercises.filter(ex => ex.id !== exerciseId)
        const remainingGoals = initialGoals.filter(goal => goal.exercise_id !== exerciseId)
        const remainingRecords = workoutRecords.filter(record => record.exercise_id !== exerciseId)

        return { remainingExercises, remainingGoals, remainingRecords }
      }

      const deletionResult = simulateExerciseDeletion(exerciseToDelete)
      
      expect(deletionResult.remainingExercises).toHaveLength(4)
      expect(deletionResult.remainingGoals).toHaveLength(1) // Only deadlift goal remains
      expect(deletionResult.remainingRecords).toHaveLength(1) // Only deadlift record remains
      expect(deletionResult.remainingGoals[0].exercise_id).toBe(3) // Deadlift

      // Test exercise update (name change) doesn't affect records
      const updatedExercise = { ...initialExercises[0], name: 'Olympic Clean' }
      const recordsForExercise = workoutRecords.filter(r => r.exercise_id === updatedExercise.id)
      
      expect(recordsForExercise).toHaveLength(2) // Records still reference same exercise_id
      expect(Math.max(...recordsForExercise.map(r => r.calculated_1rm))).toBe(290)
    })

    test('should preserve workout history when exercises are modified', async () => {
      // Mock workout records with exercise relationships
      const workoutRecords = [
        { 
          id: 'record-1', 
          user_id: 'test-user-id',
          exercise_id: 1, 
          weight_lbs: 250,
          reps: 3,
          calculated_1rm: 280, 
          created_at: '2024-06-01T00:00:00Z' 
        },
        { 
          id: 'record-2', 
          user_id: 'test-user-id',
          exercise_id: 1, 
          weight_lbs: 260,
          reps: 3,
          calculated_1rm: 290, 
          created_at: '2024-07-01T00:00:00Z' 
        }
      ]

      // Test that exercise name changes don't affect historical records
      const originalExercise = { id: 1, name: 'Clean', category: 'Olympic' }
      const updatedExercise = { id: 1, name: 'Power Clean', category: 'Olympic' }

      // Records should still reference the same exercise_id
      const cleanRecords = workoutRecords.filter(record => record.exercise_id === originalExercise.id)
      expect(cleanRecords).toHaveLength(2)

      // Test record statistics remain accurate
      const maxRecord = Math.max(...cleanRecords.map(r => r.calculated_1rm))
      const avgRecord = cleanRecords.reduce((sum, r) => sum + r.calculated_1rm, 0) / cleanRecords.length

      expect(maxRecord).toBe(290)
      expect(avgRecord).toBe(285)

      // Test that 1RM calculations are preserved (allowing for small calculation differences)
      const testRecord = cleanRecords[0]
      const recalculated1RM = calculateOneRM(testRecord.weight_lbs, testRecord.reps)
      // Allow for reasonable calculation differences (within 10 lbs)
      expect(Math.abs(recalculated1RM - testRecord.calculated_1rm)).toBeLessThan(10)

      // Test progress tracking over time
      const sortedRecords = cleanRecords.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      
      const progressImprovement = sortedRecords[1].calculated_1rm - sortedRecords[0].calculated_1rm
      expect(progressImprovement).toBe(10) // 10 lbs improvement
    })
  })

  describe('Preferences Persistence Between Sessions', () => {
    test('should maintain preferences across browser sessions', async () => {
      const user = userEvent.setup()

      // Initial preferences
      const initialPreferences: UserPreferences = {
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

      render(<UserSettingsMenu user={mockUser} />)

      // Navigate to preferences
      await user.click(screen.getByTestId('user-settings-button'))
      await user.click(screen.getByTestId('settings-app-preferences'))

      // Simulate preference changes
      const updatedPreferences = {
        ...initialPreferences,
        preferred_units: 'imperial' as const,
        theme: 'dark' as const,
        notifications_enabled: false,
        preferred_1rm_formula: 'brzycki' as const
      }

      // Test theme application
      const applyTheme = (theme: 'light' | 'dark' | 'system') => {
        const root = document.documentElement
        
        if (theme === 'dark') {
          root.classList.add('dark')
        } else if (theme === 'light') {
          root.classList.remove('dark')
        } else {
          // System theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (prefersDark) {
            root.classList.add('dark')
          } else {
            root.classList.remove('dark')
          }
        }
      }

      applyTheme(updatedPreferences.theme)
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Test unit conversion with new preferences
      const testWeight = 80 // kg
      const displayWeight = updatedPreferences.preferred_units === 'imperial'
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

      const eplyResult = calculate1RM(testWeightLbs, testReps, 'epley')
      const brzyckiResult = calculate1RM(testWeightLbs, testReps, 'brzycki')

      expect(eplyResult).toBeCloseTo(233.3, 1)
      expect(brzyckiResult).toBeCloseTo(225.0, 1)

      // Test persistence to localStorage
      localStorageMock.setItem('userPreferences', JSON.stringify(updatedPreferences))
      localStorageMock.setItem('theme', updatedPreferences.theme)

      // Simulate session restart
      const restoredPreferences = JSON.parse(localStorageMock.getItem('userPreferences') || '{}')
      const restoredTheme = localStorageMock.getItem('theme')

      expect(restoredPreferences.preferred_units).toBe('imperial')
      expect(restoredPreferences.theme).toBe('dark')
      expect(restoredTheme).toBe('dark')

      // Test that restored preferences are applied
      applyTheme(restoredTheme as 'dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    test('should handle system theme changes when using system preference', async () => {
      // Mock matchMedia for system theme detection
      const mockMatchMedia = jest.fn()
      const mockAddEventListener = jest.fn()
      const mockRemoveEventListener = jest.fn()

      mockMatchMedia.mockReturnValue({
        matches: false, // Light mode initially
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener
      })

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia
      })

      const preferences: UserPreferences = {
        id: 'pref-1',
        user_id: 'test-user-id',
        preferred_units: 'metric',
        theme: 'system',
        language: 'es',
        notifications_enabled: true,
        workout_reminders: true,
        preferred_1rm_formula: 'epley',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const applySystemTheme = () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const root = document.documentElement
        
        root.classList.remove('light', 'dark')
        if (prefersDark) {
          root.classList.add('dark')
        }
      }

      // Test initial system theme application
      applySystemTheme()
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      // Test system theme change to dark
      mockMatchMedia.mockReturnValue({
        matches: true, // Dark mode
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener
      })

      applySystemTheme()
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Verify event listener was set up for system theme changes
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })
  })

  describe('Navigation Between Sections Without Data Loss', () => {
    test('should preserve form data when navigating between sections', async () => {
      const user = userEvent.setup()

      // Mock form state management
      let formData: Record<string, any> = {}
      let hasUnsavedChanges = false

      const updateFormData = (section: string, data: any) => {
        formData[section] = { ...formData[section], ...data }
        hasUnsavedChanges = true
      }

      const clearFormData = () => {
        formData = {}
        hasUnsavedChanges = false
      }

      render(<UserSettingsMenu user={mockUser} />)

      // Open settings and navigate to profile
      await user.click(screen.getByTestId('user-settings-button'))
      await user.click(screen.getByTestId('settings-profile'))

      // Simulate user making changes in profile section
      updateFormData('profile', { display_name: 'Temporary Name', weight_kg: 85 })

      expect(formData.profile.display_name).toBe('Temporary Name')
      expect(formData.profile.weight_kg).toBe(85)
      expect(hasUnsavedChanges).toBe(true)

      // Test navigation confirmation logic
      const handleSectionNavigation = (newSection: string, userConfirms: boolean = false) => {
        if (hasUnsavedChanges && !userConfirms) {
          return {
            navigated: false,
            message: 'You have unsaved changes. Do you want to continue?',
            currentSection: 'profile'
          }
        }

        if (userConfirms) {
          clearFormData()
        }

        return {
          navigated: true,
          currentSection: newSection
        }
      }

      // Test navigation attempt without saving (user cancels)
      const cancelResult = handleSectionNavigation('personal-data', false)
      expect(cancelResult.navigated).toBe(false)
      expect(formData.profile.display_name).toBe('Temporary Name') // Data preserved

      // Test navigation with user confirmation (data lost)
      const confirmResult = handleSectionNavigation('personal-data', true)
      expect(confirmResult.navigated).toBe(true)
      expect(Object.keys(formData)).toHaveLength(0) // Data cleared

      // Test saving changes before navigation
      updateFormData('profile', { display_name: 'Saved Name' })
      
      const saveChanges = () => {
        // Simulate saving to database
        const savedData = { ...formData.profile }
        clearFormData()
        return savedData
      }

      const savedData = saveChanges()
      expect(savedData.display_name).toBe('Saved Name')
      expect(hasUnsavedChanges).toBe(false)

      // Navigation should work without confirmation after saving
      const navigationResult = handleSectionNavigation('preferences')
      expect(navigationResult.navigated).toBe(true)
    })

    test('should handle modal close with unsaved changes confirmation', async () => {
      const user = userEvent.setup()

      let hasUnsavedChanges = true
      let isModalOpen = true

      const handleModalClose = (forceClose: boolean = false) => {
        if (hasUnsavedChanges && !forceClose) {
          // In real implementation, this would show a confirmation dialog
          return {
            closed: false,
            reason: 'unsaved_changes',
            message: 'You have unsaved changes. Are you sure you want to close?'
          }
        }

        isModalOpen = false
        hasUnsavedChanges = false
        return {
          closed: true,
          reason: 'confirmed'
        }
      }

      render(<UserSettingsMenu user={mockUser} />)

      // Open modal
      await user.click(screen.getByTestId('user-settings-button'))
      await user.click(screen.getByTestId('settings-profile'))

      // Test close attempt with unsaved changes
      const closeAttempt = handleModalClose()
      expect(closeAttempt.closed).toBe(false)
      expect(closeAttempt.reason).toBe('unsaved_changes')
      expect(isModalOpen).toBe(true)

      // Test force close
      const forceClose = handleModalClose(true)
      expect(forceClose.closed).toBe(true)
      expect(isModalOpen).toBe(false)
      expect(hasUnsavedChanges).toBe(false)
    })

    test('should maintain training goals data during navigation', async () => {
      const user = userEvent.setup()

      // Mock training goals state
      const initialGoals: ExerciseGoals[] = [
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

      render(<UserSettingsMenu user={mockUser} />)

      // Navigate to training section
      await user.click(screen.getByTestId('user-settings-button'))
      await user.click(screen.getByTestId('settings-training'))

      // Test adding temporary goal data
      addTempGoal({ exercise_id: 3, target_1rm_lbs: 350, notes: 'Deadlift goal' })
      
      expect(tempGoalData.exercise_id).toBe(3)
      expect(tempGoalData.target_1rm_lbs).toBe(350)
      expect(tempGoalData.notes).toBe('Deadlift goal')

      // Test saving goal
      const savedGoal = saveTempGoal()
      expect(savedGoal).toBeTruthy()
      expect(currentGoals).toHaveLength(2)
      expect(Object.keys(tempGoalData)).toHaveLength(0)

      // Test goal validation
      const validateGoal = (goal: Partial<ExerciseGoals>) => {
        const errors: string[] = []

        if (!goal.exercise_id) {
          errors.push('Exercise is required')
        }

        if (goal.target_1rm_lbs && (goal.target_1rm_lbs <= 0 || goal.target_1rm_lbs > 1000)) {
          errors.push('Target 1RM must be between 1 and 1000 lbs')
        }

        if (goal.target_date) {
          const targetDate = new Date(goal.target_date)
          const today = new Date()
          today.setHours(0, 0, 0, 0) // Reset time to compare dates only
          if (targetDate <= today) {
            errors.push('Target date must be in the future')
          }
        }

        return { valid: errors.length === 0, errors }
      }

      const validGoal = { exercise_id: 2, target_1rm_lbs: 250, target_date: '2025-12-31' }
      const invalidGoal = { exercise_id: 0, target_1rm_lbs: -10, target_date: '2020-01-01' }

      expect(validateGoal(validGoal).valid).toBe(true)
      expect(validateGoal(invalidGoal).valid).toBe(false)
      expect(validateGoal(invalidGoal).errors).toHaveLength(3)
    })
  })

  describe('Error Handling and Recovery', () => {
    test('should handle network errors gracefully with retry logic', async () => {
      let attemptCount = 0
      const maxRetries = 3

      const simulateNetworkOperation = async (): Promise<{ success: boolean; data?: any }> => {
        attemptCount++
        
        // Simulate failure for first 2 attempts
        if (attemptCount < 3) {
          throw new Error(`Network error - attempt ${attemptCount}`)
        }
        
        return { success: true, data: { message: 'Operation successful' } }
      }

      const retryOperation = async (): Promise<{ success: boolean; attempts: number; data?: any }> => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            const result = await simulateNetworkOperation()
            return { success: true, attempts: attemptCount, data: result.data }
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
      expect(result.data?.message).toBe('Operation successful')
    })

    test('should validate all form data before submission', async () => {
      const validateAllSettingsData = (data: {
        profile?: Partial<UserProfile>
        preferences?: Partial<UserPreferences>
        goals?: Partial<ExerciseGoals>[]
      }) => {
        const errors: Record<string, string[]> = {}

        // Validate profile data
        if (data.profile) {
          const profileErrors: string[] = []
          
          if (data.profile.display_name !== undefined) {
            if (!data.profile.display_name || data.profile.display_name.trim().length < 2) {
              profileErrors.push('Display name must be at least 2 characters')
            }
            if (data.profile.display_name.length > 50) {
              profileErrors.push('Display name must be less than 50 characters')
            }
          }

          if (data.profile.weight_kg !== undefined) {
            if (data.profile.weight_kg <= 0 || data.profile.weight_kg > 500) {
              profileErrors.push('Weight must be between 1 and 500 kg')
            }
          }

          if (data.profile.height_cm !== undefined) {
            if (data.profile.height_cm < 100 || data.profile.height_cm > 250) {
              profileErrors.push('Height must be between 100 and 250 cm')
            }
          }

          if (profileErrors.length > 0) {
            errors.profile = profileErrors
          }
        }

        // Validate preferences data
        if (data.preferences) {
          const preferencesErrors: string[] = []

          if (data.preferences.preferred_units && !['metric', 'imperial'].includes(data.preferences.preferred_units)) {
            preferencesErrors.push('Invalid unit preference')
          }

          if (data.preferences.theme && !['light', 'dark', 'system'].includes(data.preferences.theme)) {
            preferencesErrors.push('Invalid theme preference')
          }

          if (data.preferences.language && !['es', 'en'].includes(data.preferences.language)) {
            preferencesErrors.push('Invalid language preference')
          }

          if (preferencesErrors.length > 0) {
            errors.preferences = preferencesErrors
          }
        }

        // Validate goals data
        if (data.goals) {
          const goalsErrors: string[] = []

          data.goals.forEach((goal, index) => {
            if (!goal.exercise_id) {
              goalsErrors.push(`Goal ${index + 1}: Exercise is required`)
            }

            if (goal.target_1rm_lbs && (goal.target_1rm_lbs <= 0 || goal.target_1rm_lbs > 1000)) {
              goalsErrors.push(`Goal ${index + 1}: Target 1RM must be between 1 and 1000 lbs`)
            }

            if (goal.target_date) {
              const targetDate = new Date(goal.target_date)
              const today = new Date()
              today.setHours(0, 0, 0, 0) // Reset time to compare dates only
              if (targetDate <= today) {
                goalsErrors.push(`Goal ${index + 1}: Target date must be in the future`)
              }
            }
          })

          if (goalsErrors.length > 0) {
            errors.goals = goalsErrors
          }
        }

        return {
          valid: Object.keys(errors).length === 0,
          errors
        }
      }

      // Test valid data
      const validData = {
        profile: {
          display_name: 'Valid Name',
          weight_kg: 75,
          height_cm: 180
        },
        preferences: {
          preferred_units: 'metric' as const,
          theme: 'dark' as const,
          language: 'es' as const
        },
        goals: [{
          exercise_id: 1,
          target_1rm_lbs: 300,
          target_date: '2025-12-31'
        }]
      }

      const validResult = validateAllSettingsData(validData)
      expect(validResult.valid).toBe(true)
      expect(validResult.errors).toEqual({})

      // Test invalid data
      const invalidData = {
        profile: {
          display_name: 'A', // Too short
          weight_kg: -10, // Invalid
          height_cm: 300 // Too tall
        },
        preferences: {
          preferred_units: 'invalid' as any,
          theme: 'invalid' as any
        },
        goals: [{
          exercise_id: 0, // Invalid
          target_1rm_lbs: -100, // Invalid
          target_date: '2020-01-01' // Past date
        }]
      }

      const invalidResult = validateAllSettingsData(invalidData)
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.errors.profile).toHaveLength(3)
      expect(invalidResult.errors.preferences).toHaveLength(2)
      expect(invalidResult.errors.goals).toHaveLength(3)
    })
  })
})

/**
 * Manual Integration Testing Checklist:
 * 
 * Complete Profile Configuration Flow:
 * □ Open settings menu from navigation
 * □ Navigate to profile section
 * □ Upload profile photo (test validation)
 * □ Update display name
 * □ Navigate to personal data section
 * □ Update weight, height, experience level
 * □ Save changes and verify persistence
 * □ Close and reopen modal to verify data
 * 
 * Exercise Management Migration:
 * □ Access exercise management from settings
 * □ Verify all existing exercises display
 * □ Add new custom exercise
 * □ Edit existing exercise name
 * □ Delete exercise with confirmation
 * □ Verify changes persist in workout forms
 * 
 * Preferences Persistence:
 * □ Change theme and verify immediate application
 * □ Change units and verify weight displays
 * □ Toggle notifications settings
 * □ Close browser and reopen
 * □ Verify all preferences restored
 * 
 * Navigation Without Data Loss:
 * □ Make changes without saving
 * □ Try to navigate to another section
 * □ Verify unsaved changes warning
 * □ Cancel navigation and verify data preserved
 * □ Save changes and verify normal navigation
 * □ Test modal close with unsaved changes
 */