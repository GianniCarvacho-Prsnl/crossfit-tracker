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