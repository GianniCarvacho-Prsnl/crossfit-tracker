'use client';

import React from 'react';
import { type WeightConversion } from '@/utils/plateCalculations';

interface ConversionDetailsProps {
  conversion: WeightConversion;
  onClose: () => void;
}

export default function ConversionDetails({ conversion, onClose }: ConversionDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Detalles de Conversión
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Weight Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {conversion.totalWeightLbs} lbs
              </div>
              <div className="text-lg text-blue-700">
                {conversion.totalWeightKg.toFixed(1)} kg
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {conversion.weightPerSide} lbs por lado + barra (45 lbs)
              </div>
            </div>
          </div>

          {/* Plate Breakdown */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Configuración de Discos</h4>
            
            {conversion.plates.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <div className="text-4xl mb-2">🏋️</div>
                <div>Solo barra olímpica</div>
                <div className="text-sm">45 lbs (20.4 kg)</div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Visual representation */}
                <div className="flex items-center justify-center py-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1">
                    {/* Left plates */}
                    <div className="flex">
                      {conversion.plates.map((plate, index) => (
                        <div key={`left-${index}`} className="flex">
                          {Array.from({ length: plate.quantity }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-8 border border-gray-400 ${getPlateColor(plate.plateWeight)} -ml-1 first:ml-0`}
                              title={`${plate.plateWeight} lbs`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    
                    {/* Bar */}
                    <div className="w-16 h-2 bg-gray-800 mx-2" title="Barra olímpica 45 lbs" />
                    
                    {/* Right plates */}
                    <div className="flex">
                      {conversion.plates.map((plate, index) => (
                        <div key={`right-${index}`} className="flex">
                          {Array.from({ length: plate.quantity }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-8 border border-gray-400 ${getPlateColor(plate.plateWeight)} -mr-1 first:mr-0`}
                              title={`${plate.plateWeight} lbs`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Plate list */}
                <div className="space-y-2">
                  {conversion.plates.map((plate, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${getPlateColor(plate.plateWeight)}`} />
                        <span className="font-medium">{plate.plateWeight} lbs</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        {plate.quantity} disco{plate.quantity > 1 ? 's' : ''} por lado
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total calculation */}
                <div className="border-t pt-3 mt-3">
                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Barra olímpica:</span>
                      <span>45 lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discos (ambos lados):</span>
                      <span>{conversion.weightPerSide * 2} lbs</span>
                    </div>
                    <div className="flex justify-between font-medium text-gray-900 border-t pt-1">
                      <span>Total:</span>
                      <span>{conversion.totalWeightLbs} lbs ({conversion.totalWeightKg.toFixed(1)} kg)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get plate colors
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