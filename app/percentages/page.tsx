'use client'

import { useState, useEffect } from 'react'
import { Exercise } from '@/types/workout'
import { ExercisePR, calculateAllPercentages, ExercisePercentageTable, PercentageCalculation } from '@/utils/rmPercentages'
import { workoutRecordService } from '@/utils/services/workoutRecords'
import { createClient } from '@/utils/supabase/client'
import ExerciseSelector from '@/components/percentages/ExerciseSelector'
import PercentageTable from '@/components/percentages/PercentageTable'
import CustomPercentageCalculator from '@/components/percentages/CustomPercentageCalculator'

export default function PercentagesPage() {
  const [prs, setPrs] = useState<ExercisePR[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [exerciseTable, setExerciseTable] = useState<ExercisePercentageTable | null>(null)
  const [customPercentages, setCustomPercentages] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const supabase = createClient()

  useEffect(() => {
    loadPRs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPRs = async () => {
    try {
      setLoading(true)
      setError('')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Usuario no autenticado')

      const result = await workoutRecordService.getLatestPRs(user.id)
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar los PRs')
      }

      const prsData: ExercisePR[] = result.data?.map((record: any) => ({
        exercise: record.exercise.name as Exercise,
        oneRM: record.calculated_1rm,
        date: record.created_at
      })) || []

      setPrs(prsData)
    } catch (err) {
      console.error('Error loading PRs:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setCustomPercentages([])
    
    const pr = prs.find(p => p.exercise === exercise)
    if (pr) {
      const table = calculateAllPercentages(exercise, pr.oneRM)
      setExerciseTable(table)
    }
  }

  const handleCustomCalculation = (percentage: number, calculation: PercentageCalculation) => {
    if (!customPercentages.includes(percentage)) {
      setCustomPercentages(prev => [...prev, percentage])
      
      // Add the custom percentage to the table
      if (exerciseTable) {
        const updatedTable = {
          ...exerciseTable,
          percentages: [...exerciseTable.percentages, calculation]
            .sort((a, b) => a.percentage - b.percentage)
        }
        setExerciseTable(updatedTable)
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-responsive px-responsive">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-responsive-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Porcentajes de RM
        </h1>
        
        <p className="text-gray-600 mb-8">
          Calcula porcentajes de tus récords personales para planificar entrenamientos con diferentes intensidades. 
          Incluye las combinaciones exactas de discos necesarias para cada peso.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Exercise Selector */}
          <ExerciseSelector
            prs={prs}
            selectedExercise={selectedExercise}
            onExerciseSelect={handleExerciseSelect}
            loading={loading}
          />

          {/* Custom Percentage Calculator */}
          {selectedExercise && exerciseTable && (
            <CustomPercentageCalculator
              exercise={selectedExercise}
              oneRM={exerciseTable.oneRM}
              onCalculate={handleCustomCalculation}
            />
          )}

          {/* Percentage Table */}
          {exerciseTable && (
            <PercentageTable
              exerciseTable={exerciseTable}
              customPercentages={customPercentages}
            />
          )}
        </div>
      </div>
    </div>
  )
}