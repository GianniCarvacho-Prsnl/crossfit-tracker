import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { DynamicRecordsList } from '@/utils/dynamicImports'

export default function RecordsPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-responsive px-responsive">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 text-responsive-sm font-medium min-h-touch flex items-center"
              data-testid="back-to-dashboard"
            >
              ← Volver al Dashboard
            </a>
          </div>
          <h1 className="text-responsive-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            Historial de Registros
          </h1>
          <DynamicRecordsList />
        </div>
      </div>
    </ProtectedRoute>
  )
}