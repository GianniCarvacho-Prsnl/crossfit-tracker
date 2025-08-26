'use client'

interface BarVisualizationProps {
  barWeight: number
  platesWeight: number
  calculatedRM?: number | null
  repetitions: number
  className?: string
}

interface PlateConfig {
  weight: number
  quantity: number
}

function getPlateColor(weight: number): string {
  const colors: Record<number, string> = {
    45: 'bg-red-500',
    35: 'bg-blue-500', 
    25: 'bg-green-500',
    15: 'bg-yellow-500',
    10: 'bg-purple-500',
    5: 'bg-pink-500',
    2.5: 'bg-gray-500'
  };
  return colors[weight] || 'bg-gray-400';
}

function calculatePlateDistribution(totalPlatesWeight: number): PlateConfig[] {
  const weightPerSide = totalPlatesWeight / 2;
  const plates: PlateConfig[] = [];
  let remaining = weightPerSide;
  
  const availablePlates = [45, 25, 15, 10, 5, 2.5];
  
  for (const plateWeight of availablePlates) {
    const quantity = Math.floor(remaining / plateWeight);
    if (quantity > 0) {
      plates.push({ weight: plateWeight, quantity });
      remaining -= quantity * plateWeight;
    }
  }
  
  return plates;
}

export default function BarVisualization({ 
  barWeight, 
  platesWeight, 
  calculatedRM, 
  repetitions,
  className = '' 
}: BarVisualizationProps) {
  const totalLbs = barWeight + platesWeight
  const plateDistribution = calculatePlateDistribution(platesWeight)

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      {/* Header with weight and 1RM */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-responsive-base font-semibold text-blue-900">
            {totalLbs} lbs
          </h3>
          <p className="text-responsive-sm text-blue-700">
            {(totalLbs / 2.20462).toFixed(1)} kg
          </p>
        </div>
        
        {calculatedRM && (
          <div className="text-right">
            <div className="text-responsive-sm text-blue-800 font-medium">
              1RM: {calculatedRM.toFixed(1)} lbs
            </div>
            <div className="text-responsive-xs text-blue-600">
              {repetitions === 1 ? 'Directo' : 'Calculado'}
            </div>
          </div>
        )}
      </div>

      {/* Visual representation of the barbell */}
      {platesWeight > 0 && (
        <div className="flex items-center justify-center py-3 bg-white rounded-lg mb-3">
          <div className="flex items-center gap-1">
            {/* Left plates - reversed order so bigger plates are closer to bar */}
            <div className="flex">
              {plateDistribution.slice().reverse().map((plate, index) => (
                <div key={`left-${index}`} className="flex">
                  {Array.from({ length: plate.quantity }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-6 sm:h-8 border border-gray-400 ${getPlateColor(plate.weight)} -ml-1 first:ml-0`}
                      title={`${plate.weight} lbs`}
                    />
                  ))}
                </div>
              ))}
            </div>
            
            {/* Bar */}
            <div className="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-800 mx-2" title={`Barra ${barWeight} lbs`} />
            
            {/* Right plates */}
            <div className="flex">
              {plateDistribution.map((plate, index) => (
                <div key={`right-${index}`} className="flex">
                  {Array.from({ length: plate.quantity }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-6 sm:h-8 border border-gray-400 ${getPlateColor(plate.weight)} -mr-1 first:mr-0`}
                      title={`${plate.weight} lbs`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compact plate info */}
      {plateDistribution.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {plateDistribution.map((plate, index) => (
            <div key={index} className="flex items-center gap-1 bg-white px-2 py-1 rounded text-responsive-xs">
              <div className={`w-3 h-3 rounded ${getPlateColor(plate.weight)}`} />
              <span>{plate.quantity}x{plate.weight} lbs</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
