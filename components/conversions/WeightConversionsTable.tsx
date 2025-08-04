'use client';

import React, { useState, useMemo } from 'react';
import { 
  generateWeightConversions, 
  formatPlateConfiguration,
  type WeightConversion 
} from '@/utils/plateCalculations';
import ConversionDetails from './ConversionDetails';

interface WeightConversionsTableProps {
  className?: string;
}

export default function WeightConversionsTable({ className = '' }: WeightConversionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'weight' | 'kg'>('weight');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedConversion, setSelectedConversion] = useState<WeightConversion | null>(null);

  // Generate all conversions
  const allConversions = useMemo(() => generateWeightConversions(), []);

  // Filter and sort conversions
  const filteredConversions = useMemo(() => {
    let filtered = allConversions;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(conversion => 
        conversion.weightPerSide.toString().includes(term) ||
        conversion.totalWeightLbs.toString().includes(term) ||
        conversion.totalWeightKg.toString().includes(term) ||
        formatPlateConfiguration(conversion.plates).toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      if (sortBy === 'weight') {
        aValue = a.totalWeightLbs;
        bValue = b.totalWeightLbs;
      } else {
        aValue = a.totalWeightKg;
        bValue = b.totalWeightKg;
      }

      const result = aValue - bValue;
      return sortOrder === 'asc' ? result : -result;
    });

    return filtered;
  }, [allConversions, searchTerm, sortBy, sortOrder]);

  const handleSort = (column: 'weight' | 'kg') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: 'weight' | 'kg') => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header with search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Tabla de Conversiones de Peso
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              Barra olímpica (45 lbs) + discos por lado
            </p>
          </div>
          
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar peso, kg o discos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Por Lado
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('weight')}
              >
                <div className="flex items-center gap-1">
                  Total (lbs)
                  <span className="text-gray-400">{getSortIcon('weight')}</span>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('kg')}
              >
                <div className="flex items-center gap-1">
                  Total (kg)
                  <span className="text-gray-400">{getSortIcon('kg')}</span>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discos Necesarios
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredConversions.map((conversion, index) => (
              <tr 
                key={conversion.weightPerSide}
                className={`hover:bg-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                onClick={() => setSelectedConversion(conversion)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {conversion.weightPerSide} lbs
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-semibold">
                    {conversion.totalWeightLbs} lbs
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-semibold">
                    {conversion.totalWeightKg.toFixed(1)} kg
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    <PlateVisualization plates={conversion.plates} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with summary */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm text-gray-700">
            Mostrando {filteredConversions.length} de {allConversions.length} conversiones
          </div>
          <div className="text-xs text-gray-600">
            Incrementos de 5 lbs por lado • Discos disponibles: 45, 35, 25, 15, 10, 5, 2.5 lbs
          </div>
        </div>
      </div>
      </div>

      {/* Modal for conversion details */}
      {selectedConversion && (
        <ConversionDetails 
          conversion={selectedConversion}
          onClose={() => setSelectedConversion(null)}
        />
      )}
    </>
  );
}

// Component to visualize plate configuration
function PlateVisualization({ plates }: { plates: Array<{ plateWeight: number; quantity: number }> }) {
  if (plates.length === 0) {
    return (
      <span className="text-gray-500 italic">Solo barra</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {plates.map((plate, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {plate.quantity}×{plate.plateWeight}
        </span>
      ))}
    </div>
  );
}