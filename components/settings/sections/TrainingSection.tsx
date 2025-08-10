'use client'

import React, { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { useExerciseGoals } from '@/hooks/useExerciseGoals'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useExercises } from '@/hooks/useExercises'
import SettingsCard from '@/components/settings/shared/SettingsCard'
import SettingsToggle from '@/components/settings/shared/SettingsToggle'
import SettingsButton from '@/components/settings/shared/SettingsButton'
import { AppError, ErrorType } from '@/utils/errorHandling'
import { Exercise } from '@/types/database'

interface TrainingSectionProps {
  user: User
}

interface GoalFormData {
  exerciseId: number
  targetWeight: string
  targetDate: string
  notes: string
}

const TrainingSection: React.FC<TrainingSectionProps> = ({ user }) => {
  const { goals, loading: goalsLoading, error: goalsError, setGoal, deleteGoal } = useExerciseGoals(user?.id || '')
  const { preferences, loading: prefsLoading, updateSinglePreference } = useUserPreferences(user?.id || '')
  const { exercises, loading: exercisesLoading } = useExercises()
  
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [goalFormData, setGoalFormData] = useState<GoalFormData>({
    exerciseId: 0,
    targetWeight: '',
    targetDate: '',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  // Reset form when closing
  useEffect(() => {
    if (!showGoalForm && !editingGoal) {
      setGoalFormData({
        exerciseId: 0,
        targetWeight: '',
        targetDate: '',
        notes: ''
      })
    }
  }, [showGoalForm, editingGoal])

  const handleSaveGoal = async () => {
    if (!goalFormData.exerciseId || !goalFormData.targetWeight) {
      setError(new AppError(
        'Por favor completa los campos requeridos',
        ErrorType.VALIDATION,
        'Por favor completa los campos requeridos'
      ))
      return
    }

    try {
      setSaving(true)
      setError(null)

      const targetWeightLbs = parseFloat(goalFormData.targetWeight)
      if (isNaN(targetWeightLbs) || targetWeightLbs <= 0) {
        throw new AppError(
          'El peso objetivo debe ser un número válido mayor a 0',
          ErrorType.VALIDATION,
          'Invalid target weight'
        )
      }

      await setGoal(goalFormData.exerciseId, {
        target_1rm_lbs: targetWeightLbs,
        target_date: goalFormData.targetDate || null,
        notes: goalFormData.notes || null
      })

      setShowGoalForm(false)
      setEditingGoal(null)
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError(
        'Error al guardar meta de ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      ))
    } finally {
      setSaving(false)
    }
  }

  const handleEditGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (goal) {
      setGoalFormData({
        exerciseId: goal.exercise_id,
        targetWeight: goal.target_1rm_lbs?.toString() || '',
        targetDate: goal.target_date || '',
        notes: goal.notes || ''
      })
      setEditingGoal(goalId)
      setShowGoalForm(true)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta meta?')) {
      return
    }

    try {
      setError(null)
      await deleteGoal(goalId)
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError(
        'Error al eliminar meta de ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      ))
    }
  }

  const handlePreferenceUpdate = async (key: string, value: any) => {
    if (!user?.id) return

    try {
      setUpdating(key)
      setError(null)
      await updateSinglePreference(key as any, value)
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError(
        'Error al actualizar preferencia',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      ))
    } finally {
      setUpdating(null)
    }
  }

  const getExerciseName = (exerciseId: number): string => {
    const exercise = exercises.find(e => e.id === exerciseId)
    return exercise?.name || `Ejercicio ${exerciseId}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (goalsLoading || prefsLoading || exercisesLoading) {
    return (
      <div className="space-y-4" data-testid="loading-skeleton">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (goalsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{goalsError.userMessage}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error.userMessage}</p>
        </div>
      )}

      {/* Metas Personales por Ejercicio */}
      <SettingsCard
        title="Metas Personales"
        description="Establece objetivos de 1RM para cada ejercicio"
      >
        <div className="space-y-3">
          {goals.length > 0 ? (
            <div className="space-y-2">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{getExerciseName(goal.exercise_id)}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Meta: {goal.target_1rm_lbs} lbs</p>
                      {goal.target_date && (
                        <p>Fecha objetivo: {formatDate(goal.target_date)}</p>
                      )}
                      {goal.notes && (
                        <p className="text-xs">Notas: {goal.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditGoal(goal.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No tienes metas establecidas aún.</p>
          )}

          {!showGoalForm ? (
            <SettingsButton
              onClick={() => setShowGoalForm(true)}
              variant="secondary"
              size="sm"
            >
              {editingGoal ? 'Cancelar edición' : 'Agregar Meta'}
            </SettingsButton>
          ) : (
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900">
                {editingGoal ? 'Editar Meta' : 'Nueva Meta'}
              </h4>
              
              <div>
                <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Ejercicio *
                </label>
                <select
                  id="exercise-select"
                  value={goalFormData.exerciseId}
                  onChange={(e) => setGoalFormData(prev => ({ ...prev, exerciseId: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={saving}
                >
                  <option value={0}>Selecciona un ejercicio</option>
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="target-weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Peso objetivo (lbs) *
                </label>
                <input
                  id="target-weight"
                  type="number"
                  value={goalFormData.targetWeight}
                  onChange={(e) => setGoalFormData(prev => ({ ...prev, targetWeight: e.target.value }))}
                  placeholder="ej. 225"
                  min="1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="target-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha objetivo (opcional)
                </label>
                <input
                  id="target-date"
                  type="date"
                  value={goalFormData.targetDate}
                  onChange={(e) => setGoalFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="goal-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  id="goal-notes"
                  value={goalFormData.notes}
                  onChange={(e) => setGoalFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Estrategia, motivación, etc."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  disabled={saving}
                />
              </div>

              <div className="flex space-x-2">
                <SettingsButton
                  onClick={handleSaveGoal}
                  loading={saving}
                  size="sm"
                >
                  {editingGoal ? 'Actualizar' : 'Guardar'}
                </SettingsButton>
                <SettingsButton
                  onClick={() => {
                    setShowGoalForm(false)
                    setEditingGoal(null)
                  }}
                  variant="secondary"
                  size="sm"
                  disabled={saving}
                >
                  Cancelar
                </SettingsButton>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Recordatorios de Entrenamiento */}
      {preferences && (
        <SettingsCard
          title="Recordatorios de Entrenamiento"
          description="Configura notificaciones para mantener tu rutina"
        >
          <SettingsToggle
            label="Recordatorios habilitados"
            description="Recibir recordatorios para entrenar regularmente"
            checked={preferences.workout_reminders}
            onChange={(checked) => handlePreferenceUpdate('workout_reminders', checked)}
            disabled={updating === 'workout_reminders' || !preferences.notifications_enabled}
          />

          {!preferences.notifications_enabled && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800">
                Los recordatorios requieren que las notificaciones estén habilitadas en Preferencias de Aplicación.
              </p>
            </div>
          )}

          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Próximamente:</strong> Configuración de horarios específicos y frecuencia de recordatorios.
            </p>
          </div>
        </SettingsCard>
      )}

      {/* Fórmulas de Cálculo de 1RM */}
      {preferences && (
        <SettingsCard
          title="Cálculos de 1RM"
          description="Selecciona la fórmula preferida para calcular tu 1RM"
        >
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Fórmula preferida
            </label>
            <select
              value={preferences.preferred_1rm_formula}
              onChange={(e) => handlePreferenceUpdate('preferred_1rm_formula', e.target.value)}
              disabled={updating === 'preferred_1rm_formula'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="epley">Epley (más común)</option>
              <option value="brzycki">Brzycki (más conservadora)</option>
              <option value="lombardi">Lombardi (para altas repeticiones)</option>
            </select>
            
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              <p><strong>Epley:</strong> 1RM = peso × (1 + repeticiones/30)</p>
              <p><strong>Brzycki:</strong> 1RM = peso × (36/(37-repeticiones))</p>
              <p><strong>Lombardi:</strong> 1RM = peso × repeticiones^0.10</p>
            </div>
          </div>
        </SettingsCard>
      )}

      {/* Integración con Sistema de Notificaciones */}
      <SettingsCard
        title="Sistema de Notificaciones"
        description="Estado de integración con notificaciones"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">Notificaciones del navegador</span>
            <span className="text-xs text-gray-500">
              {typeof window !== 'undefined' && 'Notification' in window 
                ? (Notification.permission === 'granted' ? '✅ Permitidas' : 
                   Notification.permission === 'denied' ? '❌ Bloqueadas' : '⚠️ No configuradas')
                : '❌ No soportadas'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">Recordatorios de metas</span>
            <span className="text-xs text-gray-500">
              {goals.filter(g => g.target_date).length > 0 
                ? `${goals.filter(g => g.target_date).length} metas con fecha`
                : 'Sin metas programadas'}
            </span>
          </div>
        </div>

        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Próximamente:</strong> Notificaciones push, recordatorios inteligentes basados en tu historial de entrenamientos, y alertas de progreso hacia tus metas.
          </p>
        </div>
      </SettingsCard>

      {updating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">Actualizando configuración...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingSection