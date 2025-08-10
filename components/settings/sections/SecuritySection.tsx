'use client'

import React, { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import SettingsCard from '../shared/SettingsCard'
import SettingsButton from '../shared/SettingsButton'
import ErrorDisplay from '@/components/ui/ErrorDisplay'
import { 
  useSettingsErrorHandler, 
  securityValidation 
} from '@/utils/settingsErrorHandling'

interface SecuritySectionProps {
  user: User
  tempFormData: Record<string, any>
  updateTempFormData: (key: string, value: any) => void
  saveTempChanges: () => void
  discardTempChanges: () => void
  hasUnsavedChanges: boolean
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  user
}) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isExportingData, setIsExportingData] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  // Error handling
  const passwordErrorHandler = useSettingsErrorHandler('security')
  const exportErrorHandler = useSettingsErrorHandler('security')

  // Password form state and validation
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordTouched, setPasswordTouched] = useState<Record<string, boolean>>({})

  const validatePasswordField = (field: string, value: any): string | null => {
    switch (field) {
      case 'currentPassword':
        return !value ? 'La contraseña actual es requerida' : null
      case 'newPassword':
        const errors = securityValidation.password(value)
        return errors.length > 0 ? errors[0].message : null
      case 'confirmPassword':
        const confirmError = securityValidation.passwordConfirmation(passwordForm.newPassword, value)
        return confirmError?.message || null
      default:
        return null
    }
  }

  const updatePasswordField = (field: string, value: any) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
    
    // Validate if field has been touched
    if (passwordTouched[field]) {
      const error = validatePasswordField(field, value)
      setPasswordErrors(prev => ({ ...prev, [field]: error || '' }))
    }
  }

  const touchPasswordField = (field: string) => {
    setPasswordTouched(prev => ({ ...prev, [field]: true }))
    const error = validatePasswordField(field, passwordForm[field as keyof typeof passwordForm])
    setPasswordErrors(prev => ({ ...prev, [field]: error || '' }))
  }

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    Object.keys(passwordForm).forEach(key => {
      const error = validatePasswordField(key, passwordForm[key as keyof typeof passwordForm])
      if (error) {
        newErrors[key] = error
        isValid = false
      }
    })

    setPasswordErrors(newErrors)
    setPasswordTouched(Object.keys(passwordForm).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>))

    return isValid
  }

  const clearPasswordErrors = () => {
    setPasswordErrors({})
    setPasswordTouched({})
  }

  const hasPasswordErrors = Object.values(passwordErrors).some(error => error)

  const supabase = createClient()



  // Handle password change submission
  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) {
      return
    }

    // Confirm critical change
    const confirmChange = window.confirm(
      '¿Estás seguro de que quieres cambiar tu contraseña? Tendrás que iniciar sesión nuevamente.'
    )
    if (!confirmChange) return

    setIsChangingPassword(true)

    try {
      passwordErrorHandler.clearError()
      
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          updatePasswordField('currentPassword', passwordForm.currentPassword)
          touchPasswordField('currentPassword')
          passwordErrorHandler.handleError(new Error('Contraseña actual incorrecta'))
        } else {
          passwordErrorHandler.handleError(error)
        }
        return
      }

      // Success
      alert('Contraseña cambiada exitosamente. Por favor, inicia sesión nuevamente.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      clearPasswordErrors()
      setShowPasswordForm(false)
      
      // Sign out user to force re-authentication
      await supabase.auth.signOut()
      
    } catch (error) {
      passwordErrorHandler.handleError(error)
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Handle data export
  const handleDataExport = async () => {
    const confirmExport = window.confirm(
      '¿Quieres exportar todos tus datos de entrenamiento? Se generará un archivo JSON con toda tu información.'
    )
    if (!confirmExport) return

    setIsExportingData(true)

    try {
      exportErrorHandler.clearError()
      
      // Fetch all user workout data
      const { data: workoutRecords, error: workoutError } = await supabase
        .from('workout_records')
        .select('*')
        .eq('user_id', user.id)

      if (workoutError) {
        throw workoutError
      }

      // Fetch user profile data
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Fetch user preferences
      const { data: userPreferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Fetch exercise goals
      const { data: exerciseGoals, error: goalsError } = await supabase
        .from('exercise_goals')
        .select('*')
        .eq('user_id', user.id)

      // Create export data object
      const exportData = {
        exportDate: new Date().toISOString(),
        userInfo: {
          email: user.email,
          createdAt: user.created_at
        },
        profile: userProfile || null,
        preferences: userPreferences || null,
        workoutRecords: workoutRecords || [],
        exerciseGoals: exerciseGoals || [],
        totalWorkouts: workoutRecords?.length || 0
      }

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `crossfit-tracker-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      alert('Datos exportados exitosamente')
      
    } catch (error) {
      exportErrorHandler.handleError(error)
    } finally {
      setIsExportingData(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Password Security */}
      <SettingsCard 
        title="Seguridad de Contraseña" 
        description="Cambia tu contraseña para mantener tu cuenta segura"
      >
        <div className="space-y-4">
          {!showPasswordForm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">Contraseña</p>
                <p className="text-xs text-gray-500">Última actualización: Hace tiempo</p>
              </div>
              <SettingsButton
                variant="secondary"
                onClick={() => setShowPasswordForm(true)}
                data-testid="change-password-button"
              >
                Cambiar Contraseña
              </SettingsButton>
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Cambiar Contraseña</h4>
                <button
                  onClick={() => {
                    setShowPasswordForm(false)
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    clearPasswordErrors()
                    passwordErrorHandler.clearError()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  data-testid="cancel-password-change"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Password Error Display */}
              {passwordErrorHandler.error && (
                <ErrorDisplay
                  error={passwordErrorHandler.error}
                  variant="settings"
                  context="security"
                  onRetry={() => passwordErrorHandler.retry(handlePasswordChange)}
                  onDismiss={passwordErrorHandler.clearError}
                  showRetry={passwordErrorHandler.error.retryable && !passwordErrorHandler.isRetrying}
                />
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => updatePasswordField('currentPassword', e.target.value)}
                    onBlur={() => touchPasswordField('currentPassword')}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa tu contraseña actual"
                    data-testid="current-password-input"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-red-600 mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => updatePasswordField('newPassword', e.target.value)}
                    onBlur={() => touchPasswordField('newPassword')}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa tu nueva contraseña"
                    data-testid="new-password-input"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 6 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => updatePasswordField('confirmPassword', e.target.value)}
                    onBlur={() => touchPasswordField('confirmPassword')}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirma tu nueva contraseña"
                    data-testid="confirm-password-input"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-2">
                  <SettingsButton
                    variant="primary"
                    onClick={handlePasswordChange}
                    loading={isChangingPassword}
                    disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || hasPasswordErrors}
                    data-testid="save-password-button"
                  >
                    {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </SettingsButton>
                  <SettingsButton
                    variant="secondary"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      clearPasswordErrors()
                      passwordErrorHandler.clearError()
                    }}
                    disabled={isChangingPassword}
                  >
                    Cancelar
                  </SettingsButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Data Export */}
      <SettingsCard 
        title="Exportación de Datos" 
        description="Descarga una copia de todos tus datos de entrenamiento"
      >
        {/* Export Error Display */}
        {exportErrorHandler.error && (
          <ErrorDisplay
            error={exportErrorHandler.error}
            variant="settings"
            context="security"
            onRetry={() => exportErrorHandler.retry(handleDataExport)}
            onDismiss={exportErrorHandler.clearError}
            showRetry={exportErrorHandler.error.retryable && !exportErrorHandler.isRetrying}
            className="mb-4"
          />
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">Exportar Datos de Entrenamiento</p>
            <p className="text-xs text-gray-500">
              Incluye registros de entrenamientos, perfil y configuraciones
            </p>
          </div>
          <SettingsButton
            variant="secondary"
            onClick={handleDataExport}
            loading={isExportingData}
            data-testid="export-data-button"
          >
            {isExportingData ? 'Exportando...' : 'Exportar Datos'}
          </SettingsButton>
        </div>
      </SettingsCard>
    </div>
  )
}

export default SecuritySection