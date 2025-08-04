'use client';

import React, { useState } from 'react';
import { 
  calculateTargetWeight, 
  formatPlateConfiguration, 
  convertKgToLbs, 
  convertLbsToKg,
  OLYMPIC_BAR_WEIGHT,
  AVAILABLE_PLATES
} from '@/utils/plateCalculations';
import type { PlateCalculation, PlateConfiguration } from '@/utils/plateCalculations';

interface PlateCalculatorProps {
  className?: string;
}

export default function PlateCalculator({ className = '' }: PlateCalculatorProps) {
  const [targetWeight, setTargetWeight] = useState<string>('');
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs');
  const [calculation, setCalculation] = useState<PlateCalculation | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);

  // Handle weight input change
  const handleWeightChange = (value: string) => {
    setTargetWeight(value);
    
    // Calculate plates if value is valid
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      const result = calculateTargetWeight(numValue, unit);
      setCalculation(result);
    } else {
      setCalculation(null);
    }
  };

  // Handle unit change
  const handleUnitChange = (newUnit: 'lbs' | 'kg') => {
    setUnit(newUnit);
    
    // Recalculate if there's a target weight
    if (targetWeight) {
      const numValue = parseFloat(targetWeight);
      if (!isNaN(numValue) && numValue > 0) {
        const result = calculateTargetWeight(numValue, newUnit);
        setCalculation(result);
      }
    }
  };

  // Clear all values
  const handleClear = () => {
    setTargetWeight('');
    setCalculation(null);
    setShowVisualization(false);
  };

  // Preset target weights
  const presetTargets = [
    { lbs: 135, kg: 61.2, label: 'Principiante' },
    { lbs: 185, kg: 83.9, label: 'Intermedio' },
    { lbs: 225, kg: 102.1, label: 'Avanzado' },
    { lbs: 315, kg: 142.9, label: 'Elite' },
  ];

  const handlePresetClick = (preset: typeof presetTargets[0]) => {
    const weight = unit === 'lbs' ? preset.lbs : preset.kg;
    setTargetWeight(weight.toString());
    handleWeightChange(weight.toString());
  };

  // Render plate visualization
  const renderPlateVisualization = (plates: PlateConfiguration[]) => {
    if (!plates.length) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-3">Visualización de la Barra</h4>
        
        {/* Bar visualization */}
        <div className="flex items-center justify-center space-x-1 overflow-x-auto pb-2">
          {/* Left plates */}
          <div className="flex items-center space-x-1">
            {plates.map((plate, plateIndex) => 
              Array.from({ length: plate.quantity }, (_, discIndex) => (
                <div
                  key={`left-${plateIndex}-${discIndex}`}
                  className={`
                    flex items-center justify-center text-white text-xs font-bold rounded
                    ${getPlateColor(plate.plateWeight)}
                    ${getPlateSize(plate.plateWeight)}
                  `}
                >
                  {plate.plateWeight}
                </div>
              ))
            )}
          </div>
          
          {/* Olympic bar */}
          <div className="bg-gray-400 text-white text-xs font-bold px-4 py-2 rounded flex items-center justify-center min-w-[80px]">
            BARRA
            <br />
            45 lbs
          </div>
          
          {/* Right plates (mirror of left) */}
          <div className="flex items-center space-x-1">
            {plates.map((plate, plateIndex) => 
              Array.from({ length: plate.quantity }, (_, discIndex) => (
                <div
                  key={`right-${plateIndex}-${discIndex}`}
                  className={`
                    flex items-center justify-center text-white text-xs font-bold rounded
                    ${getPlateColor(plate.plateWeight)}
                    ${getPlateSize(plate.plateWeight)}
                  `}
                >
                  {plate.plateWeight}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Plate breakdown */}
        <div className="mt-3 text-sm text-gray-700">
          <div className="font-medium mb-1">Discos por lado:</div>
          <div className="text-gray-600">
            {formatPlateConfiguration(plates)}
          </div>
        </div>
      </div>
    );
  };

  // Get plate color based on weight (standard gym colors)
  const getPlateColor = (weight: number): string => {
    switch (weight) {
      case 45: return 'bg-red-600';
      case 35: return 'bg-blue-600';
      case 25: return 'bg-green-600';
      case 15: return 'bg-yellow-500';
      case 10: return 'bg-purple-600';
      case 5: return 'bg-pink-500';
      case 2.5: return 'bg-gray-500';
      default: return 'bg-gray-600';
    }
  };

  // Get plate size based on weight
  const getPlateSize = (weight: number): string => {
    if (weight >= 35) return 'w-12 h-12';
    if (weight >= 15) return 'w-10 h-10';
    if (weight >= 5) return 'w-8 h-8';
    return 'w-6 h-6';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Calculadora de Discos
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              Ingresa tu peso objetivo y descubre qué discos necesitas
            </p>
          </div>
          <button
            onClick={handleClear}
            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Calculator */}
      <div className="p-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex gap-4">
            {/* Weight Input */}
            <div className="flex-1">
              <label htmlFor="target-weight" className="block text-sm font-medium text-gray-800 mb-2">
                Peso Objetivo
              </label>
              <div className="relative">
                <input
                  id="target-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder={`Ingresa peso en ${unit}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 placeholder-gray-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-600 text-sm font-medium">{unit}</span>
                </div>
              </div>
            </div>

            {/* Unit Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Unidad
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleUnitChange('lbs')}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    unit === 'lbs'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  lbs
                </button>
                <button
                  onClick={() => handleUnitChange('kg')}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    unit === 'kg'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  kg
                </button>
              </div>
            </div>
          </div>

          {/* Preset Targets */}
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">Pesos Objetivo Comunes</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presetTargets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetClick(preset)}
                  className="p-2 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors text-center"
                >
                  <div className="font-medium text-gray-900">
                    {unit === 'lbs' ? `${preset.lbs} lbs` : `${preset.kg.toFixed(1)} kg`}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {preset.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {calculation && (
          <div className="mt-6 space-y-4">
            {/* Main Result */}
            <div className={`p-4 rounded-lg border ${
              calculation.isValid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`text-lg font-semibold ${
                    calculation.isValid ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    {calculation.isValid ? '✓ Peso Exacto Alcanzable' : '⚠ Peso Aproximado'}
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Peso real:</span>{' '}
                      {calculation.totalWeight.toFixed(1)} lbs ({convertLbsToKg(calculation.totalWeight).toFixed(1)} kg)
                    </div>
                    
                    {!calculation.isValid && (
                      <div className="text-sm text-yellow-700">
                        <span className="font-medium">Diferencia:</span>{' '}
                        {Math.abs(calculation.difference).toFixed(1)} lbs {calculation.difference > 0 ? 'menos' : 'más'}
                      </div>
                    )}
                    
                    {calculation.plates.length > 0 && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Configuración:</span>{' '}
                        {formatPlateConfiguration(calculation.plates)} por lado
                      </div>
                    )}
                  </div>
                </div>
                
                {calculation.plates.length > 0 && (
                  <button
                    onClick={() => setShowVisualization(!showVisualization)}
                    className="ml-4 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    {showVisualization ? 'Ocultar' : 'Ver'} Barra
                  </button>
                )}
              </div>
            </div>

            {/* Visualization */}
            {showVisualization && calculation.plates.length > 0 && renderPlateVisualization(calculation.plates)}

            {/* Alternative Suggestions */}
            {!calculation.isValid && calculation.plates.length === 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-900 font-semibold mb-2">
                  ❌ Peso No Alcanzable
                </div>
                <div className="text-sm text-red-700">
                  El peso objetivo es menor que la barra olímpica ({OLYMPIC_BAR_WEIGHT} lbs).
                  Intenta con un peso mayor a {OLYMPIC_BAR_WEIGHT} lbs.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-700 space-y-2">
          <div>
            <span className="font-medium">Nota:</span> Los cálculos incluyen la barra olímpica estándar de {OLYMPIC_BAR_WEIGHT} lbs.
          </div>
          <div>
            <span className="font-medium">Discos disponibles:</span> {AVAILABLE_PLATES.join(', ')} lbs
          </div>
        </div>
      </div>
    </div>
  );
}