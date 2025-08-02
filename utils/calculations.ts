/**
 * Calculate 1RM using the Epley formula
 * Formula: 1RM = (Weight * 0.0333 * Repetitions) + Weight
 * For 1 repetition, returns the weight directly
 * 
 * @param weight - The weight lifted
 * @param repetitions - Number of repetitions performed
 * @returns Calculated 1RM
 */
export function calculateOneRM(weight: number, repetitions: number): number {
  if (repetitions <= 0) {
    throw new Error('Repetitions must be greater than 0')
  }
  
  if (weight <= 0) {
    throw new Error('Weight must be greater than 0')
  }

  // For 1 rep, return the weight directly (it's already the 1RM)
  if (repetitions === 1) {
    return weight
  }

  // Apply Epley formula for multiple reps
  return (weight * 0.0333 * repetitions) + weight
}

/**
 * Calculate percentage of 1RM
 * 
 * @param oneRM - The 1RM value
 * @param percentage - Percentage to calculate (e.g., 70 for 70%)
 * @returns Weight at the specified percentage
 */
export function calculatePercentageRM(oneRM: number, percentage: number): number {
  if (oneRM <= 0) {
    throw new Error('1RM must be greater than 0')
  }
  
  if (percentage <= 0 || percentage > 100) {
    throw new Error('Percentage must be between 0 and 100')
  }

  return (oneRM * percentage) / 100
}

/**
 * Determine if a 1RM was calculated using the Epley formula or is direct
 * 
 * @param repetitions - Number of repetitions
 * @returns true if calculated, false if direct
 */
export function isCalculatedRM(repetitions: number): boolean {
  return repetitions > 1
}