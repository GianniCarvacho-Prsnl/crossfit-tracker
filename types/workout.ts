// Exercise interface for dynamic loading
export interface Exercise {
  id: number
  name: string
  created_at: string
}

// Legacy type for backward compatibility (will be removed)
export type ExerciseName = string

// Weight units
export type WeightUnit = 'lbs' | 'kg'

// Workout record interface (aligned with database schema)
export interface WorkoutRecord {
  id: string
  user_id: string
  exercise_id: number          // References exercises table
  weight_lbs: number           // Weight stored always in pounds
  repetitions: number
  calculated_1rm: number       // 1RM calculated or direct
  is_calculated: boolean       // true if calculated with Epley formula
  original_unit: WeightUnit    // Unit originally entered by user
  created_at: string
  updated_at: string
}

// Workout record with exercise details joined
export interface WorkoutRecordWithExercise {
  id: string
  user_id: string
  exercise: Exercise
  weight_lbs: number
  repetitions: number
  calculated_1rm: number
  is_calculated: boolean
  original_unit: WeightUnit
  created_at: string
  updated_at: string
}

// Form data for creating new workout records
export interface WorkoutFormData {
  exercise: ExerciseName
  weight: number
  repetitions: number
  unit: WeightUnit
  date?: Date
}

// Exercise statistics
export interface ExerciseStats {
  exercise: ExerciseName
  currentPR: number
  lastWorkout: Date
  totalWorkouts: number
}