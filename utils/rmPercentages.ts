/**
 * Utilidades para cálculo de porcentajes de RM (Repetition Maximum)
 * Maneja la lógica de cálculo de intensidades de entrenamiento
 */

import { calculateTargetWeight, PlateCalculation } from './plateCalculations'
import { convertLbsToKg } from './conversions'
import { Exercise } from '@/types/workout'

// Porcentajes comunes utilizados en CrossFit
export const COMMON_PERCENTAGES = [50, 60, 65, 70, 75, 80, 85, 90, 95, 100]

// Interface para representar un PR de ejercicio
export interface ExercisePR {
  exercise: Exercise
  oneRM: number // en libras
  date: string
}

// Interface para representar un cálculo de porcentaje
export interface PercentageCalculation {
  percentage: number
  weightLbs: number
  weightKg: number
  plateCalculation: PlateCalculation
}

// Interface para representar una tabla completa de porcentajes para un ejercicio
export interface ExercisePercentageTable {
  exercise: Exercise
  oneRM: number
  percentages: PercentageCalculation[]
}

/**
 * Calcula un porcentaje específico de un 1RM
 */
export const calculatePercentage = (oneRM: number, percentage: number): number => {
  if (percentage < 0 || percentage > 150) {
    throw new Error('El porcentaje debe estar entre 0 y 150')
  }
  
  return Math.round((oneRM * percentage / 100) * 10) / 10 // Redondear a 1 decimal
}

/**
 * Calcula todos los porcentajes comunes para un 1RM específico
 */
export const calculateAllPercentages = (
  exercise: Exercise, 
  oneRM: number, 
  percentages: number[] = COMMON_PERCENTAGES
): ExercisePercentageTable => {
  const percentageCalculations: PercentageCalculation[] = percentages.map(percentage => {
    const weightLbs = calculatePercentage(oneRM, percentage)
    const weightKg = convertLbsToKg(weightLbs)
    const plateCalculation = calculateTargetWeight(weightLbs, 'lbs')
    
    return {
      percentage,
      weightLbs,
      weightKg: Math.round(weightKg * 10) / 10, // Redondear a 1 decimal
      plateCalculation
    }
  })
  
  return {
    exercise,
    oneRM,
    percentages: percentageCalculations
  }
}

/**
 * Calcula un porcentaje personalizado para un 1RM específico
 */
export const calculateCustomPercentage = (
  oneRM: number, 
  percentage: number
): PercentageCalculation => {
  const weightLbs = calculatePercentage(oneRM, percentage)
  const weightKg = convertLbsToKg(weightLbs)
  const plateCalculation = calculateTargetWeight(weightLbs, 'lbs')
  
  return {
    percentage,
    weightLbs,
    weightKg: Math.round(weightKg * 10) / 10,
    plateCalculation
  }
}

/**
 * Formatea un porcentaje para mostrar al usuario
 */
export const formatPercentage = (percentage: number): string => {
  return `${percentage}%`
}

/**
 * Formatea un peso con unidad para mostrar al usuario
 */
export const formatWeightWithUnit = (weight: number, unit: 'lbs' | 'kg'): string => {
  return `${weight.toFixed(1)} ${unit}`
}

/**
 * Valida si un 1RM es válido para cálculos
 */
export const validateOneRM = (oneRM: number): boolean => {
  return oneRM > 0 && oneRM <= 1000 // Límite razonable para 1RM
}

/**
 * Obtiene los porcentajes más comunes para diferentes tipos de entrenamiento
 */
export const getTrainingPercentages = (trainingType: 'strength' | 'power' | 'endurance'): number[] => {
  switch (trainingType) {
    case 'strength':
      return [85, 90, 95, 100]
    case 'power':
      return [70, 75, 80, 85]
    case 'endurance':
      return [50, 60, 65, 70]
    default:
      return COMMON_PERCENTAGES
  }
}

/**
 * Calcula el rango de repeticiones recomendado para un porcentaje dado
 */
export const getRecommendedReps = (percentage: number): string => {
  if (percentage >= 95) return '1-2 reps'
  if (percentage >= 90) return '2-3 reps'
  if (percentage >= 85) return '3-4 reps'
  if (percentage >= 80) return '4-5 reps'
  if (percentage >= 75) return '5-6 reps'
  if (percentage >= 70) return '6-8 reps'
  if (percentage >= 65) return '8-10 reps'
  if (percentage >= 60) return '10-12 reps'
  return '12+ reps'
}