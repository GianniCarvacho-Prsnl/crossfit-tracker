export default function ConversionsPage() {
  return (
    <div className="max-w-7xl mx-auto py-responsive px-responsive">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-responsive-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Conversiones de Peso
        </h1>
        
        {/* Información sobre funcionalidad futura */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-responsive-sm font-medium text-blue-800 mb-2">
                Funcionalidad en Desarrollo
              </h3>
              <p className="text-responsive-sm text-blue-700">
                Esta funcionalidad estará disponible próximamente. Esta página mostrará una tabla completa de conversiones de peso considerando la barra olímpica estándar de 45 libras más diferentes combinaciones de discos.
              </p>
            </div>
          </div>
        </div>

        {/* Ejemplo de tabla de conversiones */}
        <div className="card-mobile mb-6 sm:mb-8 p-0 overflow-hidden" data-testid="conversion-mockup">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-responsive-lg font-semibold text-gray-900 mb-2">
              Ejemplo: Tabla de Conversiones Barra + Discos
            </h2>
            <p className="text-responsive-sm text-gray-600">
              Combinaciones comunes usando barra olímpica (45 lbs) + discos por lado
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-responsive-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discos por Lado
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-responsive-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Libras
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-responsive-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Kilogramos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-900">
                      Solo barra
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm font-medium text-gray-900">
                      45 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-600">
                      20.4 kg
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-900">
                      2 × 10 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm font-medium text-gray-900">
                      65 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-600">
                      29.5 kg
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-900">
                      2 × 25 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm font-medium text-gray-900">
                      95 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-600">
                      43.1 kg
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-900">
                      2 × 35 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm font-medium text-gray-900">
                      115 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-600">
                      52.2 kg
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-900">
                      2 × 45 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm font-medium text-gray-900">
                      135 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-600">
                      61.2 kg
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-900">
                      2 × 45 lbs + 2 × 25 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm font-medium text-gray-900">
                      185 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-600">
                      83.9 kg
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-900">
                      2 × 45 lbs + 2 × 35 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm font-medium text-gray-900">
                      205 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-600">
                      93.0 kg
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-900">
                      4 × 45 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm font-medium text-gray-900">
                      225 lbs
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-responsive-sm text-gray-600">
                      102.1 kg
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="card-mobile p-0 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-responsive-lg font-semibold text-gray-900">
              Funcionalidades Futuras
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-medium text-gray-900 mb-3 text-responsive-base">Calculadora Interactiva</h3>
                <ul className="text-responsive-sm text-gray-600 space-y-2">
                  <li>• Seleccionar discos disponibles</li>
                  <li>• Calcular peso total automáticamente</li>
                  <li>• Conversión instantánea entre unidades</li>
                  <li>• Sugerencias de combinaciones</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3 text-responsive-base">Configuración Personalizada</h3>
                <ul className="text-responsive-sm text-gray-600 space-y-2">
                  <li>• Configurar discos disponibles en tu gym</li>
                  <li>• Guardar combinaciones favoritas</li>
                  <li>• Historial de conversiones</li>
                  <li>• Exportar tablas personalizadas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}