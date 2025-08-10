'use client'

import { Exercise } from '@/types/workout'
import { ExercisePR } from '@/utils/rmPercentages'

interface ExerciseSelectorProps {
  prs: ExercisePR[]
  selectedExercise: Exercise | null
  onExerciseSelect: (exercise: Exercise) => void
  loading?: boolean
}

export default function ExerciseSelector({ 
  prs, 
  selectedExercise, 
  onExerciseSelect, 
  loading = false 
}: ExerciseSelectorProps) {
  // Get all exercises that have PRs, sorted alphabetically
  const availableExercises = prs
    .map(pr => pr.exercise)
    .sort((a, b) => a.name.localeCompare(b.name))

  console.log('Available exercises:', availableExercises)
  console.log('PRs:', prs)

  const getPRForExercise = (exerciseName: string): ExercisePR | undefined => {
    return prs.find(pr => pr.exercise.name === exerciseName)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Selecciona un Ejercicio
        </h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (prs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Selecciona un Ejercicio
        </h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No hay registros disponibles
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Necesitas registrar al menos un peso para poder calcular porcentajes de RM. Ve a la página de &quot;Registrar&quot; para agregar tus primeros registros.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Selecciona un Ejercicio
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Elige el ejercicio para el cual quieres calcular porcentajes de RM
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableExercises.map((exercise) => {
          const pr = getPRForExercise(exercise.name)
          const isSelected = selectedExercise?.name === exercise.name
          
          return (
            <button
              key={exercise.id}
              onClick={() => pr && onExerciseSelect(exercise)}
              className={`
                p-4 rounded-lg border-2 text-left transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 text-blue-900' 
                  : 'border-gray-200 bg-white text-gray-900 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
            >
              <div className="font-medium text-sm mb-1">{exercise.name}</div>
              <div className="text-xs text-gray-600">
                PR: {pr?.oneRM.toFixed(1)} lbs
              </div>
            </button>
          )
        })}
      </div>
      
      {selectedExercise && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-900">
                {selectedExercise.name}
              </div>
              <div className="text-sm text-blue-700">
                PR actual: {getPRForExercise(selectedExercise.name)?.oneRM.toFixed(1)} lbs
              </div>
            </div>
            <div className="text-xs text-blue-600">
              Seleccionado
            </div>
          </div>
        </div>
      )}
    </div>
  )
}