'use client'

interface WeightSummaryProps {
  barWeight: number
  platesWeight: number
  className?: string
}

export default function WeightSummary({ barWeight, platesWeight, className = '' }: WeightSummaryProps) {
  const totalLbs = barWeight + platesWeight
  const totalKg = totalLbs / 2.20462

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-responsive-sm font-medium text-gray-800 mb-3">
        Resumen del Peso Total
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-responsive-sm text-gray-600">Barra olímpica:</span>
          <span className="text-responsive-sm font-medium text-gray-900">
            {barWeight} lbs
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-responsive-sm text-gray-600">Discos:</span>
          <span className="text-responsive-sm font-medium text-gray-900">
            {platesWeight} lbs
          </span>
        </div>
        
        <hr className="border-gray-200" />
        
        <div className="flex justify-between items-center">
          <span className="text-responsive-base font-medium text-gray-900">Total:</span>
          <div className="text-right">
            <div className="text-responsive-lg font-bold text-blue-600">
              {totalLbs} lbs
            </div>
            <div className="text-responsive-sm text-gray-500">
              {totalKg.toFixed(1)} kg
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
