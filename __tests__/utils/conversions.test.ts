import {
  convertKgToLbs,
  convertLbsToKg,
  convertToLbs,
  formatWeight,
  getBothUnits
} from '@/utils/conversions'

describe('convertKgToLbs', () => {
  test('should convert kilograms to pounds correctly', () => {
    expect(convertKgToLbs(100)).toBeCloseTo(220.462, 3)
    expect(convertKgToLbs(50)).toBeCloseTo(110.231, 3)
    expect(convertKgToLbs(1)).toBeCloseTo(2.20462, 5)
    expect(convertKgToLbs(0)).toBe(0)
  })

  test('should handle decimal values', () => {
    expect(convertKgToLbs(45.5)).toBeCloseTo(100.31, 2)
  })

  test('should throw error for negative values', () => {
    expect(() => convertKgToLbs(-10)).toThrow('Weight cannot be negative')
  })
})

describe('convertLbsToKg', () => {
  test('should convert pounds to kilograms correctly', () => {
    expect(convertLbsToKg(220.462)).toBeCloseTo(100, 3)
    expect(convertLbsToKg(110.231)).toBeCloseTo(50, 3)
    expect(convertLbsToKg(2.20462)).toBeCloseTo(1, 5)
    expect(convertLbsToKg(0)).toBe(0)
  })

  test('should handle decimal values', () => {
    expect(convertLbsToKg(225)).toBeCloseTo(102.06, 2)
  })

  test('should throw error for negative values', () => {
    expect(() => convertLbsToKg(-50)).toThrow('Weight cannot be negative')
  })
})

describe('convertToLbs', () => {
  test('should return same value for pounds', () => {
    expect(convertToLbs(100, 'lbs')).toBe(100)
    expect(convertToLbs(225.5, 'lbs')).toBe(225.5)
  })

  test('should convert kilograms to pounds', () => {
    expect(convertToLbs(100, 'kg')).toBeCloseTo(220.462, 3)
    expect(convertToLbs(50, 'kg')).toBeCloseTo(110.231, 3)
  })

  test('should throw error for negative values', () => {
    expect(() => convertToLbs(-10, 'lbs')).toThrow('Weight cannot be negative')
    expect(() => convertToLbs(-5, 'kg')).toThrow('Weight cannot be negative')
  })

  test('should throw error for invalid unit', () => {
    expect(() => convertToLbs(100, 'invalid' as any)).toThrow('Invalid unit. Must be "lbs" or "kg"')
  })
})

describe('formatWeight', () => {
  test('should format weight in pounds correctly', () => {
    expect(formatWeight(100, 'lbs')).toBe('100.0 lbs')
    expect(formatWeight(225.5, 'lbs')).toBe('225.5 lbs')
    expect(formatWeight(100, 'lbs', 2)).toBe('100.00 lbs')
  })

  test('should format weight in kilograms correctly', () => {
    expect(formatWeight(220.462, 'kg')).toBe('100.0 kg')
    expect(formatWeight(110.231, 'kg')).toBe('50.0 kg')
    expect(formatWeight(220.462, 'kg', 2)).toBe('100.00 kg')
  })

  test('should handle zero weight', () => {
    expect(formatWeight(0, 'lbs')).toBe('0.0 lbs')
    expect(formatWeight(0, 'kg')).toBe('0.0 kg')
  })

  test('should throw error for negative values', () => {
    expect(() => formatWeight(-10, 'lbs')).toThrow('Weight cannot be negative')
  })

  test('should throw error for invalid unit', () => {
    expect(() => formatWeight(100, 'invalid' as any)).toThrow('Invalid display unit. Must be "lbs" or "kg"')
  })
})

describe('getBothUnits', () => {
  test('should return both pound and kilogram representations', () => {
    const result = getBothUnits(220.462)
    expect(result.lbs).toBe('220.5 lbs')
    expect(result.kg).toBe('100.0 kg')
  })

  test('should respect decimal places parameter', () => {
    const result = getBothUnits(225, 2)
    expect(result.lbs).toBe('225.00 lbs')
    expect(result.kg).toBe('102.06 kg')
  })

  test('should handle zero weight', () => {
    const result = getBothUnits(0)
    expect(result.lbs).toBe('0.0 lbs')
    expect(result.kg).toBe('0.0 kg')
  })
})