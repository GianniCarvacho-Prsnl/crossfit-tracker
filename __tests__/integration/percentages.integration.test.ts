/**
 * Integration test for RM Percentages functionality
 * Tests the complete flow from loading PRs to calculating percentages
 */

import { calculateAllPercentages, calculateCustomPercentage } from '@/utils/rmPercentages'
import { calculateTargetWeight } from '@/utils/plateCalculations'

describe('RM Percentages Integration', () => {
  test('should calculate complete percentage table for Clean exercise', () => {
    const oneRM = 200 // 200 lbs Clean PR
    const result = calculateAllPercentages('Clean', oneRM)
    
    expect(result.exercise).toBe('Clean')
    expect(result.oneRM).toBe(200)
    expect(result.percentages).toHaveLength(10) // Common percentages
    
    // Test specific percentages
    const percentage70 = result.percentages.find(p => p.percentage === 70)
    expect(percentage70).toBeDefined()
    expect(percentage70!.weightLbs).toBe(140)
    expect(percentage70!.weightKg).toBeCloseTo(63.5, 1)
    
    // Test plate calculation integration
    expect(percentage70!.plateCalculation.totalWeight).toBeCloseTo(140, 1)
    expect(percentage70!.plateCalculation.plates).toBeDefined()
  })

  test('should handle custom percentage calculations', () => {
    const oneRM = 150 // 150 lbs Snatch PR
    const customPercentage = 77.5
    
    const result = calculateCustomPercentage(oneRM, customPercentage)
    
    expect(result.percentage).toBe(77.5)
    expect(result.weightLbs).toBe(116.3) // 150 * 0.775 = 116.25, rounded to 116.3
    expect(result.weightKg).toBeCloseTo(52.8, 1)
    
    // Verify plate calculation works
    expect(result.plateCalculation.totalWeight).toBeGreaterThan(0)
    expect(result.plateCalculation.plates).toBeDefined()
  })

  test('should integrate with plate calculation system', () => {
    const oneRM = 300 // 300 lbs Deadlift PR
    const result = calculateAllPercentages('Deadlift', oneRM)
    
    // Test 85% calculation (255 lbs)
    const percentage85 = result.percentages.find(p => p.percentage === 85)
    expect(percentage85).toBeDefined()
    expect(percentage85!.weightLbs).toBe(255)
    
    // Verify plate calculation
    const plateCalc = calculateTargetWeight(255, 'lbs')
    expect(plateCalc.totalWeight).toBeCloseTo(255, 1)
    expect(plateCalc.plates.length).toBeGreaterThan(0)
    
    // Should match the integrated calculation
    expect(percentage85!.plateCalculation.totalWeight).toBe(plateCalc.totalWeight)
  })

  test('should handle edge cases correctly', () => {
    // Very low 1RM
    const lowRM = 50
    const result = calculateAllPercentages('Clean', lowRM)
    
    expect(result.percentages[0].weightLbs).toBe(25) // 50% of 50
    expect(result.percentages[0].plateCalculation.totalWeight).toBeGreaterThan(0)
    
    // Very high 1RM
    const highRM = 500
    const highResult = calculateAllPercentages('Deadlift', highRM)
    
    expect(highResult.percentages[9].weightLbs).toBe(500) // 100% of 500
    expect(highResult.percentages[9].plateCalculation.totalWeight).toBeGreaterThan(0)
  })

  test('should maintain consistency across different exercises', () => {
    const exercises = ['Clean', 'Snatch', 'Deadlift', 'Front Squat', 'Back Squat'] as const
    const oneRM = 200
    
    exercises.forEach(exercise => {
      const result = calculateAllPercentages(exercise, oneRM)
      
      expect(result.exercise).toBe(exercise)
      expect(result.oneRM).toBe(oneRM)
      expect(result.percentages).toHaveLength(10)
      
      // All percentages should have valid calculations
      result.percentages.forEach(calc => {
        expect(calc.weightLbs).toBeGreaterThan(0)
        expect(calc.weightKg).toBeGreaterThan(0)
        expect(calc.plateCalculation).toBeDefined()
        expect(calc.plateCalculation.totalWeight).toBeGreaterThan(0)
      })
    })
  })
})