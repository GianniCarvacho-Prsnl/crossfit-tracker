export default function PercentagesPage() {
  return (
    <div className="max-w-7xl mx-auto py-responsive px-responsive">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-responsive-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Porcentajes de RM
        </h1>
        
        {/* Información sobre funcionalidad futura */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Funcionalidad en Desarrollo
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Esta funcionalidad estará disponible próximamente. Esta página calculará automáticamente porcentajes de tus récords personales para planificar entrenamientos con diferentes intensidades, incluyendo las combinaciones exactas de discos necesarias.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ejemplo de cálculo de porcentajes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6" data-testid="percentage-mockup">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Ejemplo: Porcentajes de Clean (1RM: 200 lbs)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Cálculo de intensidades comunes para planificación de entrenamientos
            </p>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Porcentaje
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peso (lbs)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peso (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Combinación de Discos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      50%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      100 lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      45.4 kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Barra + 2×25 lbs + 2×2.5 lbs
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      60%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      120 lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      54.4 kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Barra + 2×35 lbs + 2×2.5 lbs
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      70%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      140 lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      63.5 kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Barra + 2×45 lbs + 2×2.5 lbs
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      80%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      160 lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      72.6 kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Barra + 2×45 lbs + 2×10 lbs + 2×2.5 lbs
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      85%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      170 lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      77.1 kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Barra + 2×45 lbs + 2×15 lbs + 2×2.5 lbs
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      90%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      180 lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      81.6 kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Barra + 2×45 lbs + 2×20 lbs + 2×2.5 lbs
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      95%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      190 lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      86.2 kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Barra + 2×45 lbs + 2×25 lbs + 2×2.5 lbs
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      100%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      200 lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      90.7 kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Barra + 2×45 lbs + 2×30 lbs + 2×2.5 lbs
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Información sobre diferentes ejercicios */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Ejemplo: Snatch (1RM: 150 lbs)
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600">70%</span>
                  <span className="text-sm font-medium text-gray-900">105 lbs</span>
                  <span className="text-sm text-gray-600">47.6 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600">80%</span>
                  <span className="text-sm font-medium text-gray-900">120 lbs</span>
                  <span className="text-sm text-gray-600">54.4 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600">90%</span>
                  <span className="text-sm font-medium text-gray-900">135 lbs</span>
                  <span className="text-sm text-gray-600">61.2 kg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Ejemplo: Deadlift (1RM: 300 lbs)
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600">70%</span>
                  <span className="text-sm font-medium text-gray-900">210 lbs</span>
                  <span className="text-sm text-gray-600">95.3 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600">80%</span>
                  <span className="text-sm font-medium text-gray-900">240 lbs</span>
                  <span className="text-sm text-gray-600">108.9 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600">90%</span>
                  <span className="text-sm font-medium text-gray-900">270 lbs</span>
                  <span className="text-sm text-gray-600">122.5 kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Funcionalidades Futuras
            </h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Calculadora Automática</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Cálculo basado en tus PRs reales</li>
                  <li>• Selección de ejercicio específico</li>
                  <li>• Porcentajes personalizables</li>
                  <li>• Sugerencias de combinaciones de discos</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Planificación de Entrenamientos</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Plantillas de entrenamiento por porcentajes</li>
                  <li>• Progresiones automáticas</li>
                  <li>• Historial de entrenamientos por intensidad</li>
                  <li>• Exportar planes de entrenamiento</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Uso Típico en CrossFit</h4>
              <p className="text-sm text-gray-600">
                Los porcentajes de RM son fundamentales para programar entrenamientos de fuerza. 
                Por ejemplo, un entrenamiento típico podría incluir: 5×3 al 85% del 1RM, 
                o trabajar al 70% para volumen alto. Esta herramienta calculará automáticamente 
                los pesos exactos y las combinaciones de discos necesarias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}