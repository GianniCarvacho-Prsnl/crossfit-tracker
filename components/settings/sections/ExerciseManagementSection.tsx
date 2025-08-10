'use client'

import React, { useState, memo, useCallback, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { Exercise } from '@/types/workout'
import { useExercises } from '@/hooks/useExercises'
import { AppError, ErrorType } from '@/utils/errorHandling'
import ErrorDisplay from '@/components/ui/ErrorDisplay'
import { LoadingButton } from '@/components/ui/LoadingState'
import SettingsCard from '../shared/SettingsCard'

interface ExerciseManagementSectionProps {
  user: User
  tempFormData: Record<string, any>
  updateTempFormData: (key: string, value: any) => void
  saveTempChanges: () => void
  discardTempChanges: () => void
  hasUnsavedChanges: boolean
}

const ExerciseManagementSection: React.FC<ExerciseManagementSectionProps> = memo(({
  user,
  tempFormData,
  updateTempFormData,
  saveTempChanges,
  discardTempChanges,
  hasUnsavedChanges
}) => {
  const { exercises, loading, error, clearError, createExercise, updateExercise, deleteExercise } = useExercises()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<AppError | null>(null)
  const [newExerciseName, setNewExerciseName] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  const validateExerciseName = useCallback((name: string): string | null => {
    if (!name.trim()) return 'El nombre del ejercicio es requerido'
    if (name.length > 50) return 'El nombre es demasiado largo (máximo 50 caracteres)'
    if (exercises.some(ex => ex.name.toLowerCase() === name.toLowerCase())) {
      return 'Ya existe un ejercicio con este nombre'
    }
    return null
  }, [exercises])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewExerciseName(value)
    setInputError(validateExerciseName(value))
  }, [validateExerciseName])

  const handleCreateExercise = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedName = newExerciseName.trim()
    const validationError = validateExerciseName(trimmedName)
    
    if (!trimmedName || validationError) {
      setInputError(validationError || 'El nombre del ejercicio es requerido')
      return
    }

    try {
      setActionLoading('create')
      setActionError(null)
      setInputError(null)
      await createExercise(trimmedName)
      setNewExerciseName('')
    } catch (err) {
      setActionError(err instanceof AppError ? err : new AppError(
        'Error al crear ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err.message : 'Unknown error'
      ))
    } finally {
      setActionLoading(null)
    }
  }, [newExerciseName, validateExerciseName, createExercise])

  const handleStartEdit = useCallback((exercise: Exercise) => {
    setEditingId(exercise.id)
    setEditingName(exercise.name)
    setActionError(null)
  }, [])

  // Focus the edit input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      const input = editInputRef.current
      input.focus()
      input.select() // Select all text for easy editing
    }
  }, [editingId])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingName('')
    setActionError(null)
  }, [])

  const handleEditInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEditingName(value)
    setActionError(null) // Clear any previous errors
  }, [])

  const handleSaveEdit = useCallback(async () => {
    if (!editingName.trim() || editingId === null) return

    // Validate the edited name
    const trimmedName = editingName.trim()
    const currentExercise = exercises.find(ex => ex.id === editingId)
    
    // Check if name is different and not duplicate
    if (currentExercise && trimmedName.toLowerCase() !== currentExercise.name.toLowerCase()) {
      const isDuplicate = exercises.some(ex => 
        ex.id !== editingId && ex.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (isDuplicate) {
        setActionError(new AppError(
          'Ya existe un ejercicio con este nombre',
          ErrorType.VALIDATION,
          'Duplicate exercise name'
        ))
        return
      }
    }

    try {
      setActionLoading(`edit-${editingId}`)
      setActionError(null)
      await updateExercise(editingId, trimmedName)
      setEditingId(null)
      setEditingName('')
    } catch (err) {
      setActionError(err instanceof AppError ? err : new AppError(
        'Error al actualizar ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err.message : 'Unknown error'
      ))
    } finally {
      setActionLoading(null)
    }
  }, [editingName, editingId, updateExercise, exercises])

  const handleDeleteExercise = useCallback(async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setActionLoading(`delete-${id}`)
      setActionError(null)
      await deleteExercise(id)
    } catch (err) {
      setActionError(err instanceof AppError ? err : new AppError(
        'Error al eliminar ejercicio',
        ErrorType.DATABASE,
        err instanceof Error ? err.message : 'Unknown error'
      ))
    } finally {
      setActionLoading(null)
    }
  }, [deleteExercise])

  if (loading) {
    return (
      <SettingsCard 
        title="Administrar Ejercicios" 
        description="Gestiona los ejercicios disponibles para seguimiento"
      >
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando ejercicios...</p>
        </div>
      </SettingsCard>
    )
  }

  return (
    <SettingsCard 
      title="Administrar Ejercicios" 
      description="Gestiona los ejercicios disponibles para seguimiento"
    >
      {/* Global Error Display */}
      {(error || actionError) && (
        <ErrorDisplay
          error={error || actionError!}
          onDismiss={() => {
            setActionError(null)
            clearError()
          }}
          variant="card"
          className="mb-4"
          context="exercises"
        />
      )}

      {/* Add New Exercise Form */}
      <form onSubmit={handleCreateExercise} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={newExerciseName}
              onChange={handleInputChange}
              placeholder="Nombre del nuevo ejercicio"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                inputError ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={50}
              autoComplete="off"
              spellCheck="false"
              role="textbox"
              aria-label="Nombre del nuevo ejercicio"
              style={{ 
                backgroundImage: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield'
              }}
            />
            {inputError && (
              <p className="text-xs text-red-600 mt-1">{inputError}</p>
            )}
          </div>
          <LoadingButton
            type="submit"
            loading={actionLoading === 'create'}
            disabled={!newExerciseName.trim() || !!inputError}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </LoadingButton>
        </div>
      </form>

      {/* Exercises List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Ejercicios Disponibles ({exercises.length})
          {editingId && (
            <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Editando ID: {editingId}
            </span>
          )}
          {actionLoading && (
            <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
              Acción: {actionLoading}
            </span>
          )}
        </h4>
        
        {exercises.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No hay ejercicios disponibles
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {editingId === exercise.id ? (
                  <div className="flex items-center gap-2 flex-1 bg-blue-50 p-2 rounded border-2 border-blue-200">
                    <span className="text-xs text-blue-600 font-medium">EDITANDO:</span>
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingName}
                      onChange={handleEditInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSaveEdit()
                        } else if (e.key === 'Escape') {
                          e.preventDefault()
                          handleCancelEdit()
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                      maxLength={50}
                      autoComplete="off"
                      spellCheck="false"
                      readOnly={false}
                      disabled={false}
                      placeholder="Escribe el nuevo nombre..."
                      style={{ 
                        backgroundImage: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                    />
                    <LoadingButton
                      onClick={handleSaveEdit}
                      loading={actionLoading === `edit-${exercise.id}`}
                      disabled={!editingName.trim()}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      type="button"
                    >
                      Guardar
                    </LoadingButton>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                      disabled={actionLoading === `edit-${exercise.id}`}
                      type="button"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-900">
                      {exercise.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleStartEdit(exercise)
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={editingId !== null}
                        type="button"
                      >
                        Editar
                      </button>
                      <LoadingButton
                        onClick={() => handleDeleteExercise(exercise.id, exercise.name)}
                        loading={actionLoading === `delete-${exercise.id}`}
                        className="text-red-600 hover:text-red-800 text-xs font-medium bg-transparent border-none p-0 focus:outline-none focus:underline"
                        disabled={actionLoading !== null && actionLoading !== `delete-${exercise.id}`}
                      >
                        Eliminar
                      </LoadingButton>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SettingsCard>
  )
})

ExerciseManagementSection.displayName = 'ExerciseManagementSection'

export default ExerciseManagementSection