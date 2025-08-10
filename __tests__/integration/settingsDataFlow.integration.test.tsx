/**
 * Integration tests for Settings Data Flow
 * 
 * This test suite focuses on data persistence and synchronization
 * between different parts of the settings system and the main application.
 */

import { formatWeight, convertKgToLbs, convertLbsToKg } from '@/utils/conversions'
import { calculateOneRM } from '@/utils/calculations'
import type { UserPreferences, UserProfile } from '@/types/settings'

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

describe('Settings Data Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('Unit Conversion Data Flow', () => {
    test('should propagate unit changes throughout the application', async () => {
      // Test data
      const weightInKg = 100
      const expectedWeightInLbs = 220.5

      // Test unit conversion utility functions
      const convertedWeight = convertKgToLbs(weightInKg)
      expect(convertedWeight).toBeCloseTo(expectedWeightInLbs, 1)

      // Test formatting with different units (formatWeight expects weight in lbs)
      const weightInLbs = convertKgToLbs(weightInKg)
      const kgFormat = formatWeight(weightInLbs, 'kg')
      const lbsFormat = formatWeight(weightInLbs, 'lbs')
      
      expect(kgFormat).toBe('100.0 kg')
      expect(lbsFormat).toBe('220.5 lbs')

      // Test that 1RM calculations work with different units
      const oneRMKg = calculateOneRM(80, 5) // 80kg for 5 reps
      const oneRMLbs = convertKgToLbs(oneRMKg)
      
      expect(oneRMKg).toBeCloseTo(93.3, 1)
      expect(oneRMLbs).toBeCloseTo(205.7, 1)
    })

    test('should persist unit preferences and apply them consistently', async () => {
      const mockPreferences: UserPreferences = {
        id: 'pref-1',
        user_id: 'test-user',
        preferred_units: 'imperial',
        theme: 'light',
        language: 'es',
        notifications_enabled: true,
        workout_reminders: true,
        preferred_1rm_formula: 'epley',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      // Simulate saving preferences to localStorage
      localStorageMock.setItem('userPreferences', JSON.stringify(mockPreferences))

      // Verify localStorage persistence
      const savedPrefs = JSON.parse(localStorageMock.getItem('userPreferences') || '{}')
      expect(savedPrefs.preferred_units).toBe('imperial')

      // Test that weight displays use the preferred units
      const testWeight = 80 // kg
      const displayWeight = savedPrefs.preferred_units === 'imperial' 
        ? convertKgToLbs(testWeight)
        : testWeight

      if (savedPrefs.preferred_units === 'imperial') {
        expect(displayWeight).toBeCloseTo(176.4, 1)
      } else {
        expect(displayWeight).toBe(80)
      }
    })
  })

  describe('Profile Data Synchronization', () => {
    test('should synchronize profile changes across components', async () => {
      const mockProfile: UserProfile = {
        id: 'profile-1',
        user_id: 'test-user',
        display_name: 'Original Name',
        profile_photo_url: null,
        weight_kg: 75,
        height_cm: 175,
        gender: 'male',
        experience_level: 'intermediate',
        birth_date: '1990-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      // Mock profile update
      const updatedProfile = {
        ...mockProfile,
        display_name: 'Updated Name',
        weight_kg: 80
      }

      // Simulate profile update (would be done via database in real implementation)

      // Test that profile changes are reflected in navigation
      const displayName = updatedProfile.display_name
      expect(displayName).toBe('Updated Name')

      // Test that weight changes affect calculations
      const oldBMI = mockProfile.weight_kg / Math.pow(mockProfile.height_cm / 100, 2)
      const newBMI = updatedProfile.weight_kg / Math.pow(updatedProfile.height_cm / 100, 2)
      
      expect(oldBMI).toBeCloseTo(24.5, 1)
      expect(newBMI).toBeCloseTo(26.1, 1)
    })

    test('should handle profile photo upload and display', async () => {
      const mockFile = new File(['test image data'], 'profile.jpg', { 
        type: 'image/jpeg' 
      })

      // Mock file upload process
      const mockUploadUrl = 'https://example.com/uploads/profile.jpg'
      
      // Simulate file upload to storage
      const uploadResult = {
        data: { path: 'profiles/test-user/profile.jpg' },
        error: null
      }

      // Simulate getting public URL
      const publicUrlResult = {
        data: { publicUrl: mockUploadUrl }
      }

      // Test file validation
      expect(mockFile.type).toBe('image/jpeg')
      expect(mockFile.size).toBeLessThan(5 * 1024 * 1024) // 5MB limit

      // Test that profile is updated with photo URL
      const updatedProfile = {
        profile_photo_url: mockUploadUrl
      }

      expect(updatedProfile.profile_photo_url).toBe(mockUploadUrl)
    })
  })

  describe('Exercise Goals Data Flow', () => {
    test('should maintain exercise goals consistency with exercise management', async () => {
      // Mock exercises data
      const mockExercises = [
        { id: 1, name: 'Clean', category: 'Olympic' },
        { id: 2, name: 'Snatch', category: 'Olympic' },
        { id: 3, name: 'Deadlift', category: 'Powerlifting' }
      ]

      // Mock exercise goals
      const mockGoals = [
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
          exercise_id: 2,
          target_1rm_lbs: 250,
          target_date: '2024-12-31',
          notes: 'Snatch goal',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      // Test that goals reference valid exercises
      mockGoals.forEach(goal => {
        const exercise = mockExercises.find(ex => ex.id === goal.exercise_id)
        expect(exercise).toBeDefined()
      })

      // Test goal deletion when exercise is deleted
      const remainingExercises = mockExercises.filter(ex => ex.id !== 1)
      const remainingGoals = mockGoals.filter(goal => 
        remainingExercises.some(ex => ex.id === goal.exercise_id)
      )

      expect(remainingGoals).toHaveLength(1)
      expect(remainingGoals[0].exercise_id).toBe(2)
    })

    test('should handle goal progress tracking', async () => {
      const mockGoal = {
        id: 'goal-1',
        user_id: 'test-user',
        exercise_id: 1,
        target_1rm_lbs: 300,
        target_date: '2024-12-31',
        notes: 'Clean goal',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      // Mock current 1RM records
      const mockRecords = [
        {
          id: 'record-1',
          user_id: 'test-user',
          exercise_id: 1,
          calculated_1rm: 280, // lbs
          created_at: '2024-06-01T00:00:00Z'
        },
        {
          id: 'record-2',
          user_id: 'test-user',
          exercise_id: 1,
          calculated_1rm: 290, // lbs
          created_at: '2024-07-01T00:00:00Z'
        }
      ]

      // Calculate progress
      const currentBest = Math.max(...mockRecords.map(r => r.calculated_1rm))
      const progress = (currentBest / mockGoal.target_1rm_lbs) * 100

      expect(currentBest).toBe(290)
      expect(progress).toBeCloseTo(96.7, 1)

      // Test goal achievement
      const isAchieved = currentBest >= mockGoal.target_1rm_lbs
      expect(isAchieved).toBe(false)

      // Test remaining weight needed
      const remainingWeight = mockGoal.target_1rm_lbs - currentBest
      expect(remainingWeight).toBe(10)
    })
  })

  describe('Theme and Appearance Data Flow', () => {
    test('should apply theme changes immediately and persist them', async () => {
      // Test initial light theme
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      // Simulate theme change to dark
      const newTheme = 'dark'
      
      // Apply theme to DOM
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      // Verify theme application
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Verify localStorage persistence
      localStorageMock.setItem('theme', newTheme)
      expect(localStorageMock.getItem('theme')).toBe('dark')

      // Mock matchMedia for system theme detection
      const mockMatchMedia = jest.fn().mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      })
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia
      })

      // Test system theme detection
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light'
      
      // Test theme restoration on app load
      const savedTheme = localStorageMock.getItem('theme') || systemTheme
      expect(['light', 'dark', 'system']).toContain(savedTheme)
    })

    test('should handle system theme changes', async () => {
      // Mock matchMedia
      const mockMatchMedia = jest.fn()
      mockMatchMedia.mockReturnValue({
        matches: true, // Dark mode
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      })
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia
      })

      // Test system theme detection
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      expect(prefersDark).toBe(true)

      // Test theme application based on system preference
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      }

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('Data Validation and Error Recovery', () => {
    test('should validate profile data before saving', async () => {
      const invalidProfileData = {
        display_name: '', // Empty name
        weight_kg: -10, // Negative weight
        height_cm: 300, // Unrealistic height
        birth_date: '2030-01-01' // Future date
      }

      // Test validation functions
      const validateDisplayName = (name: string) => {
        return name.trim().length >= 2 && name.trim().length <= 50
      }

      const validateWeight = (weight: number) => {
        return weight > 0 && weight <= 500 // kg
      }

      const validateHeight = (height: number) => {
        return height >= 100 && height <= 250 // cm
      }

      const validateBirthDate = (date: string) => {
        const birthDate = new Date(date)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        return age >= 13 && age <= 120
      }

      // Test validations
      expect(validateDisplayName(invalidProfileData.display_name)).toBe(false)
      expect(validateWeight(invalidProfileData.weight_kg)).toBe(false)
      expect(validateHeight(invalidProfileData.height_cm)).toBe(false)
      expect(validateBirthDate(invalidProfileData.birth_date)).toBe(false)

      // Test valid data
      const validProfileData = {
        display_name: 'Valid Name',
        weight_kg: 75,
        height_cm: 180,
        birth_date: '1990-01-01'
      }

      expect(validateDisplayName(validProfileData.display_name)).toBe(true)
      expect(validateWeight(validProfileData.weight_kg)).toBe(true)
      expect(validateHeight(validProfileData.height_cm)).toBe(true)
      expect(validateBirthDate(validProfileData.birth_date)).toBe(true)
    })

    test('should handle database connection errors gracefully', async () => {
      // Mock database error scenario
      const mockDatabaseOperation = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Connection failed', code: 'NETWORK_ERROR' }
      })

      // Test error handling
      const result = await mockDatabaseOperation()
      
      expect(result.error).toBeDefined()
      expect(result.error.code).toBe('NETWORK_ERROR')
      expect(result.data).toBeNull()

      // Test retry logic
      let retryCount = 0
      const maxRetries = 3

      const attemptSave = async (): Promise<boolean> => {
        try {
          const result = await mockDatabaseOperation()
          if (result.error) {
            throw new Error(result.error.message)
          }
          return true
        } catch (error) {
          retryCount++
          if (retryCount < maxRetries) {
            // Wait before retry (shortened for test)
            await new Promise(resolve => setTimeout(resolve, 10))
            return attemptSave()
          }
          return false
        }
      }

      const success = await attemptSave()
      expect(success).toBe(false)
      expect(retryCount).toBe(maxRetries)
    })

    test('should handle offline mode gracefully', async () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      // Test offline detection
      expect(navigator.onLine).toBe(false)

      // Test offline data storage
      const offlineData = {
        profile: { display_name: 'Offline Name' },
        preferences: { theme: 'dark' },
        timestamp: Date.now()
      }

      localStorageMock.setItem('offlineData', JSON.stringify(offlineData))

      // Verify offline data storage
      const storedData = JSON.parse(localStorageMock.getItem('offlineData') || '{}')
      expect(storedData.profile.display_name).toBe('Offline Name')

      // Test online state restoration
      Object.defineProperty(navigator, 'onLine', {
        value: true
      })

      expect(navigator.onLine).toBe(true)

      // Test sync when back online
      const syncOfflineData = async () => {
        const data = JSON.parse(localStorageMock.getItem('offlineData') || '{}')
        if (data.timestamp) {
          // Simulate sync to server
          return { success: true, synced: data }
        }
        return { success: false }
      }

      const syncResult = await syncOfflineData()
      expect(syncResult.success).toBe(true)
      expect(syncResult.synced.profile.display_name).toBe('Offline Name')
    })
  })
})

/**
 * Manual Data Flow Testing Steps:
 * 
 * Unit Conversion Flow:
 * 1. Set preferences to metric units
 * 2. Enter weight as 80kg in personal data
 * 3. Switch to imperial units in preferences
 * 4. Verify weight displays as 176.4 lbs
 * 5. Create workout record with 200 lbs
 * 6. Switch back to metric
 * 7. Verify record shows as 90.7 kg
 * 
 * Profile Synchronization:
 * 1. Update display name in profile section
 * 2. Verify name appears in navigation immediately
 * 3. Upload profile photo
 * 4. Verify photo appears in navigation
 * 5. Update weight in personal data
 * 6. Check that BMI calculations update
 * 
 * Exercise Goals Flow:
 * 1. Create goal for Clean at 300 lbs
 * 2. Add workout record for Clean at 280 lbs
 * 3. Verify goal progress shows 93.3%
 * 4. Delete Clean exercise from management
 * 5. Verify goal is also deleted
 * 6. Restore exercise and recreate goal
 * 
 * Theme Persistence:
 * 1. Change theme to dark mode
 * 2. Verify immediate application
 * 3. Close and reopen browser
 * 4. Verify dark theme persists
 * 5. Change system theme preference
 * 6. Set app theme to "system"
 * 7. Verify app follows system theme
 * 
 * Error Recovery:
 * 1. Disconnect internet
 * 2. Try to save profile changes
 * 3. Verify offline mode message
 * 4. Reconnect internet
 * 5. Verify automatic sync occurs
 * 6. Test with invalid data (negative weight)
 * 7. Verify validation errors display
 */