'use client'

import { ExercisePercentageTable } from '@/utils/rmPercentages'
import { formatPlateConfiguration } from '@/utils/plateCalculations'

interface PercentageTableProps {
  exerciseTable: ExercisePercentageTable
  customPercentages?: number[]
}

export default function PercentageTable({ 
  exerciseTable, 
  customPercentages 
}: PercentageTableProps) {
  const { exercise, oneRM, percentages } = exerciseTable

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Porcentajes de {exercise.name}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          1RM actual: {oneRM.toFixed(1)} lbs ({(oneRM / 2.20462).toFixed(1)} kg)
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Porcentaje
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peso (lbs)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peso (kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discos por Lado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diferencia
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {percentages.map((calc, index) => {
              const isCustom = customPercentages?.includes(calc.percentage)
              const isExact = Math.abs(calc.plateCalculation.difference) < 0.1
              
              return (
                <tr 
                  key={calc.percentage}
                  className={`
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    ${isCustom ? 'bg-blue-50' : ''}
                  `}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                    {calc.percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {calc.weightLbs.toFixed(1)} lbs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {calc.weightKg.toFixed(1)} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      <span>
                        {formatPlateConfiguration(calc.plateCalculation.plates)} por lado
                      </span>
                      {!isExact && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Aprox.
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isExact ? (
                      <span className="text-green-600 font-medium">Exacto</span>
                    ) : (
                      <span className={`font-medium ${calc.plateCalculation.difference > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {calc.plateCalculation.difference > 0 ? '+' : ''}{calc.plateCalculation.difference.toFixed(1)} lbs
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-start space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span>Exacto: El peso se puede lograr exactamente con los discos disponibles</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
              <span>Aprox.: Peso aproximado (diferencia mostrada en la última columna)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <strong>Nota importante:</strong> Los discos mostrados son por cada lado de la barra. 
            El peso total incluye la barra olímpica (45 lbs) más los discos de ambos lados.
            <br />
            <strong>Ejemplo:</strong> &quot;1×45 + 1×10&quot; significa 1 disco de 45 lbs + 1 disco de 10 lbs en cada lado = 45 + (45×2) + (10×2) = 155 lbs total.
          </div>
        </div>
      </div>
    </div>
  )
}