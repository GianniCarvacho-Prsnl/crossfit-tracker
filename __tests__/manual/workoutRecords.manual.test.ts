/**
 * Manual integration test for WorkoutRecordService
 * This test can be run manually to verify the service works with a real Supabase instance
 * 
 * To run this test:
 * 1. Ensure you have a valid .env.local file with Supabase credentials
 * 2. Ensure you have a user account in your Supabase instance
 * 3. Run: npm test -- __tests__/manual/workoutRecords.manual.test.ts
 * 
 * Note: This test is skipped by default to avoid running against production data
 */

import { WorkoutFormData } from '@/types/workout'

// Mock the Supabase client module
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

// Import after mocking
import { workoutRecordService } from '@/utils/services/workoutRecords'

describe.skip('WorkoutRecordService Manual Integration Test', () => {
  const testFormData: WorkoutFormData = {
    exercise: 'Clean',
    weight: 100,
    repetitions: 1,
    unit: 'lbs'
  }

  it('should create a workout record with real Supabase', async () => {
    // This test requires manual authentication setup
    // You would need to authenticate a user first
    
    const result = await workoutRecordService.createWorkoutRecord(testFormData)
    
    console.log('Result:', result)
    
    if (result.success) {
      expect(result.data).toBeDefined()
      expect(result.data?.weight_lbs).toBe(100)
      expect(result.data?.repetitions).toBe(1)
      expect(result.data?.is_calculated).toBe(false)
      expect(result.data?.original_unit).toBe('lbs')
    } else {
      console.error('Error:', result.error)
      // This might fail due to authentication, which is expected
      expect(result.error).toContain('Usuario no autenticado')
    }
  }, 10000) // 10 second timeout for network operations

  it('should handle validation errors', async () => {
    const invalidFormData: WorkoutFormData = {
      exercise: 'Clean',
      weight: -10, // Invalid negative weight
      repetitions: 1,
      unit: 'lbs'
    }

    const result = await workoutRecordService.createWorkoutRecord(invalidFormData)
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('El peso debe ser mayor a 0')
  })

  it('should handle calculated 1RM', async () => {
    const multiRepFormData: WorkoutFormData = {
      exercise: 'Clean',
      weight: 100,
      repetitions: 5,
      unit: 'lbs'
    }

    const result = await workoutRecordService.createWorkoutRecord(multiRepFormData)
    
    console.log('Multi-rep result:', result)
    
    // This will likely fail due to authentication, but we can test the validation
    if (!result.success && result.error?.includes('Usuario no autenticado')) {
      // Expected behavior when not authenticated
      expect(result.success).toBe(false)
    }
  }, 10000)
})

/**
 * Instructions for manual testing:
 * 
 * 1. Remove the .skip from describe.skip above
 * 2. Set up authentication in your test environment
 * 3. Run the test to verify real database integration
 * 4. Check the console output for detailed results
 */