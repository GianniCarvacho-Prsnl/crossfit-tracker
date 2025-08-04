'use client';

import React, { useState } from 'react';
import { convertKgToLbs, convertLbsToKg } from '@/utils/plateCalculations';

interface WeightConverterProps {
  className?: string;
}

export default function WeightConverter({ className = '' }: WeightConverterProps) {
  const [lbsValue, setLbsValue] = useState<string>('');
  const [kgValue, setKgValue] = useState<string>('');
  const [lastChanged, setLastChanged] = useState<'lbs' | 'kg' | null>(null);

  // Handle lbs input change
  const handleLbsChange = (value: string) => {
    setLbsValue(value);
    setLastChanged('lbs');
    
    // Convert to kg if value is valid
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      const kgResult = convertLbsToKg(numValue);
      setKgValue(kgResult.toFixed(1));
    } else if (value === '') {
      setKgValue('');
    }
  };

  // Handle kg input change
  const handleKgChange = (value: string) => {
    setKgValue(value);
    setLastChanged('kg');
    
    // Convert to lbs if value is valid
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      const lbsResult = convertKgToLbs(numValue);
      setLbsValue(lbsResult.toFixed(1));
    } else if (value === '') {
      setLbsValue('');
    }
  };

  // Clear all values
  const handleClear = () => {
    setLbsValue('');
    setKgValue('');
    setLastChanged(null);
  };

  // Preset common weights
  const presetWeights = [
    { lbs: 45, kg: 20.4, label: 'Solo barra' },
    { lbs: 95, kg: 43.1, label: '25 lbs por lado' },
    { lbs: 135, kg: 61.2, label: '45 lbs por lado' },
    { lbs: 185, kg: 83.9, label: '70 lbs por lado' },
    { lbs: 225, kg: 102.1, label: '90 lbs por lado' },
    { lbs: 315, kg: 142.9, label: '135 lbs por lado' }
  ];

  const handlePresetClick = (preset: typeof presetWeights[0]) => {
    setLbsValue(preset.lbs.toString());
    setKgValue(preset.kg.toFixed(1));
    setLastChanged('lbs');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Convertidor de Peso
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              Conversión bidireccional entre libras y kilogramos
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

      {/* Converter */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Libras Input */}
          <div className="space-y-2">
            <label htmlFor="lbs-input" className="block text-sm font-medium text-gray-800">
              Libras (lbs)
            </label>
            <div className="relative">
              <input
                id="lbs-input"
                type="number"
                min="0"
                step="0.1"
                value={lbsValue}
                onChange={(e) => handleLbsChange(e.target.value)}
                placeholder="Ingresa peso en libras"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 placeholder-gray-500 ${
                  lastChanged === 'lbs' ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-600 text-sm font-medium">lbs</span>
              </div>
            </div>
          </div>

          {/* Conversion Arrow */}
          <div className="flex items-center justify-center md:col-span-2 md:order-none order-first">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="h-px bg-gray-300 flex-1"></div>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
          </div>

          {/* Kilogramos Input */}
          <div className="space-y-2">
            <label htmlFor="kg-input" className="block text-sm font-medium text-gray-800">
              Kilogramos (kg)
            </label>
            <div className="relative">
              <input
                id="kg-input"
                type="number"
                min="0"
                step="0.1"
                value={kgValue}
                onChange={(e) => handleKgChange(e.target.value)}
                placeholder="Ingresa peso en kilogramos"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 placeholder-gray-500 ${
                  lastChanged === 'kg' ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-600 text-sm font-medium">kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {(lbsValue || kgValue) && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-900">
                {lbsValue && kgValue ? (
                  <>
                    {parseFloat(lbsValue).toFixed(1)} lbs = {parseFloat(kgValue).toFixed(1)} kg
                  </>
                ) : (
                  'Ingresa un valor para ver la conversión'
                )}
              </div>
              {lbsValue && kgValue && (
                <div className="text-sm text-blue-700 mt-1">
                  Factor de conversión: 1 kg = 2.20462 lbs
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preset Weights */}
      <div className="border-t border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-3">Pesos Comunes</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presetWeights.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetClick(preset)}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors text-left"
            >
              <div className="font-medium text-gray-900">
                {preset.lbs} lbs
              </div>
              <div className="text-gray-700">
                {preset.kg.toFixed(1)} kg
              </div>
              <div className="text-gray-600 mt-1">
                {preset.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Info */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-700 space-y-1">
          <div className="flex justify-between">
            <span>1 libra (lb) =</span>
            <span>0.453592 kilogramos</span>
          </div>
          <div className="flex justify-between">
            <span>1 kilogramo (kg) =</span>
            <span>2.20462 libras</span>
          </div>
        </div>
      </div>
    </div>
  );
}