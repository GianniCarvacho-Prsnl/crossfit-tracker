'use client'

import { useState } from 'react'
import { Exercise } from '@/types/workout'
import { calculateCustomPercentage, PercentageCalculation } from '@/utils/rmPercentages'
import { formatPlateConfiguration } from '@/utils/plateCalculations'

interface CustomPercentageCalculatorProps {
  exercise: Exercise
  oneRM: number
  onCalculate: (percentage: number, calculation: PercentageCalculation) => void
}

export default function CustomPercentageCalculator({ 
  exercise, 
  oneRM, 
  onCalculate 
}: CustomPercentageCalculatorProps) {
  const [percentage, setPercentage] = useState<string>('')
  const [calculation, setCalculation] = useState<PercentageCalculation | null>(null)
  const [error, setError] = useState<string>('')

  const handleCalculate = () => {
    setError('')
    
    const percentageNum = parseFloat(percentage)
    
    // Validaciones
    if (isNaN(percentageNum)) {
      setError('Ingresa un porcentaje válido')
      return
    }
    
    if (percentageNum <= 0 || percentageNum > 150) {
      setError('El porcentaje debe estar entre 1 y 150')
      return
    }
    
    try {
      const calc = calculateCustomPercentage(oneRM, percentageNum)
      setCalculation(calc)
      onCalculate(percentageNum, calc)
    } catch (err) {
      setError('Error al calcular el porcentaje')
    }
  }

  const handlePercentageChange = (value: string) => {
    setPercentage(value)
    setError('')
    setCalculation(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate()
    }
  }

  const isExact = calculation && Math.abs(calculation.plateCalculation.difference) < 0.1

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Calculadora de Porcentaje Personalizado
      </h3>
      
      <div className="space-y-4">
        <div>
          
          <label htmlFor="custom-percentage" style={{color: '#1f2937', fontWeight: '500', fontSize: '14px'}}>

            Porcentaje del 1RM de {exercise} ({oneRM.toFixed(1)} lbs)
          </label>
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                id="custom-percentage"
                type="number"
                min="1"
                max="150"
                step="0.1"
                value={percentage}
                onChange={(e) => handlePercentageChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ej: 75.5"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleCalculate}
              disabled={!percentage}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Calcular
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {calculation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">
              Resultado: {calculation.percentage}% de {oneRM.toFixed(1)} lbs = {calculation.weightLbs.toFixed(1)} lbs
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-blue-700 mb-1">Peso calculado:</div>
                <div className="font-medium text-blue-900">
                  {calculation.weightLbs.toFixed(1)} lbs ({calculation.weightKg.toFixed(1)} kg)
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {oneRM.toFixed(1)} × {calculation.percentage}% = {calculation.weightLbs.toFixed(1)} lbs
                </div>
              </div>
              
              <div>
                <div className="text-sm text-blue-700 mb-1">Peso real con discos disponibles:</div>
                <div className="font-medium text-blue-900">
                  {calculation.plateCalculation.totalWeight.toFixed(1)} lbs
                  {!isExact && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      {calculation.plateCalculation.difference > 0 ? '+' : ''}
                      {calculation.plateCalculation.difference.toFixed(1)} lbs diferencia
                    </span>
                  )}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {isExact ? 'Peso exacto posible' : 'Peso más cercano posible con discos disponibles'}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-sm text-blue-700 mb-2">Combinación de discos (por lado):</div>
              <div className="font-medium text-blue-900 bg-white px-3 py-2 rounded border">
                Barra olímpica (45 lbs) + {formatPlateConfiguration(calculation.plateCalculation.plates)} por lado
              </div>
              <div className="text-xs text-blue-600 mt-2">
                <strong>Nota:</strong> Los discos mostrados son por cada lado de la barra. El peso total incluye la barra (45 lbs) más los discos de ambos lados.
              </div>
            </div>
            
            {!isExact && (
              <div className="mt-3 text-xs text-blue-600">
                <strong>Nota:</strong> El peso exacto no es posible con los discos disponibles. 
                Se muestra la combinación más cercana.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}