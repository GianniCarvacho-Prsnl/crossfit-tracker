'use client'

import { useState } from 'react'
import { Exercise, WeightUnit, WorkoutFormData } from '@/types/workout'
import { calculateOneRM, isCalculatedRM } from '@/utils/calculations'
import { convertToLbs } from '@/utils/conversions'
import { AppError } from '@/utils/errorHandling'
import ErrorDisplay from '@/components/ui/ErrorDisplay'
import { LoadingButton } from '@/components/ui/LoadingState'

interface WorkoutFormProps {
  onSubmit: (data: WorkoutFormData) => Promise<void>
  loading?: boolean
  error?: AppError | null
  onRetry?: () => void
  onClearError?: () => void
}

const EXERCISES: Exercise[] = ['Clean', 'Snatch', 'Deadlift', 'Front Squat', 'Back Squat']

export default function WorkoutForm({ 
  onSubmit, 
  loading = false, 
  error = null,
  onRetry,
  onClearError
}: WorkoutFormProps) {
  const [formData, setFormData] = useState<WorkoutFormData>({
    exercise: 'Clean',
    weight: 0,
    repetitions: 1,
    unit: 'lbs'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [calculatedRM, setCalculatedRM] = useState<number | null>(null)

  // Calculate 1RM whenever weight or reps change
  const updateCalculatedRM = (weight: number, reps: number) => {
    if (weight > 0 && reps > 0 && reps <= 20) {
      try {
        const rm = calculateOneRM(weight, reps)
        setCalculatedRM(rm)
      } catch {
        setCalculatedRM(null)
      }
    } else {
      setCalculatedRM(null)
    }
  }

  const handleInputChange = (field: keyof WorkoutFormData, value: any) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Clear global error when user starts typing
    if (error && onClearError) {
      onClearError()
    }
    
    // Update calculated 1RM if weight or reps changed
    if (field === 'weight' || field === 'repetitions') {
      updateCalculatedRM(
        field === 'weight' ? value : newFormData.weight,
        field === 'repetitions' ? value : newFormData.repetitions
      )
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.exercise) {
      newErrors.exercise = 'Selecciona un ejercicio'
    }
    
    if (formData.weight <= 0) {
      newErrors.weight = 'El peso debe ser mayor a 0'
    }
    
    if (formData.repetitions <= 0) {
      newErrors.repetitions = 'Las repeticiones deben ser mayor a 0'
    }
    
    if (formData.repetitions > 20) {
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
      await onSubmit(formData)
      // Reset form on successful submission
      setFormData({
        exercise: 'Clean',
        weight: 0,
        repetitions: 1,
        unit: 'lbs'
      })
      setCalculatedRM(null)
      setErrors({}) // Clear any existing errors
    } catch (error) {
      console.error('Error submitting form:', error)
      // The error handling is now done in the parent component
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-responsive" data-testid="workout-form">
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
          value={formData.exercise}
          onChange={(e) => handleInputChange('exercise', e.target.value as Exercise)}
          className="input-mobile w-full"
          data-testid="exercise-select"
        >
          {EXERCISES.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
        </select>
        {errors.exercise && (
          <p className="mt-2 text-responsive-xs text-red-600">{errors.exercise}</p>
        )}
      </div>

      {/* Weight Input */}
      <div>
        <label htmlFor="weight" className="block text-responsive-sm font-medium text-gray-700 mb-2">
          Peso
        </label>
        <div className="flex gap-2 sm:gap-3">
          <input
            id="weight"
            type="number"
            step="0.5"
            min="0"
            value={formData.weight || ''}
            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
            className="input-mobile flex-1"
            placeholder="Peso"
            data-testid="weight-input"
          />
          <select
            value={formData.unit}
            onChange={(e) => handleInputChange('unit', e.target.value as WeightUnit)}
            className="input-mobile w-20 sm:w-24"
            data-testid="unit-select"
          >
            <option value="lbs">lbs</option>
            <option value="kg">kg</option>
          </select>
        </div>
        {errors.weight && (
          <p className="mt-2 text-responsive-xs text-red-600">{errors.weight}</p>
        )}
        <p className="mt-2 text-responsive-xs text-gray-500">
          Incluye barra olímpica (45 lbs) + discos de ambos lados
        </p>
      </div>

      {/* Repetitions Input */}
      <div>
        <label htmlFor="repetitions" className="block text-responsive-sm font-medium text-gray-700 mb-2">
          Repeticiones
        </label>
        <input
          id="repetitions"
          type="number"
          min="1"
          max="20"
          value={formData.repetitions || ''}
          onChange={(e) => handleInputChange('repetitions', parseInt(e.target.value) || 1)}
          className="input-mobile w-full"
          placeholder="Número de repeticiones"
          data-testid="reps-input"
        />
        {errors.repetitions && (
          <p className="mt-2 text-responsive-xs text-red-600">{errors.repetitions}</p>
        )}
      </div>

      {/* 1RM Calculation Display */}
      {calculatedRM && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-responsive-sm font-medium text-blue-800 mb-2">
            1RM {isCalculatedRM(formData.repetitions) ? 'Calculado' : 'Directo'}
          </h3>
          <div className="text-responsive-lg font-semibold text-blue-900">
            {calculatedRM.toFixed(1)} {formData.unit}
            {formData.unit === 'lbs' && (
              <span className="text-responsive-sm font-normal text-blue-700 ml-2 block sm:inline">
                ({(calculatedRM / 2.20462).toFixed(1)} kg)
              </span>
            )}
            {formData.unit === 'kg' && (
              <span className="text-responsive-sm font-normal text-blue-700 ml-2 block sm:inline">
                ({(calculatedRM * 2.20462).toFixed(1)} lbs)
              </span>
            )}
          </div>
          {isCalculatedRM(formData.repetitions) && (
            <p className="text-responsive-xs text-blue-600 mt-2">
              Calculado usando fórmula de Epley
            </p>
          )}
        </div>
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