'use client'

import React, { useState, memo, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import MemoizedSettingsCard from '@/components/settings/shared/MemoizedSettingsCard'
import SettingsToggle from '@/components/settings/shared/SettingsToggle'
import { AppError, ErrorType } from '@/utils/errorHandling'

interface AppPreferencesSectionProps {
  user: User
  tempFormData: Record<string, any>
  updateTempFormData: (key: string, value: any) => void
  saveTempChanges: () => void
  discardTempChanges: () => void
  hasUnsavedChanges: boolean
}

const AppPreferencesSection: React.FC<AppPreferencesSectionProps> = memo(({
  user
}) => {
  const { preferences, loading, error, updateSinglePreference } = useUserPreferences(user?.id || '')
  const [updating, setUpdating] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<AppError | null>(null)

  const handlePreferenceUpdate = useCallback(async (key: string, value: any) => {
    if (!user?.id) return

    try {
      setUpdating(key)
      setUpdateError(null)
      await updateSinglePreference(key as any, value)
    } catch (err) {
      setUpdateError(err instanceof AppError ? err : new AppError(
        'Error al actualizar preferencia',
        ErrorType.DATABASE,
        err instanceof Error ? err : 'Unknown error'
      ))
    } finally {
      setUpdating(null)
    }
  }, [user?.id, updateSinglePreference])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No se pudieron cargar las preferencias</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {updateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{updateError.message}</p>
        </div>
      )}

      {/* Unidades de Medida */}
      <MemoizedSettingsCard
        title="Unidades de Medida"
        description="Selecciona tu sistema de unidades preferido"
        dependencies={[preferences.preferred_units, updating]}
      >
        <div className="space-y-2 opacity-50">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="units"
              value="metric"
              checked={preferences.preferred_units === 'metric'}
              disabled={true}
              className="h-4 w-4 text-gray-400 border-gray-300 cursor-not-allowed"
            />
            <div>
              <span className="text-sm font-medium text-gray-500">Métrico</span>
              <p className="text-xs text-gray-400">Kilogramos (kg), centímetros (cm)</p>
            </div>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="units"
              value="imperial"
              checked={preferences.preferred_units === 'imperial'}
              disabled={true}
              className="h-4 w-4 text-gray-400 border-gray-300 cursor-not-allowed"
            />
            <div>
              <span className="text-sm font-medium text-gray-500">Imperial</span>
              <p className="text-xs text-gray-400">Libras (lbs), pies y pulgadas (ft/in)</p>
            </div>
          </label>
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Próximamente:</strong> La funcionalidad de cambio de unidades estará disponible en futuras versiones.
          </p>
        </div>
      </MemoizedSettingsCard>

      {/* Tema */}
      <MemoizedSettingsCard
        title="Apariencia"
        description="Personaliza el tema visual de la aplicación"
        dependencies={[preferences.theme, updating]}
      >
        <div className="space-y-2 opacity-50">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={preferences.theme === 'light'}
              disabled={true}
              className="h-4 w-4 text-gray-400 border-gray-300 cursor-not-allowed"
            />
            <div>
              <span className="text-sm font-medium text-gray-500">Claro</span>
              <p className="text-xs text-gray-400">Tema claro siempre activo</p>
            </div>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={preferences.theme === 'dark'}
              disabled={true}
              className="h-4 w-4 text-gray-400 border-gray-300 cursor-not-allowed"
            />
            <div>
              <span className="text-sm font-medium text-gray-500">Oscuro</span>
              <p className="text-xs text-gray-400">Tema oscuro siempre activo</p>
            </div>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="theme"
              value="system"
              checked={preferences.theme === 'system'}
              disabled={true}
              className="h-4 w-4 text-gray-400 border-gray-300 cursor-not-allowed"
            />
            <div>
              <span className="text-sm font-medium text-gray-500">Sistema</span>
              <p className="text-xs text-gray-400">Sigue la configuración del dispositivo</p>
            </div>
          </label>
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Próximamente:</strong> La funcionalidad de cambio de tema estará disponible en futuras versiones.
          </p>
        </div>
      </MemoizedSettingsCard>

      {/* Idioma */}
      <MemoizedSettingsCard
        title="Idioma"
        description="Selecciona el idioma de la interfaz"
        dependencies={[preferences.language, updating]}
      >
        <div className="space-y-2 opacity-50">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="language"
              value="es"
              checked={preferences.language === 'es'}
              disabled={true}
              className="h-4 w-4 text-gray-400 border-gray-300 cursor-not-allowed"
            />
            <div>
              <span className="text-sm font-medium text-gray-500">Español</span>
              <p className="text-xs text-gray-400">Interfaz en español</p>
            </div>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="language"
              value="en"
              checked={preferences.language === 'en'}
              disabled={true}
              className="h-4 w-4 text-gray-400 border-gray-300 cursor-not-allowed"
            />
            <div>
              <span className="text-sm font-medium text-gray-500">English</span>
              <p className="text-xs text-gray-400">English interface</p>
            </div>
          </label>
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Próximamente:</strong> La funcionalidad de cambio de idioma estará disponible en futuras versiones.
          </p>
        </div>
      </MemoizedSettingsCard>

      {/* Notificaciones */}
      <MemoizedSettingsCard
        title="Notificaciones"
        description="Configura las notificaciones y recordatorios"
        dependencies={[preferences.notifications_enabled, preferences.workout_reminders, updating]}
      >
        <div className="opacity-50">
          <SettingsToggle
            label="Notificaciones habilitadas"
            description="Recibir notificaciones de la aplicación"
            checked={preferences.notifications_enabled}
            onChange={() => {}}
            disabled={true}
          />
          
          <SettingsToggle
            label="Recordatorios de entrenamiento"
            description="Recibir recordatorios para entrenar regularmente"
            checked={preferences.workout_reminders}
            onChange={() => {}}
            disabled={true}
          />
        </div>

        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Próximamente:</strong> Las notificaciones push estarán disponibles en futuras versiones.
          </p>
        </div>
      </MemoizedSettingsCard>

      {/* Fórmula de 1RM */}
      <MemoizedSettingsCard
        title="Cálculos de Entrenamiento"
        description="Fórmula utilizada para calcular el 1RM"
        dependencies={[preferences.preferred_1rm_formula, updating]}
      >
        <div className="opacity-50">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Fórmula de 1RM
          </label>
          <select
            value="epley"
            disabled={true}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          >
            <option value="epley">Epley (fórmula estándar)</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            La aplicación utiliza la fórmula de Epley para todos los cálculos de 1RM.
          </p>
        </div>
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Fórmula Epley:</strong> 1RM = Peso × (1 + 0.0333 × Repeticiones)
          </p>
          <p className="text-xs text-green-700 mt-1">
            Esta es la fórmula más utilizada en CrossFit y powerlifting para estimar el 1RM.
          </p>
        </div>
      </MemoizedSettingsCard>

      {updating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">Actualizando preferencia...</span>
          </div>
        </div>
      )}
    </div>
  )
})

AppPreferencesSection.displayName = 'AppPreferencesSection'

export default AppPreferencesSection