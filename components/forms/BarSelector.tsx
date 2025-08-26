'use client'

import { useState } from 'react'

interface BarSelectorProps {
  value: number
  onChange: (weight: number) => void
  disabled?: boolean
}

export default function BarSelector({ value, onChange, disabled = false }: BarSelectorProps) {
  const barOptions = [
    { weight: 45, label: '45 lbs', description: 'Barra olímpica estándar' },
    { weight: 35, label: '35 lbs', description: 'Barra femenina' }
  ]

  return (
    <div>
      <label htmlFor="bar-weight" className="block text-responsive-sm font-medium text-gray-700 mb-2">
        Peso de la Barra
      </label>
      <select
        id="bar-weight"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input-mobile w-full"
        disabled={disabled}
        data-testid="bar-selector"
      >
        {barOptions.map((option) => (
          <option key={option.weight} value={option.weight}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-responsive-xs text-gray-500">
        {barOptions.find(opt => opt.weight === value)?.description}
      </p>
    </div>
  )
}
