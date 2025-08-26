'use client'

import { useState, useEffect } from 'react'

type PlateInputMode = 'total' | 'per-side'

interface PlatesInputProps {
  value: number
  onChange: (weight: number) => void
  disabled?: boolean
  mode: PlateInputMode
  onModeChange: (mode: PlateInputMode) => void
}

export default function PlatesInput({ 
  value, 
  onChange, 
  disabled = false,
  mode,
  onModeChange
}: PlatesInputProps) {
  const [leftSideWeight, setLeftSideWeight] = useState<number>(0)
  const [rightSideWeight, setRightSideWeight] = useState<number>(0)

  // Sync values when mode or external value changes
  useEffect(() => {
    if (mode === 'total') {
      // Do nothing, value is already the total
    } else {
      // per-side mode: split the total into left/right
      const perSide = value / 2
      setLeftSideWeight(perSide)
      setRightSideWeight(perSide)
    }
  }, [mode, value])

  const handleTotalChange = (newTotal: number) => {
    onChange(newTotal)
  }

  const handleLeftSideChange = (newWeight: number) => {
    setLeftSideWeight(newWeight)
    setRightSideWeight(newWeight) // Mirror to right side
    onChange(newWeight * 2) // Total is left + right
  }

  const validatePlateWeight = (weight: number): boolean => {
    return weight >= 0 && weight <= 500
  }

  return (
    <div>
      <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
        Peso de los Discos
      </label>
      
      {/* Mode Toggle */}
      <div className="mb-4 bg-gray-100 rounded-lg p-1 flex">
        <button
          type="button"
          onClick={() => onModeChange('total')}
          className={`flex-1 py-2 px-3 rounded-md text-responsive-sm font-medium transition-colors ${
            mode === 'total'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          data-testid="total-mode-button"
        >
          Total Discos
        </button>
        <button
          type="button"
          onClick={() => onModeChange('per-side')}
          className={`flex-1 py-2 px-3 rounded-md text-responsive-sm font-medium transition-colors ${
            mode === 'per-side'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          data-testid="per-side-mode-button"
        >
          Discos por Lado
        </button>
      </div>

      {mode === 'total' && (
        <div>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.5"
              min="0"
              max="500"
              value={value || ''}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value) || 0
                if (validatePlateWeight(newValue)) {
                  handleTotalChange(newValue)
                }
              }}
              className="input-mobile flex-1"
              placeholder="Ingresa solo el peso de los discos"
              disabled={disabled}
              data-testid="total-plates-input"
            />
            <span className="flex items-center px-3 text-responsive-sm text-gray-600">
              lbs
            </span>
          </div>
          <p className="mt-2 text-responsive-xs text-gray-500">
            ⚡ Solo ingresa el peso de los discos, la barra se suma automáticamente
          </p>
        </div>
      )}

      {mode === 'per-side' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="left-side" className="block text-responsive-xs font-medium text-gray-600 mb-1">
                Lado izquierdo
              </label>
              <div className="flex gap-2">
                <input
                  id="left-side"
                  type="number"
                  step="0.5"
                  min="0"
                  max="250"
                  value={leftSideWeight || ''}
                  onChange={(e) => {
                    const newWeight = parseFloat(e.target.value) || 0
                    if (validatePlateWeight(newWeight)) {
                      handleLeftSideChange(newWeight)
                    }
                  }}
                  className="input-mobile flex-1"
                  disabled={disabled}
                  data-testid="left-side-input"
                />
                <span className="flex items-center px-2 text-responsive-xs text-gray-600">
                  lbs
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="right-side" className="block text-responsive-xs font-medium text-gray-600 mb-1">
                Lado derecho
              </label>
              <div className="flex gap-2">
                <input
                  id="right-side"
                  type="number"
                  value={rightSideWeight || ''}
                  className="input-mobile flex-1 bg-gray-50 text-gray-500"
                  disabled={true}
                  readOnly={true}
                  data-testid="right-side-input"
                />
                <span className="flex items-center px-2 text-responsive-xs text-gray-600">
                  lbs
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-responsive-xs text-gray-500">
            ⚡ Solo ingresa el peso de los discos, la barra se suma automáticamente
          </p>
        </div>
      )}
    </div>
  )
}
