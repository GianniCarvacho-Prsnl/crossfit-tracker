import {
  calculatePercentage,
  calculateAllPercentages,
  calculateCustomPercentage,
  validateOneRM,
  getRecommendedReps,
  COMMON_PERCENTAGES
} from '@/utils/rmPercentages'

describe('rmPercentages', () => {
  describe('calculatePercentage', () => {
    test('should calculate percentage correctly', () => {
      expect(calculatePercentage(200, 50)).toBe(100)
      expect(calculatePercentage(200, 75)).toBe(150)
      expect(calculatePercentage(200, 100)).toBe(200)
    })

    test('should handle decimal percentages', () => {
      expect(calculatePercentage(200, 75.5)).toBe(151)
      expect(calculatePercentage(100, 33.3)).toBe(33.3)
    })

    test('should throw error for invalid percentages', () => {
      expect(() => calculatePercentage(200, -10)).toThrow('El porcentaje debe estar entre 0 y 150')
      expect(() => calculatePercentage(200, 160)).toThrow('El porcentaje debe estar entre 0 y 150')
    })

    test('should handle edge cases', () => {
      expect(calculatePercentage(200, 0)).toBe(0)
      expect(calculatePercentage(0, 50)).toBe(0)
    })
  })

  describe('calculateAllPercentages', () => {
    test('should calculate all common percentages', () => {
      const result = calculateAllPercentages('Clean', 200)
      
      expect(result.exercise).toBe('Clean')
      expect(result.oneRM).toBe(200)
      expect(result.percentages).toHaveLength(COMMON_PERCENTAGES.length)
      
      // Check first percentage (50%)
      const firstPercentage = result.percentages[0]
      expect(firstPercentage.percentage).toBe(50)
      expect(firstPercentage.weightLbs).toBe(100)
      expect(firstPercentage.weightKg).toBeCloseTo(45.4, 1)
      expect(firstPercentage.plateCalculation).toBeDefined()
    })

    test('should calculate custom percentages', () => {
      const customPercentages = [60, 70, 80]
      const result = calculateAllPercentages('Snatch', 150, customPercentages)
      
      expect(result.percentages).toHaveLength(3)
      expect(result.percentages[0].percentage).toBe(60)
      expect(result.percentages[0].weightLbs).toBe(90)
    })
  })

  describe('calculateCustomPercentage', () => {
    test('should calculate custom percentage correctly', () => {
      const result = calculateCustomPercentage(200, 77.5)
      
      expect(result.percentage).toBe(77.5)
      expect(result.weightLbs).toBe(155)
      expect(result.weightKg).toBeCloseTo(70.3, 1)
      expect(result.plateCalculation).toBeDefined()
    })
  })

  describe('validateOneRM', () => {
    test('should validate valid 1RMs', () => {
      expect(validateOneRM(100)).toBe(true)
      expect(validateOneRM(500)).toBe(true)
      expect(validateOneRM(1)).toBe(true)
    })

    test('should reject invalid 1RMs', () => {
      expect(validateOneRM(0)).toBe(false)
      expect(validateOneRM(-100)).toBe(false)
      expect(validateOneRM(1001)).toBe(false)
    })
  })

  describe('getRecommendedReps', () => {
    test('should return correct rep ranges', () => {
      expect(getRecommendedReps(100)).toBe('1-2 reps')
      expect(getRecommendedReps(95)).toBe('1-2 reps')
      expect(getRecommendedReps(90)).toBe('2-3 reps')
      expect(getRecommendedReps(85)).toBe('3-4 reps')
      expect(getRecommendedReps(80)).toBe('4-5 reps')
      expect(getRecommendedReps(70)).toBe('6-8 reps')
      expect(getRecommendedReps(50)).toBe('12+ reps')
    })
  })
})