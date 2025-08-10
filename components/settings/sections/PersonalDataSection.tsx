'use client'

import React, { useState } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'

interface PersonalDataSectionProps {
  user: any
}

const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({ user }) => {
  const { profile, loading, updateProfile } = useUserProfile(user?.id)
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    gender: '',
    experienceLevel: '',
    birthDate: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        weight: profile.weight_kg?.toString() || '',
        height: profile.height_cm?.toString() || '',
        gender: profile.gender || '',
        experienceLevel: profile.experience_level || '',
        birthDate: profile.birth_date || ''
      })
    }
  }, [profile])

  const handleSave = async () => {
    try {
      setIsUpdating(true)
      setError('')
      
      const updateData: any = {}
      
      if (formData.weight.trim()) {
        updateData.weight_kg = parseFloat(formData.weight)
      }
      if (formData.height.trim()) {
        updateData.height_cm = parseFloat(formData.height)
      }
      if (formData.gender) {
        updateData.gender = formData.gender
      }
      if (formData.experienceLevel) {
        updateData.experience_level = formData.experienceLevel
      }
      if (formData.birthDate) {
        updateData.birth_date = formData.birthDate
      }
      
      await updateProfile(updateData)
    } catch (err) {
      setError('Error al guardar los datos')
      console.error('Save error:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const hasChanges = () => {
    if (!profile) return false
    return (
      formData.weight !== (profile.weight_kg?.toString() || '') ||
      formData.height !== (profile.height_cm?.toString() || '') ||
      formData.gender !== (profile.gender || '') ||
      formData.experienceLevel !== (profile.experience_level || '') ||
      formData.birthDate !== (profile.birth_date || '')
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-black mb-2">Datos Personales</h2>
      <p className="text-gray-600 mb-6">Configura tus datos físicos y demográficos</p>
      
      <div className="space-y-6">
        {/* Weight */}
        <div>
          <label className="block text-sm font-bold text-black mb-2">
            Peso (kg)
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
            placeholder="ej. 70"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-bold text-black mb-2">
            Estatura (cm)
          </label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
            placeholder="ej. 175"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-bold text-black mb-2">
            Género
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar género</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-bold text-black mb-2">
            Nivel de Experiencia
          </label>
          <select
            value={formData.experienceLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar nivel</option>
            <option value="beginner">Principiante (0-1 años)</option>
            <option value="intermediate">Intermedio (1-3 años)</option>
            <option value="advanced">Avanzado (3+ años)</option>
          </select>
        </div>

        {/* Birth Date */}
        <div>
          <label className="block text-sm font-bold text-black mb-2">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-red-700 text-sm font-medium">{error}</p>
        )}

        {hasChanges() && (
          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              onClick={() => {
                if (profile) {
                  setFormData({
                    weight: profile.weight_kg?.toString() || '',
                    height: profile.height_cm?.toString() || '',
                    gender: profile.gender || '',
                    experienceLevel: profile.experience_level || '',
                    birthDate: profile.birth_date || ''
                  })
                }
              }}
              className="flex-1 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
            >
              Descartar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PersonalDataSection