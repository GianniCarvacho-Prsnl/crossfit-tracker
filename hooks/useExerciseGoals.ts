import { useState, useEffect } from 'react'
import { ExerciseGoals, NewExerciseGoals, UpdateExerciseGoals } from '@/types/database'
import { ExerciseGoalsService } from '@/services/exerciseGoalsService'
import { AppError, ErrorType } from '@/utils/errorHandling'

interface UseExerciseGoalsReturn {
  goals: ExerciseGoals[]
  loading: boolean
  error: AppError | null
  refetch: () => Promise<void>
  createGoal: (goalData: NewExerciseGoals) => Promise<ExerciseGoals>
  updateGoal: (goalId: string, updates: UpdateExerciseGoals) => Promise<ExerciseGoals>
  deleteGoal: (goalId: string) => Promise<void>
  setGoal: (exerciseId: number, goalData: Omit<NewExerciseGoals, 'user_id' | 'exercise_id'>) => Promise<ExerciseGoals>
  getGoalByExercise: (exerciseId: number) => ExerciseGoals | undefined
  getUpcomingGoals: (daysAhead?: number) => Promise<ExerciseGoals[]>
}

export function useExerciseGoals(userId: string): UseExerciseGoalsReturn {
  const [goals, setGoals] = useState<ExerciseGoals[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)

  const fetchGoals = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await ExerciseGoalsService.getUserExerciseGoals(userId)
      setGoals(data)
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError(
        'Error al cargar metas de ejercicios',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      ))
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async (goalData: NewExerciseGoals): Promise<ExerciseGoals> => {
    try {
      setError(null)
      const newGoal = await ExerciseGoalsService.createExerciseGoal(goalData)
      setGoals(prev => [newGoal, ...prev])
      return newGoal
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al crear meta de ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  const updateGoal = async (goalId: string, updates: UpdateExerciseGoals): Promise<ExerciseGoals> => {
    try {
      setError(null)
      const updatedGoal = await ExerciseGoalsService.updateExerciseGoal(goalId, updates)
      setGoals(prev => prev.map(goal => goal.id === goalId ? updatedGoal : goal))
      return updatedGoal
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al actualizar meta de ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  const deleteGoal = async (goalId: string): Promise<void> => {
    try {
      setError(null)
      await ExerciseGoalsService.deleteExerciseGoal(goalId)
      setGoals(prev => prev.filter(goal => goal.id !== goalId))
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al eliminar meta de ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  const setGoal = async (
    exerciseId: number, 
    goalData: Omit<NewExerciseGoals, 'user_id' | 'exercise_id'>
  ): Promise<ExerciseGoals> => {
    try {
      setError(null)
      const goal = await ExerciseGoalsService.setExerciseGoal(userId, exerciseId, goalData)
      
      // Update local state - either add new goal or update existing one
      setGoals(prev => {
        const existingIndex = prev.findIndex(g => g.exercise_id === exerciseId)
        if (existingIndex >= 0) {
          // Update existing goal
          const updated = [...prev]
          updated[existingIndex] = goal
          return updated
        } else {
          // Add new goal
          return [goal, ...prev]
        }
      })
      
      return goal
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al establecer meta de ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  const getGoalByExercise = (exerciseId: number): ExerciseGoals | undefined => {
    return goals.find(goal => goal.exercise_id === exerciseId)
  }

  const getUpcomingGoals = async (daysAhead: number = 30): Promise<ExerciseGoals[]> => {
    try {
      setError(null)
      const upcomingGoals = await ExerciseGoalsService.getUpcomingGoals(userId, daysAhead)
      return upcomingGoals
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al cargar metas próximas',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [userId])

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    setGoal,
    getGoalByExercise,
    getUpcomingGoals
  }
}