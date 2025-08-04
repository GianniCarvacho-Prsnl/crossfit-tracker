import { WeightConversionsTable, WeightConverter, PlateCalculator } from '@/components/conversions';

export default function ConversionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Conversiones de Peso
          </h1>
          <p className="mt-2 text-gray-600">
            Tabla completa de conversiones para barra olímpica y discos estándar
          </p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Weight Converter */}
          <div className="xl:col-span-1">
            <WeightConverter />
          </div>
          
          {/* Weight Conversions Table */}
          <div className="xl:col-span-2">
            <WeightConversionsTable />
          </div>
        </div>
        
        {/* Plate Calculator */}
        <div className="mt-8">
          <PlateCalculator />
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información Adicional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Discos Disponibles</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 45 lbs (rojo)</li>
                <li>• 35 lbs (azul)</li>
                <li>• 25 lbs (verde)</li>
                <li>• 15 lbs (amarillo)</li>
                <li>• 10 lbs (morado)</li>
                <li>• 5 lbs (rosa)</li>
                <li>• 2.5 lbs (gris)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Cómo Usar</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Busca por peso, kg o tipo de disco</li>
                <li>• Haz clic en las columnas para ordenar</li>
                <li>• Haz clic en una fila para ver detalles</li>
                <li>• Los incrementos son de 5 lbs por lado</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}