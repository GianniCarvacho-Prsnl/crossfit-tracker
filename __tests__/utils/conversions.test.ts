import {
  convertKgToLbs,
  convertLbsToKg,
  convertToLbs,
  formatWeight,
  getBothUnits,
  convertCmToInches,
  convertInchesToCm,
  convertInchesToFeetAndInches,
  convertFeetAndInchesToInches,
  formatHeight,
  getBothHeightUnits
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

describe('convertCmToInches', () => {
  test('should convert centimeters to inches correctly', () => {
    expect(convertCmToInches(175)).toBeCloseTo(68.898, 3)
    expect(convertCmToInches(180)).toBeCloseTo(70.866, 3)
    expect(convertCmToInches(100)).toBeCloseTo(39.370, 3)
    expect(convertCmToInches(0)).toBe(0)
  })

  test('should handle decimal values', () => {
    expect(convertCmToInches(172.5)).toBeCloseTo(67.913, 3)
  })

  test('should throw error for negative values', () => {
    expect(() => convertCmToInches(-10)).toThrow('Height cannot be negative')
  })
})

describe('convertInchesToCm', () => {
  test('should convert inches to centimeters correctly', () => {
    expect(convertInchesToCm(68.898)).toBeCloseTo(175, 1)
    expect(convertInchesToCm(70.866)).toBeCloseTo(180, 1)
    expect(convertInchesToCm(39.370)).toBeCloseTo(100, 1)
    expect(convertInchesToCm(0)).toBe(0)
  })

  test('should handle decimal values', () => {
    expect(convertInchesToCm(72)).toBeCloseTo(182.88, 2)
  })

  test('should throw error for negative values', () => {
    expect(() => convertInchesToCm(-10)).toThrow('Height cannot be negative')
  })
})

describe('convertInchesToFeetAndInches', () => {
  test('should convert inches to feet and inches correctly', () => {
    expect(convertInchesToFeetAndInches(72)).toEqual({ feet: 6, inches: 0 })
    expect(convertInchesToFeetAndInches(69)).toEqual({ feet: 5, inches: 9 })
    expect(convertInchesToFeetAndInches(60)).toEqual({ feet: 5, inches: 0 })
    expect(convertInchesToFeetAndInches(0)).toEqual({ feet: 0, inches: 0 })
  })

  test('should handle decimal values', () => {
    expect(convertInchesToFeetAndInches(69.5)).toEqual({ feet: 5, inches: 9.5 })
  })

  test('should throw error for negative values', () => {
    expect(() => convertInchesToFeetAndInches(-10)).toThrow('Height cannot be negative')
  })
})

describe('convertFeetAndInchesToInches', () => {
  test('should convert feet and inches to total inches correctly', () => {
    expect(convertFeetAndInchesToInches(6, 0)).toBe(72)
    expect(convertFeetAndInchesToInches(5, 9)).toBe(69)
    expect(convertFeetAndInchesToInches(5, 0)).toBe(60)
    expect(convertFeetAndInchesToInches(0, 0)).toBe(0)
  })

  test('should handle decimal inches', () => {
    expect(convertFeetAndInchesToInches(5, 9.5)).toBe(69.5)
  })

  test('should throw error for negative values', () => {
    expect(() => convertFeetAndInchesToInches(-1, 0)).toThrow('Height values cannot be negative')
    expect(() => convertFeetAndInchesToInches(5, -1)).toThrow('Height values cannot be negative')
  })

  test('should throw error for inches >= 12', () => {
    expect(() => convertFeetAndInchesToInches(5, 12)).toThrow('Inches must be less than 12')
    expect(() => convertFeetAndInchesToInches(5, 15)).toThrow('Inches must be less than 12')
  })
})

describe('formatHeight', () => {
  test('should format height in metric correctly', () => {
    expect(formatHeight(175, 'metric')).toBe('175 cm')
    expect(formatHeight(180, 'metric')).toBe('180 cm')
    expect(formatHeight(0, 'metric')).toBe('0 cm')
  })

  test('should format height in imperial correctly', () => {
    expect(formatHeight(182.88, 'imperial')).toBe('6\'0"')
    expect(formatHeight(175.26, 'imperial')).toBe('5\'9"')
  })

  test('should throw error for negative values', () => {
    expect(() => formatHeight(-10, 'metric')).toThrow('Height cannot be negative')
  })

  test('should throw error for invalid unit', () => {
    expect(() => formatHeight(175, 'invalid' as any)).toThrow('Invalid display unit. Must be "metric" or "imperial"')
  })
})

describe('getBothHeightUnits', () => {
  test('should return both metric and imperial representations', () => {
    const result = getBothHeightUnits(175)
    expect(result.metric).toBe('175 cm')
    expect(result.imperial).toBe('5\'8.9"')
  })

  test('should handle different heights', () => {
    const result = getBothHeightUnits(182.88)
    expect(result.metric).toBe('182.88 cm')
    expect(result.imperial).toBe('6\'0"')
  })

  test('should handle zero height', () => {
    const result = getBothHeightUnits(0)
    expect(result.metric).toBe('0 cm')
    expect(result.imperial).toBe('0\'0"')
  })
})