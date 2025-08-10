import { useState, useEffect } from 'react'
import { Exercise } from '@/types/workout'
import { ExerciseService } from '@/services/exerciseService'
import { AppError, ErrorType } from '@/utils/errorHandling'

interface UseExercisesReturn {
  exercises: Exercise[]
  loading: boolean
  error: AppError | null
  refetch: () => Promise<void>
  clearError: () => void
  createExercise: (name: string) => Promise<Exercise>
  updateExercise: (id: number, name: string) => Promise<Exercise>
  deleteExercise: (id: number) => Promise<void>
}

export function useExercises(): UseExercisesReturn {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)

  const fetchExercises = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ExerciseService.getAllExercises()
      setExercises(data)
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError(
        'Error al cargar ejercicios',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      ))
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const createExercise = async (name: string): Promise<Exercise> => {
    try {
      const newExercise = await ExerciseService.createExercise(name)
      setExercises(prev => [...prev, newExercise].sort((a, b) => a.name.localeCompare(b.name)))
      return newExercise
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al crear ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  const updateExercise = async (id: number, name: string): Promise<Exercise> => {
    try {
      const updatedExercise = await ExerciseService.updateExercise(id, name)
      setExercises(prev => 
        prev.map(ex => ex.id === id ? updatedExercise : ex)
           .sort((a, b) => a.name.localeCompare(b.name))
      )
      return updatedExercise
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al actualizar ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  const deleteExercise = async (id: number): Promise<void> => {
    try {
      await ExerciseService.deleteExercise(id)
      setExercises(prev => prev.filter(ex => ex.id !== id))
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(
        'Error al eliminar ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      )
      setError(error)
      throw error
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [])

  return {
    exercises,
    loading,
    error,
    refetch: fetchExercises,
    clearError,
    createExercise,
    updateExercise,
    deleteExercise
  }
}