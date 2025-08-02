import { 
  calculateOneRM, 
  calculatePercentageRM, 
  isCalculatedRM 
} from '@/utils/calculations'

describe('calculateOneRM', () => {
  test('should return the weight directly for 1 repetition', () => {
    expect(calculateOneRM(100, 1)).toBe(100)
    expect(calculateOneRM(225, 1)).toBe(225)
    expect(calculateOneRM(50.5, 1)).toBe(50.5)
  })

  test('should calculate 1RM using Epley formula for multiple reps', () => {
    // Test case: 100 lbs x 5 reps
    // Expected: (100 * 0.0333 * 5) + 100 = 16.65 + 100 = 116.65
    expect(calculateOneRM(100, 5)).toBeCloseTo(116.65, 2)
    
    // Test case: 200 lbs x 3 reps
    // Expected: (200 * 0.0333 * 3) + 200 = 19.98 + 200 = 219.98
    expect(calculateOneRM(200, 3)).toBeCloseTo(219.98, 2)
    
    // Test case: 150 lbs x 8 reps
    // Expected: (150 * 0.0333 * 8) + 150 = 39.96 + 150 = 189.96
    expect(calculateOneRM(150, 8)).toBeCloseTo(189.96, 2)
  })

  test('should handle decimal weights correctly', () => {
    expect(calculateOneRM(102.5, 3)).toBeCloseTo(112.74, 2)
  })

  test('should throw error for invalid repetitions', () => {
    expect(() => calculateOneRM(100, 0)).toThrow('Repetitions must be greater than 0')
    expect(() => calculateOneRM(100, -1)).toThrow('Repetitions must be greater than 0')
  })

  test('should throw error for invalid weight', () => {
    expect(() => calculateOneRM(0, 5)).toThrow('Weight must be greater than 0')
    expect(() => calculateOneRM(-50, 3)).toThrow('Weight must be greater than 0')
  })
})

describe('calculatePercentageRM', () => {
  test('should calculate correct percentage of 1RM', () => {
    expect(calculatePercentageRM(200, 70)).toBe(140)
    expect(calculatePercentageRM(100, 50)).toBe(50)
    expect(calculatePercentageRM(150, 85)).toBe(127.5)
    expect(calculatePercentageRM(225, 90)).toBe(202.5)
  })

  test('should handle decimal percentages', () => {
    expect(calculatePercentageRM(200, 67.5)).toBe(135)
  })

  test('should throw error for invalid 1RM', () => {
    expect(() => calculatePercentageRM(0, 70)).toThrow('1RM must be greater than 0')
    expect(() => calculatePercentageRM(-100, 50)).toThrow('1RM must be greater than 0')
  })

  test('should throw error for invalid percentage', () => {
    expect(() => calculatePercentageRM(200, 0)).toThrow('Percentage must be between 0 and 100')
    expect(() => calculatePercentageRM(200, -10)).toThrow('Percentage must be between 0 and 100')
    expect(() => calculatePercentageRM(200, 101)).toThrow('Percentage must be between 0 and 100')
  })
})

describe('isCalculatedRM', () => {
  test('should return false for 1 repetition (direct 1RM)', () => {
    expect(isCalculatedRM(1)).toBe(false)
  })

  test('should return true for multiple repetitions (calculated 1RM)', () => {
    expect(isCalculatedRM(2)).toBe(true)
    expect(isCalculatedRM(5)).toBe(true)
    expect(isCalculatedRM(10)).toBe(true)
  })
})