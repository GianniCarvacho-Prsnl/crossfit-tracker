'use client'

import { useState, useEffect } from 'react'
import { Exercise, ExerciseName, WorkoutFormData } from '@/types/workout'
import { calculateOneRM, isCalculatedRM } from '@/utils/calculations'
import { AppError } from '@/utils/errorHandling'
import ErrorDisplay from '@/components/ui/ErrorDisplay'
import { LoadingButton } from '@/components/ui/LoadingState'
import { useExercises } from '@/hooks/useExercises'
import BarSelector from './BarSelector'
import PlatesInput from './PlatesInput'
import WeightSummary from './WeightSummary'
import BarVisualization from './BarVisualization'

type PlateInputMode = 'total' | 'per-side'

interface ImprovedWorkoutFormProps {
  onSubmit: (data: WorkoutFormData) => Promise<void>
  loading?: boolean
  error?: AppError | null
  onRetry?: () => void
  onClearError?: () => void
}

export default function ImprovedWorkoutForm({ 
  onSubmit, 
  loading = false, 
  error = null,
  onRetry,
  onClearError
}: ImprovedWorkoutFormProps) {
  const { exercises, loading: exercisesLoading, error: exercisesError } = useExercises()
  
  // Form state
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [barWeight, setBarWeight] = useState<number>(45)
  const [platesWeight, setPlatesWeight] = useState<number>(0)
  const [repetitions, setRepetitions] = useState<number | ''>(1)
  const [plateInputMode, setPlateInputMode] = useState<PlateInputMode>('total')
  
  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [calculatedRM, setCalculatedRM] = useState<number | null>(null)

  // Set default exercise when exercises load
  useEffect(() => {
    if (exercises.length > 0 && !selectedExercise) {
      setSelectedExercise(exercises[0].name)
    }
  }, [exercises, selectedExercise])

  // Calculate total weight and 1RM whenever inputs change
  const totalWeight = barWeight + platesWeight
  const numericRepetitions = typeof repetitions === 'number' ? repetitions : 1
  
  useEffect(() => {
    if (totalWeight > 0 && numericRepetitions > 0 && numericRepetitions <= 20) {
      try {
        const rm = calculateOneRM(totalWeight, numericRepetitions)
        setCalculatedRM(rm)
      } catch {
        setCalculatedRM(null)
      }
    } else {
      setCalculatedRM(null)
    }
  }, [totalWeight, numericRepetitions])

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleExerciseChange = (exercise: string) => {
    setSelectedExercise(exercise)
    clearFieldError('exercise')
    if (error && onClearError) onClearError()
  }

  const handleBarWeightChange = (weight: number) => {
    setBarWeight(weight)
    clearFieldError('weight')
    if (error && onClearError) onClearError()
  }

  const handlePlatesWeightChange = (weight: number) => {
    setPlatesWeight(weight)
    clearFieldError('weight')
    if (error && onClearError) onClearError()
  }

  const handleRepetitionsChange = (reps: number | '') => {
    setRepetitions(reps)
    clearFieldError('repetitions')
    if (error && onClearError) onClearError()
  }

  const handlePlateInputModeChange = (mode: PlateInputMode) => {
    setPlateInputMode(mode)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!selectedExercise) {
      newErrors.exercise = 'Selecciona un ejercicio'
    }
    
    if (totalWeight <= 0) {
      newErrors.weight = 'El peso total debe ser mayor a 0'
    }
    
    if (platesWeight < 0) {
      newErrors.weight = 'El peso de los discos no puede ser negativo'
    }

    if (platesWeight > 500) {
      newErrors.weight = 'El peso de los discos no puede exceder 500 lbs'
    }
    
    if (numericRepetitions <= 0 || repetitions === '') {
      newErrors.repetitions = 'Las repeticiones deben ser mayor a 0'
    }
    
    if (numericRepetitions > 20) {
      newErrors.repetitions = 'Máximo 20 repeticiones para cálculo preciso'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      // Convert to the expected WorkoutFormData format
      const formData: WorkoutFormData = {
        exercise: selectedExercise as ExerciseName,
        weight: totalWeight, // This is the total weight in lbs
        repetitions: numericRepetitions,
        unit: 'lbs' // Always lbs as specified in requirements
      }
      
      await onSubmit(formData)
      
      // Reset form on successful submission
      setSelectedExercise(exercises.length > 0 ? exercises[0].name : '')
      setBarWeight(45)
      setPlatesWeight(0)
      setRepetitions(1)
      setPlateInputMode('total')
      setCalculatedRM(null)
      setErrors({})
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  // Show loading state while exercises are loading
  if (exercisesLoading) {
    return (
      <div className="space-y-responsive" data-testid="improved-workout-form-loading">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-responsive-sm text-gray-600">Cargando ejercicios...</p>
        </div>
      </div>
    )
  }

  // Show error if exercises failed to load
  if (exercisesError) {
    return (
      <div className="space-y-responsive" data-testid="improved-workout-form-error">
        <ErrorDisplay
          error={exercisesError}
          onRetry={() => window.location.reload()}
          variant="card"
        />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="improved-workout-form">
      {/* Global Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={onRetry}
          onDismiss={onClearError}
          variant="card"
          className="mb-4"
        />
      )}

      {loading && (
        <div data-testid="loading" className="text-center">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Exercise Selection */}
      <div>
        <label htmlFor="exercise" className="block text-responsive-sm font-medium text-gray-700 mb-2">
          Ejercicio
        </label>
        <select
          id="exercise"
          value={selectedExercise}
          onChange={(e) => handleExerciseChange(e.target.value)}
          className="input-mobile w-full"
          data-testid="exercise-select"
          disabled={exercises.length === 0}
        >
          {exercises.length === 0 ? (
            <option value="">No hay ejercicios disponibles</option>
          ) : (
            exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.name}>
                {exercise.name}
              </option>
            ))
          )}
        </select>
        {errors.exercise && (
          <p className="mt-2 text-responsive-xs text-red-600">{errors.exercise}</p>
        )}
      </div>

      {/* Bar Weight and Repetitions Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <BarSelector
          value={barWeight}
          onChange={handleBarWeightChange}
          disabled={loading}
        />
        
        <div>
          <label htmlFor="repetitions" className="block text-responsive-sm font-medium text-gray-700 mb-2">
            <span className="sm:hidden">Reps</span>
            <span className="hidden sm:inline">Repeticiones</span>
          </label>
          <input
            id="repetitions"
            type="number"
            min="1"
            max="20"
            value={repetitions}
            onChange={(e) => {
              const value = e.target.value
              if (value === '') {
                handleRepetitionsChange('')
              } else {
                const numValue = parseInt(value)
                if (!isNaN(numValue)) {
                  handleRepetitionsChange(numValue)
                }
              }
            }}
            className="input-mobile w-full"
            placeholder="Reps"
            disabled={loading}
            data-testid="reps-input"
          />
          {errors.repetitions && (
            <p className="mt-2 text-responsive-xs text-red-600">{errors.repetitions}</p>
          )}
        </div>
      </div>

      {/* Plates Weight Input */}
      <PlatesInput
        value={platesWeight}
        onChange={handlePlatesWeightChange}
        mode={plateInputMode}
        onModeChange={handlePlateInputModeChange}
        disabled={loading}
      />
      {errors.weight && (
        <p className="mt-2 text-responsive-xs text-red-600">{errors.weight}</p>
      )}

      {/* Weight Summary */}
      <WeightSummary
        barWeight={barWeight}
        platesWeight={platesWeight}
      />

      {/* Bar Visualization with 1RM info */}
      {totalWeight > 0 && (
        <BarVisualization
          barWeight={barWeight}
          platesWeight={platesWeight}
          calculatedRM={calculatedRM}
          repetitions={numericRepetitions}
        />
      )}

      {/* Submit Button */}
      <LoadingButton
        type="submit"
        loading={loading}
        loadingText="Guardando..."
        className="btn-primary w-full min-h-[48px] sm:min-h-[52px] text-responsive-base font-semibold"
        data-testid="submit-workout"
      >
        Registrar Peso
      </LoadingButton>
    </form>
  )
}
