'use client'

import { useState, useEffect } from 'react'
import { WorkoutRecordWithExercise, Exercise } from '@/types/workout'
import { formatWeight, getBothUnits } from '@/utils/conversions'
import { workoutRecordService } from '@/utils/services/workoutRecords'
import { createClient } from '@/utils/supabase/client'
import { AppError, ErrorType } from '@/utils/errorHandling'
import ErrorDisplay from '@/components/ui/ErrorDisplay'
import LoadingState from '@/components/ui/LoadingState'

interface RecordsListProps {
  className?: string
}

type SortField = 'date' | 'weight'
type SortOrder = 'asc' | 'desc'

export default function RecordsList({ className = '' }: RecordsListProps) {
  const [records, setRecords] = useState<WorkoutRecordWithExercise[]>([])
  const [filteredRecords, setFilteredRecords] = useState<WorkoutRecordWithExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)
  
  // Filter and sort state
  const [selectedExercise, setSelectedExercise] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const supabase = createClient()

  // Load records on component mount
  useEffect(() => {
    loadRecords()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Apply filters and sorting when records or filter/sort options change
  useEffect(() => {
    applyFiltersAndSort()
  }, [records, selectedExercise, sortField, sortOrder]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadRecords = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Usuario no autenticado')

      const result = await workoutRecordService.getWorkoutRecords(user.id)
      
      if (!result.success) {
        setError(result.error || null)
        return
      }

      setRecords((result.data as any) || [])
    } catch (err) {
      console.error('Error loading records:', err)
      setError(new AppError(
        'Error al cargar registros. Intenta nuevamente.',
        ErrorType.DATABASE,
        err instanceof Error ? err.message : 'Error al cargar registros'
      ))
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...records]

    // Apply exercise filter
    if (selectedExercise !== 'all') {
      filtered = filtered.filter(record => record.exercise.name === selectedExercise)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      if (sortField === 'date') {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        comparison = dateA - dateB
      } else if (sortField === 'weight') {
        comparison = a.calculated_1rm - b.calculated_1rm
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredRecords(filtered)
  }

  const handleExerciseFilter = (exerciseName: string) => {
    setSelectedExercise(exerciseName)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field with default desc order
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return '↕️'
    }
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  if (loading) {
    return (
      <div className={className}>
        <LoadingState message="Cargando registros..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorDisplay
          error={error}
          onRetry={loadRecords}
          onDismiss={() => setError(null)}
          variant="card"
        />
      </div>
    )
  }

  return (
    <div className={className} data-testid="records-list">
      {/* Filter and Sort Controls */}
      <div className="card-mobile mb-4 sm:mb-6" data-testid="sort-controls">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Exercise Filter */}
          <div className="flex-1">
            <label htmlFor="exercise-filter" className="block text-responsive-sm font-medium text-gray-700 mb-2">
              Filtrar por ejercicio
            </label>
            <select
              id="exercise-filter"
              value={selectedExercise}
              onChange={(e) => handleExerciseFilter(e.target.value)}
              className="input-mobile w-full"
              data-testid="exercise-filter"
            >
              <option value="all">Todos los ejercicios</option>
              <option value="Clean">Clean</option>
              <option value="Snatch">Snatch</option>
              <option value="Deadlift">Deadlift</option>
              <option value="Front Squat">Front Squat</option>
              <option value="Back Squat">Back Squat</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => handleSort('date')}
              className={`min-h-touch px-4 py-3 rounded-lg text-responsive-sm font-medium transition-colors border ${
                sortField === 'date'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
              data-testid="sort-by-date"
            >
              <span className="hidden xs:inline">Fecha </span>
              {getSortIcon('date')}
            </button>
            <button
              onClick={() => handleSort('weight')}
              className={`min-h-touch px-4 py-3 rounded-lg text-responsive-sm font-medium transition-colors border ${
                sortField === 'weight'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
              data-testid="sort-by-weight"
            >
              <span className="hidden xs:inline">Peso </span>
              {getSortIcon('weight')}
            </button>
          </div>
        </div>
      </div>

      {/* Records Count */}
      <div className="mb-4">
        <p className="text-responsive-sm text-gray-600">
          {filteredRecords.length === 0 
            ? 'No hay registros' 
            : `${filteredRecords.length} registro${filteredRecords.length !== 1 ? 's' : ''}`
          }
          {selectedExercise !== 'all' && ` de ${selectedExercise}`}
        </p>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-responsive text-center">
          <div className="text-gray-400 text-4xl sm:text-5xl mb-4">📊</div>
          <h3 className="text-responsive-lg font-medium text-gray-900 mb-2">
            {selectedExercise === 'all' ? 'No hay registros' : `No hay registros de ${selectedExercise}`}
          </h3>
          <p className="text-responsive-sm text-gray-600">
            {selectedExercise === 'all' 
              ? 'Registra tu primer entrenamiento'
              : 'Intenta con otro ejercicio o registra un nuevo entrenamiento'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredRecords.map((record) => {
            const bothUnits = getBothUnits(record.calculated_1rm)
            const originalWeight = getBothUnits(record.weight_lbs)
            
            return (
              <div
                key={record.id}
                className="card-mobile hover:shadow-md transition-shadow"
                data-testid="record-item"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-responsive-lg truncate" data-testid="record-exercise">
                      {record.exercise.name}
                    </h3>
                    <p className="text-responsive-sm text-gray-600 mt-1" data-testid="record-date">
                      {formatDate(record.created_at)}
                    </p>
                  </div>
                  
                  {/* Record Type Indicator */}
                  <div className={`px-3 py-1 rounded-full text-responsive-xs font-medium whitespace-nowrap ml-3 ${
                    record.is_calculated
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`} data-testid="record-type">
                    <span className="hidden xs:inline">
                      {record.is_calculated ? '1RM calculado' : '1RM directo'}
                    </span>
                    <span className="xs:hidden">
                      {record.is_calculated ? '📊' : '🎯'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Original Workout */}
                  <div>
                    <p className="text-responsive-sm text-gray-600 mb-2">Entrenamiento original</p>
                    <p className="font-medium text-gray-900 text-responsive-base">
                      {originalWeight.lbs} / {originalWeight.kg}
                    </p>
                    <p className="text-responsive-sm text-gray-600 mt-1">
                      {record.repetitions} rep{record.repetitions !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Calculated 1RM */}
                  <div>
                    <p className="text-responsive-sm text-gray-600 mb-2">
                      1RM {record.is_calculated ? 'calculado' : 'directo'}
                    </p>
                    <p className="font-bold text-responsive-xl text-blue-600" data-testid="record-weight">
                      {bothUnits.lbs}
                    </p>
                    <p className="text-responsive-sm text-gray-600 mt-1">
                      {bothUnits.kg}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}