'use client'

import React, { useState, useRef } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'


interface ProfileSectionProps {
  user: any
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user }) => {
  const { profile, loading, updateProfile, uploadProfilePhoto } = useUserProfile(user?.id)
  const [displayName, setDisplayName] = useState('')
  const [isUpdatingName, setIsUpdatingName] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [nameError, setNameError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update display name when profile loads
  React.useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name)
    }
  }, [profile?.display_name])

  // Handle name update
  const handleNameUpdate = async () => {
    const trimmedName = displayName.trim()
    
    if (!trimmedName) {
      setNameError('El nombre es requerido')
      return
    }

    if (trimmedName.length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres')
      return
    }

    try {
      setIsUpdatingName(true)
      setNameError('')
      await updateProfile({ display_name: trimmedName })
    } catch (err) {
      setNameError('Error al actualizar el nombre')
      console.error('Name update error:', err)
    } finally {
      setIsUpdatingName(false)
    }
  }

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Formato no válido. Use JPG, PNG o WebP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('La imagen es demasiado grande. Máximo 5MB')
      return
    }

    try {
      setIsUploadingPhoto(true)
      setPhotoError('')
      await uploadProfilePhoto(file)
    } catch (err) {
      setPhotoError('Error al subir la foto')
      console.error('Photo upload error:', err)
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Photo Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Foto de Perfil</h3>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center relative">
            {profile?.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            
            {isUploadingPhoto && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {isUploadingPhoto ? 'Subiendo...' : 'Cambiar Foto'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {photoError && (
            <p className="text-red-700 text-sm font-medium">{photoError}</p>
          )}

          <p className="text-xs text-gray-600">JPG, PNG o WebP. Máximo 5MB</p>
        </div>
      </div>

      {/* Name Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Nombre de Usuario</h3>
        
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value)
                setNameError('')
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleNameUpdate()}
              placeholder="Ingresa tu nombre"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUpdatingName}
            />
            
            {nameError && (
              <p className="text-red-700 text-sm mt-1 font-medium">{nameError}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNameUpdate}
              disabled={
                !displayName.trim() || 
                displayName.trim() === (profile?.display_name || '').trim() || 
                isUpdatingName
              }
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdatingName ? 'Guardando...' : 'Guardar Nombre'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSection