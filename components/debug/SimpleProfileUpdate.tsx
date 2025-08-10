'use client'

import React, { useState } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'

interface SimpleProfileUpdateProps {
  user: any
}

const SimpleProfileUpdate: React.FC<SimpleProfileUpdateProps> = ({ user }) => {
  const { profile, loading, error, updateProfile } = useUserProfile(user?.id)
  const [displayName, setDisplayName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)

  // Initialize display name when profile loads
  React.useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name)
    }
  }, [profile?.display_name])

  const handleUpdate = async () => {
    if (!displayName.trim()) {
      setUpdateError('El nombre no puede estar vacío')
      return
    }

    try {
      setIsUpdating(true)
      setUpdateError(null)
      setUpdateSuccess(null)
      
      console.log('Attempting to update display_name to:', displayName.trim())
      
      const result = await updateProfile({ 
        display_name: displayName.trim() 
      })
      
      console.log('Update successful:', result)
      setUpdateSuccess(`Nombre actualizado exitosamente a: ${result.display_name}`)
      
    } catch (err) {
      console.error('Update failed:', err)
      setUpdateError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return <div>Cargando perfil...</div>
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Simple Profile Update Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre de Usuario Actual:
          </label>
          <p className="text-sm text-gray-600">
            {profile?.display_name || 'Sin nombre configurado'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Nuevo Nombre:
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ingresa tu nombre"
            disabled={isUpdating}
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={isUpdating || !displayName.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isUpdating ? 'Actualizando...' : 'Actualizar Nombre'}
        </button>

        {updateError && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-700 text-sm">Error: {updateError}</p>
          </div>
        )}

        {updateSuccess && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-md">
            <p className="text-green-700 text-sm">{updateSuccess}</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-md">
            <p className="text-yellow-700 text-sm">Hook Error: {error.message}</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>User ID: {user?.id}</p>
          <p>Profile ID: {profile?.id}</p>
          <p>Current display_name: {JSON.stringify(profile?.display_name)}</p>
        </div>
      </div>
    </div>
  )
}

export default SimpleProfileUpdate