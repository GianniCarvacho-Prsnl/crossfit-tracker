'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { DynamicImprovedWorkoutForm } from '@/utils/dynamicImports'
import { WorkoutFormData } from '@/types/workout'
import { workoutRecordService } from '@/utils/services/workoutRecords'
import { AppError } from '@/utils/errorHandling'
import { ErrorToast } from '@/components/ui/ErrorDisplay'

interface SuccessMessage {
  text: string
  details?: string
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null)

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleSubmit = async (formData: WorkoutFormData) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    const result = await workoutRecordService.createWorkoutRecord(formData)
    
    if (result.success) {
      setSuccessMessage({
        text: '¡Registro guardado exitosamente!',
        details: `${formData.exercise}: ${formData.weight} ${formData.unit} x ${formData.repetitions} rep${formData.repetitions > 1 ? 's' : ''}`
      })
    } else {
      setError(result.error || null)
    }

    setLoading(false)
  }

  const handleRetry = () => {
    // The form will handle the retry by resubmitting
    setError(null)
  }

  const handleClearError = () => {
    setError(null)
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-responsive px-responsive">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 text-responsive-sm font-medium min-h-touch flex items-center"
              data-testid="back-to-dashboard"
            >
              ← Volver al Dashboard
            </a>
          </div>
          <h1 className="text-responsive-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            Registrar Nuevo Peso
          </h1>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg border bg-green-50 border-green-200">
              <div className="font-medium text-responsive-base text-green-800">
                {successMessage.text}
              </div>
              {successMessage.details && (
                <div className="mt-2 text-responsive-sm text-green-600">
                  {successMessage.details}
                </div>
              )}
              <div className="mt-4">
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="text-responsive-sm text-green-600 hover:text-green-800 underline min-h-touch"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          <div className="card-mobile" data-testid="register-form">
            <DynamicImprovedWorkoutForm 
              onSubmit={handleSubmit} 
              loading={loading}
              error={error}
              onRetry={handleRetry}
              onClearError={handleClearError}
            />
          </div>

          {/* Error Toast */}
          {error && (
            <ErrorToast
              error={error}
              onDismiss={() => setError(null)}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}