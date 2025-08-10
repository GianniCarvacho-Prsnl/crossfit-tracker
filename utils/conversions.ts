// Conversion factor: 1 kg = 2.20462 lbs
const KG_TO_LBS_FACTOR = 2.20462

/**
 * Convert kilograms to pounds
 * 
 * @param kg - Weight in kilograms
 * @returns Weight in pounds
 */
export function convertKgToLbs(kg: number): number {
  if (kg < 0) {
    throw new Error('Weight cannot be negative')
  }
  
  return kg * KG_TO_LBS_FACTOR
}

/**
 * Convert pounds to kilograms
 * 
 * @param lbs - Weight in pounds
 * @returns Weight in kilograms
 */
export function convertLbsToKg(lbs: number): number {
  if (lbs < 0) {
    throw new Error('Weight cannot be negative')
  }
  
  return lbs / KG_TO_LBS_FACTOR
}

/**
 * Convert weight to pounds for storage (all weights stored in lbs)
 * 
 * @param weight - The weight value
 * @param unit - The unit of the weight ('lbs' or 'kg')
 * @returns Weight converted to pounds
 */
export function convertToLbs(weight: number, unit: 'lbs' | 'kg'): number {
  if (weight < 0) {
    throw new Error('Weight cannot be negative')
  }
  
  if (unit === 'lbs') {
    return weight
  }
  
  if (unit === 'kg') {
    return convertKgToLbs(weight)
  }
  
  throw new Error('Invalid unit. Must be "lbs" or "kg"')
}

/**
 * Format weight for display with appropriate unit
 * 
 * @param weightInLbs - Weight stored in pounds
 * @param displayUnit - Unit to display ('lbs' or 'kg')
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted weight string
 */
export function formatWeight(
  weightInLbs: number, 
  displayUnit: 'lbs' | 'kg', 
  decimals: number = 1
): string {
  if (weightInLbs < 0) {
    throw new Error('Weight cannot be negative')
  }
  
  let displayWeight: number
  
  if (displayUnit === 'lbs') {
    displayWeight = weightInLbs
  } else if (displayUnit === 'kg') {
    displayWeight = convertLbsToKg(weightInLbs)
  } else {
    throw new Error('Invalid display unit. Must be "lbs" or "kg"')
  }
  
  return `${displayWeight.toFixed(decimals)} ${displayUnit}`
}

/**
 * Get both pound and kilogram representations of a weight
 * 
 * @param weightInLbs - Weight stored in pounds
 * @param decimals - Number of decimal places (default: 1)
 * @returns Object with both representations
 */
export function getBothUnits(
  weightInLbs: number, 
  decimals: number = 1
): { lbs: string; kg: string } {
  return {
    lbs: formatWeight(weightInLbs, 'lbs', decimals),
    kg: formatWeight(weightInLbs, 'kg', decimals)
  }
}

// Height conversion constants
const CM_TO_INCHES_FACTOR = 0.393701
const INCHES_TO_CM_FACTOR = 2.54

/**
 * Convert centimeters to inches
 * 
 * @param cm - Height in centimeters
 * @returns Height in inches
 */
export function convertCmToInches(cm: number): number {
  if (cm < 0) {
    throw new Error('Height cannot be negative')
  }
  
  return cm * CM_TO_INCHES_FACTOR
}

/**
 * Convert inches to centimeters
 * 
 * @param inches - Height in inches
 * @returns Height in centimeters
 */
export function convertInchesToCm(inches: number): number {
  if (inches < 0) {
    throw new Error('Height cannot be negative')
  }
  
  return inches * INCHES_TO_CM_FACTOR
}

/**
 * Convert inches to feet and inches format
 * 
 * @param totalInches - Total height in inches
 * @returns Object with feet and remaining inches
 */
export function convertInchesToFeetAndInches(totalInches: number): { feet: number; inches: number } {
  if (totalInches < 0) {
    throw new Error('Height cannot be negative')
  }
  
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round((totalInches % 12) * 10) / 10 // Round to 1 decimal
  
  return { feet, inches }
}

/**
 * Convert feet and inches to total inches
 * 
 * @param feet - Number of feet
 * @param inches - Number of inches
 * @returns Total height in inches
 */
export function convertFeetAndInchesToInches(feet: number, inches: number): number {
  if (feet < 0 || inches < 0) {
    throw new Error('Height values cannot be negative')
  }
  
  if (inches >= 12) {
    throw new Error('Inches must be less than 12')
  }
  
  return feet * 12 + inches
}

/**
 * Format height for display with appropriate unit
 * 
 * @param heightInCm - Height stored in centimeters
 * @param displayUnit - Unit to display ('metric' or 'imperial')
 * @returns Formatted height string
 */
export function formatHeight(
  heightInCm: number, 
  displayUnit: 'metric' | 'imperial'
): string {
  if (heightInCm < 0) {
    throw new Error('Height cannot be negative')
  }
  
  if (displayUnit === 'metric') {
    return `${heightInCm} cm`
  } else if (displayUnit === 'imperial') {
    const totalInches = convertCmToInches(heightInCm)
    const { feet, inches } = convertInchesToFeetAndInches(totalInches)
    return `${feet}'${inches}"`
  } else {
    throw new Error('Invalid display unit. Must be "metric" or "imperial"')
  }
}

/**
 * Get both metric and imperial representations of height
 * 
 * @param heightInCm - Height stored in centimeters
 * @returns Object with both representations
 */
export function getBothHeightUnits(heightInCm: number): { metric: string; imperial: string } {
  return {
    metric: formatHeight(heightInCm, 'metric'),
    imperial: formatHeight(heightInCm, 'imperial')
  }
}