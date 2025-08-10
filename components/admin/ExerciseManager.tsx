'use client'

import { useState } from 'react'
import { Exercise } from '@/types/workout'
import { useExercises } from '@/hooks/useExercises'
import { AppError, ErrorType } from '@/utils/errorHandling'
import ErrorDisplay from '@/components/ui/ErrorDisplay'
import { LoadingButton } from '@/components/ui/LoadingState'

export default function ExerciseManager() {
  const { exercises, loading, error, createExercise, updateExercise, deleteExercise } = useExercises()
  const [newExerciseName, setNewExerciseName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<AppError | null>(null)

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExerciseName.trim()) return

    try {
      setActionLoading('create')
      setActionError(null)
      await createExercise(newExerciseName.trim())
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
  }

  const handleStartEdit = (exercise: Exercise) => {
    setEditingId(exercise.id)
    setEditingName(exercise.name)
    setActionError(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setActionError(null)
  }

  const handleSaveEdit = async () => {
    if (!editingName.trim() || editingId === null) return

    try {
      setActionLoading(`edit-${editingId}`)
      setActionError(null)
      await updateExercise(editingId, editingName.trim())
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
  }

  const handleDeleteExercise = async (id: number, name: string) => {
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
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-responsive-sm text-gray-600">Cargando ejercicios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-responsive-lg font-semibold text-gray-900 mb-4">
          Administrar Ejercicios
        </h2>

        {/* Global Error Display */}
        {(error || actionError) && (
          <ErrorDisplay
            error={error || actionError!}
            onDismiss={() => setActionError(null)}
            variant="card"
            className="mb-4"
          />
        )}

        {/* Add New Exercise Form */}
        <form onSubmit={handleCreateExercise} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="Nombre del nuevo ejercicio"
              className="input-mobile flex-1"
              maxLength={50}
            />
            <LoadingButton
              type="submit"
              loading={actionLoading === 'create'}
              disabled={!newExerciseName.trim()}
              className="btn-primary px-4 py-2"
            >
              Agregar
            </LoadingButton>
          </div>
        </form>

        {/* Exercises List */}
        <div className="space-y-2">
          <h3 className="text-responsive-base font-medium text-gray-700 mb-3">
            Ejercicios Disponibles ({exercises.length})
          </h3>
          
          {exercises.length === 0 ? (
            <p className="text-responsive-sm text-gray-500 text-center py-4">
              No hay ejercicios disponibles
            </p>
          ) : (
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  {editingId === exercise.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="input-mobile flex-1"
                        maxLength={50}
                        autoFocus
                      />
                      <LoadingButton
                        onClick={handleSaveEdit}
                        loading={actionLoading === `edit-${exercise.id}`}
                        disabled={!editingName.trim()}
                        className="btn-primary px-3 py-1 text-sm"
                      >
                        Guardar
                      </LoadingButton>
                      <button
                        onClick={handleCancelEdit}
                        className="btn-secondary px-3 py-1 text-sm"
                        disabled={actionLoading === `edit-${exercise.id}`}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-responsive-base font-medium text-gray-900">
                        {exercise.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(exercise)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          disabled={actionLoading !== null}
                        >
                          Editar
                        </button>
                        <LoadingButton
                          onClick={() => handleDeleteExercise(exercise.id, exercise.name)}
                          loading={actionLoading === `delete-${exercise.id}`}
                          className="text-red-600 hover:text-red-800 text-sm font-medium bg-transparent border-none p-0"
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
      </div>
    </div>
  )
}