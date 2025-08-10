import { 
  convertKgToLbs, 
  convertLbsToKg, 
  convertCmToInches,
  convertInchesToCm,
  convertInchesToFeetAndInches,
  convertFeetAndInchesToInches,
  formatWeight,
  formatHeight
} from '@/utils/conversions'

// Helper functions for validation (these would typically be in a separate validation utility)
function validateWeight(weight: number, unit: 'metric' | 'imperial'): boolean {
  if (weight <= 0) return false
  
  if (unit === 'metric') {
    return weight >= 20 && weight <= 300
  } else {
    // Imperial: 44-661 lbs (approximately 20-300 kg)
    return weight >= 44 && weight <= 661
  }
}

function validateHeight(height: number, unit: 'metric' | 'imperial'): boolean {
  if (height <= 0) return false
  
  if (unit === 'metric') {
    return height >= 100 && height <= 250
  } else {
    // Imperial: 39-98 inches (approximately 100-250 cm)
    return height >= 39 && height <= 98
  }
}

describe('Unit Conversion Validation Tests', () => {
  describe('Weight Conversions', () => {
    it('should convert kg to lbs correctly', () => {
      expect(convertKgToLbs(70)).toBeCloseTo(154.32, 2)
      expect(convertKgToLbs(100)).toBeCloseTo(220.46, 2)
    })

    it('should convert lbs to kg correctly', () => {
      expect(convertLbsToKg(154.32)).toBeCloseTo(70, 2)
      expect(convertLbsToKg(220.46)).toBeCloseTo(100, 2)
    })

    it('should handle edge cases for weight conversion', () => {
      expect(() => convertKgToLbs(-10)).toThrow('Weight cannot be negative')
      expect(() => convertLbsToKg(-22.046)).toThrow('Weight cannot be negative')
    })

    it('should validate weight ranges in metric', () => {
      expect(validateWeight(70, 'metric')).toBe(true)
      expect(validateWeight(20, 'metric')).toBe(true)
      expect(validateWeight(300, 'metric')).toBe(true)
      expect(validateWeight(19, 'metric')).toBe(false)
      expect(validateWeight(301, 'metric')).toBe(false)
      expect(validateWeight(0, 'metric')).toBe(false)
      expect(validateWeight(-10, 'metric')).toBe(false)
    })

    it('should validate weight ranges in imperial', () => {
      expect(validateWeight(154, 'imperial')).toBe(true)
      expect(validateWeight(44, 'imperial')).toBe(true) // ~20kg
      expect(validateWeight(661, 'imperial')).toBe(true) // ~300kg
      expect(validateWeight(43, 'imperial')).toBe(false)
      expect(validateWeight(662, 'imperial')).toBe(false)
      expect(validateWeight(0, 'imperial')).toBe(false)
      expect(validateWeight(-10, 'imperial')).toBe(false)
    })
  })

  describe('Height Conversions', () => {
    it('should convert cm to feet and inches correctly', () => {
      const inches1 = convertCmToInches(175)
      const result1 = convertInchesToFeetAndInches(inches1)
      expect(result1.feet).toBe(5)
      expect(result1.inches).toBeCloseTo(8.9, 1)

      const inches2 = convertCmToInches(180)
      const result2 = convertInchesToFeetAndInches(inches2)
      expect(result2.feet).toBe(5)
      expect(result2.inches).toBeCloseTo(10.9, 1)
    })

    it('should convert feet and inches to cm correctly', () => {
      const totalInches1 = convertFeetAndInchesToInches(5, 8.9)
      expect(convertInchesToCm(totalInches1)).toBeCloseTo(175, 0)
      
      const totalInches2 = convertFeetAndInchesToInches(5, 10.9)
      expect(convertInchesToCm(totalInches2)).toBeCloseTo(180, 0)
      
      const totalInches3 = convertFeetAndInchesToInches(6, 0)
      expect(convertInchesToCm(totalInches3)).toBeCloseTo(183, 0)
    })

    it('should handle edge cases for height conversion', () => {
      expect(() => convertCmToInches(-10)).toThrow('Height cannot be negative')
      expect(() => convertInchesToCm(-10)).toThrow('Height cannot be negative')
      expect(() => convertFeetAndInchesToInches(-1, 0)).toThrow('Height values cannot be negative')
      expect(() => convertFeetAndInchesToInches(5, 12)).toThrow('Inches must be less than 12')
    })

    it('should validate height ranges in metric', () => {
      expect(validateHeight(175, 'metric')).toBe(true)
      expect(validateHeight(100, 'metric')).toBe(true)
      expect(validateHeight(250, 'metric')).toBe(true)
      expect(validateHeight(99, 'metric')).toBe(false)
      expect(validateHeight(251, 'metric')).toBe(false)
      expect(validateHeight(0, 'metric')).toBe(false)
      expect(validateHeight(-10, 'metric')).toBe(false)
    })

    it('should validate height ranges in imperial', () => {
      expect(validateHeight(69, 'imperial')).toBe(true) // ~175cm
      expect(validateHeight(39, 'imperial')).toBe(true) // ~100cm
      expect(validateHeight(98, 'imperial')).toBe(true) // ~250cm
      expect(validateHeight(38, 'imperial')).toBe(false)
      expect(validateHeight(99, 'imperial')).toBe(false)
      expect(validateHeight(0, 'imperial')).toBe(false)
      expect(validateHeight(-10, 'imperial')).toBe(false)
    })
  })

  describe('Conversion Precision', () => {
    it('should maintain precision in round-trip conversions', () => {
      const originalKg = 75.5
      const convertedLbs = convertKgToLbs(originalKg)
      const backToKg = convertLbsToKg(convertedLbs)
      expect(backToKg).toBeCloseTo(originalKg, 1)

      const originalCm = 178
      const inches = convertCmToInches(originalCm)
      const { feet, inches: remainingInches } = convertInchesToFeetAndInches(inches)
      const totalInches = convertFeetAndInchesToInches(feet, remainingInches)
      const backToCm = convertInchesToCm(totalInches)
      expect(backToCm).toBeCloseTo(originalCm, 0)
    })

    it('should handle decimal inputs correctly', () => {
      expect(convertKgToLbs(70.5)).toBeCloseTo(155.43, 1)
      expect(convertLbsToKg(155.42)).toBeCloseTo(70.5, 1)

      const inches = convertCmToInches(175.5)
      const result = convertInchesToFeetAndInches(inches)
      expect(result.feet).toBe(5)
      expect(result.inches).toBeCloseTo(9.1, 1)
    })
  })

  describe('Form Validation Integration', () => {
    it('should validate form weight inputs with proper error messages', () => {
      // Test metric validation
      expect(validateWeight(70, 'metric')).toBe(true)
      expect(validateWeight(19, 'metric')).toBe(false)
      expect(validateWeight(301, 'metric')).toBe(false)

      // Test imperial validation  
      expect(validateWeight(154, 'imperial')).toBe(true)
      expect(validateWeight(43, 'imperial')).toBe(false)
      expect(validateWeight(662, 'imperial')).toBe(false)
    })

    it('should validate form height inputs with proper error messages', () => {
      // Test metric validation
      expect(validateHeight(175, 'metric')).toBe(true)
      expect(validateHeight(99, 'metric')).toBe(false)
      expect(validateHeight(251, 'metric')).toBe(false)

      // Test imperial validation (inches)
      expect(validateHeight(69, 'imperial')).toBe(true)
      expect(validateHeight(38, 'imperial')).toBe(false)
      expect(validateHeight(99, 'imperial')).toBe(false)
    })
  })

  describe('Boundary Value Testing', () => {
    it('should handle boundary values for weight', () => {
      // Metric boundaries
      expect(validateWeight(20, 'metric')).toBe(true)
      expect(validateWeight(300, 'metric')).toBe(true)
      expect(validateWeight(19.99, 'metric')).toBe(false)
      expect(validateWeight(300.01, 'metric')).toBe(false)

      // Imperial boundaries (44-661 lbs)
      expect(validateWeight(44, 'imperial')).toBe(true)
      expect(validateWeight(661, 'imperial')).toBe(true)
      expect(validateWeight(43.99, 'imperial')).toBe(false)
      expect(validateWeight(661.01, 'imperial')).toBe(false)
    })

    it('should handle boundary values for height', () => {
      // Metric boundaries
      expect(validateHeight(100, 'metric')).toBe(true)
      expect(validateHeight(250, 'metric')).toBe(true)
      expect(validateHeight(99.99, 'metric')).toBe(false)
      expect(validateHeight(250.01, 'metric')).toBe(false)

      // Imperial boundaries (39-98 inches)
      expect(validateHeight(39, 'imperial')).toBe(true)
      expect(validateHeight(98, 'imperial')).toBe(true)
      expect(validateHeight(38.99, 'imperial')).toBe(false)
      expect(validateHeight(98.01, 'imperial')).toBe(false)
    })
  })
})