'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { workoutRecordService } from '@/utils/services/workoutRecords'
import { WorkoutRecordWithExercise, Exercise } from '@/types/workout'
import { formatWeight } from '@/utils/conversions'
import Link from 'next/link'
import PerformanceMonitor from '@/components/PerformanceMonitor'

interface ExercisePR {
  exercise: string
  weight: number
  date: string
  isCalculated: boolean
}

interface DashboardStats {
  totalWorkouts: number
  recentRecords: WorkoutRecordWithExercise[]
  personalRecords: ExercisePR[]
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Error de autenticación')
        return
      }

      // Get workout records
      const result = await workoutRecordService.getWorkoutRecords(user.id)
      if (!result.success || !result.data) {
        setError(typeof result.error === 'string' ? result.error : 'Error al cargar datos')
        return
      }

      const records = result.data as WorkoutRecordWithExercise[]
      
      // Calculate statistics
      const totalWorkouts = records.length
      const recentRecords = records.slice(0, 5) // Last 5 records
      
      // Calculate personal records by exercise
      const exerciseMap = new Map<string, ExercisePR>()
      
      records.forEach(record => {
        const exercise = record.exercise.name
        const current = exerciseMap.get(exercise)
        
        if (!current || record.calculated_1rm > current.weight) {
          exerciseMap.set(exercise, {
            exercise,
            weight: record.calculated_1rm,
            date: record.created_at,
            isCalculated: record.is_calculated
          })
        }
      })
      
      const personalRecords = Array.from(exerciseMap.values())
        .sort((a, b) => b.weight - a.weight)

      setStats({
        totalWorkouts,
        recentRecords,
        personalRecords
      })

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Error inesperado al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PerformanceMonitor />
      <div className="max-w-7xl mx-auto py-responsive px-responsive" data-testid="dashboard">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-responsive-3xl font-bold text-gray-900 mb-3">
            CrossFit Tracker
          </h1>
          <p className="text-responsive-lg text-gray-600">
            Dashboard de tus récords personales
          </p>
        </div>



        {/* Personal Records */}
        {stats?.personalRecords && stats.personalRecords.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-responsive-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Récords Personales (1RM)
            </h2>
            <div className="card-mobile p-0 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {stats.personalRecords.map((pr) => (
                  <div key={pr.exercise} className="p-4 sm:p-6 flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-responsive-base truncate">{pr.exercise}</div>
                      <div className="text-responsive-sm text-gray-500 mt-1">
                        {formatDate(pr.date)} • {pr.isCalculated ? 'Calculado' : 'Directo'}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-gray-900 text-responsive-base">
                        {formatWeight(pr.weight, 'lbs')}
                      </div>
                      <div className="text-responsive-sm text-gray-500">
                        {formatWeight(pr.weight, 'kg')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Records */}
        {stats?.recentRecords && stats.recentRecords.length > 0 && (
          <div className="mb-8 sm:mb-12" data-testid="recent-records">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-responsive-xl font-semibold text-gray-900">
                Registros Recientes
              </h2>
              <Link
                href="/records"
                className="text-blue-600 hover:text-blue-700 text-responsive-sm font-medium min-h-touch flex items-center"
                data-testid="view-records-link"
              >
                Ver todos →
              </Link>
            </div>
            <div className="card-mobile p-0 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {stats.recentRecords.map((record) => (
                  <div key={record.id} className="p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-responsive-base truncate">
                          {record.exercise.name}
                        </div>
                        <div className="text-responsive-sm text-gray-500 mt-1">
                          {formatDate(record.created_at)} • {record.repetitions} rep{record.repetitions > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-semibold text-gray-900 text-responsive-sm">
                          {formatWeight(record.calculated_1rm, 'lbs')} (1RM)
                        </div>
                        <div className="text-responsive-xs text-gray-500 mt-1">
                          {formatWeight(record.weight_lbs, record.original_unit)} × {record.repetitions}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-responsive-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white p-responsive rounded-lg text-center transition-colors min-h-touch flex flex-col justify-center active:scale-95 transform transition-transform duration-75"
              data-testid="register-workout-link"
            >
              <div className="text-responsive-lg font-semibold mb-2">Registrar Peso</div>
              <div className="text-responsive-sm opacity-90">Nuevo récord personal</div>
            </Link>
            
            <Link
              href="/records"
              className="bg-green-600 hover:bg-green-700 text-white p-responsive rounded-lg text-center transition-colors min-h-touch flex flex-col justify-center active:scale-95 transform transition-transform duration-75"
              data-testid="view-records-link"
            >
              <div className="text-responsive-lg font-semibold mb-2">Ver Historial</div>
              <div className="text-responsive-sm opacity-90">Todos los registros</div>
            </Link>
            
            <Link
              href="/conversions"
              className="bg-purple-600 hover:bg-purple-700 text-white p-responsive rounded-lg text-center transition-colors min-h-touch flex flex-col justify-center active:scale-95 transform transition-transform duration-75"
            >
              <div className="text-responsive-lg font-semibold mb-2">Conversiones</div>
              <div className="text-responsive-sm opacity-90">Libras ↔ Kilogramos</div>
            </Link>
            
            <Link
              href="/percentages"
              className="bg-orange-600 hover:bg-orange-700 text-white p-responsive rounded-lg text-center transition-colors min-h-touch flex flex-col justify-center active:scale-95 transform transition-transform duration-75"
            >
              <div className="text-responsive-lg font-semibold mb-2">Porcentajes RM</div>
              <div className="text-responsive-sm opacity-90">Cálculo de intensidad</div>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {stats?.totalWorkouts === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="text-gray-400 mb-6">
              <svg className="mx-auto h-16 w-16 sm:h-20 sm:w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-responsive-lg font-medium text-gray-900 mb-3">
              ¡Comienza tu seguimiento!
            </h3>
            <p className="text-responsive-base text-gray-600 mb-8 max-w-md mx-auto">
              Registra tu primer entrenamiento para ver tus estadísticas aquí.
            </p>
            <Link
              href="/register"
              className="btn-primary inline-flex items-center min-h-[52px] px-8 text-responsive-base font-semibold"
            >
              Registrar Primer Peso
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}