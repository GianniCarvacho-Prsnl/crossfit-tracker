import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the hooks before importing the component
jest.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: jest.fn()
}))

jest.mock('@/hooks/useUserPreferences', () => ({
  useUserPreferences: jest.fn()
}))

import PersonalDataSection from '@/components/settings/sections/PersonalDataSection'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUserPreferences } from '@/hooks/useUserPreferences'

const mockUseUserProfile = useUserProfile as jest.MockedFunction<typeof useUserProfile>
const mockUseUserPreferences = useUserPreferences as jest.MockedFunction<typeof useUserPreferences>

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated'
} as any

const mockProfile = {
  id: 'profile-id',
  user_id: 'test-user-id',
  display_name: 'Test User',
  profile_photo_url: null,
  weight_kg: 70,
  height_cm: 175,
  gender: 'male' as const,
  experience_level: 'intermediate' as const,
  birth_date: '1990-01-01',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const mockPreferences = {
  id: 'preferences-id',
  user_id: 'test-user-id',
  preferred_units: 'metric' as const,
  theme: 'light' as const,
  language: 'es' as const,
  notifications_enabled: true,
  workout_reminders: true,
  preferred_1rm_formula: 'epley' as const,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const defaultProps = {
  user: mockUser,
  tempFormData: {},
  updateTempFormData: jest.fn(),
  saveTempChanges: jest.fn(),
  discardTempChanges: jest.fn(),
  hasUnsavedChanges: false
}

describe('PersonalDataSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createProfile: jest.fn(),
      updateProfile: jest.fn(),
      uploadProfilePhoto: jest.fn(),
      deleteProfile: jest.fn()
    })

    mockUseUserPreferences.mockReturnValue({
      preferences: mockPreferences,
      loading: false,
      error: null,
      refetch: jest.fn(),
      updatePreferences: jest.fn(),
      resetPreferences: jest.fn(),
      updateSinglePreference: jest.fn()
    })
  })

  test('renders loading state', () => {
    mockUseUserProfile.mockReturnValue({
      profile: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
      createProfile: jest.fn(),
      updateProfile: jest.fn(),
      uploadProfilePhoto: jest.fn(),
      deleteProfile: jest.fn()
    })

    render(<PersonalDataSection {...defaultProps} />)
    
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  test('renders form with metric units', () => {
    render(<PersonalDataSection {...defaultProps} />)
    
    expect(screen.getByText('Datos Personales')).toBeInTheDocument()
    expect(screen.getByLabelText('Peso (kg)')).toBeInTheDocument()
    expect(screen.getByLabelText('Estatura (cm)')).toBeInTheDocument()
    expect(screen.getByLabelText('Género')).toBeInTheDocument()
    expect(screen.getByLabelText('Nivel de Experiencia')).toBeInTheDocument()
    expect(screen.getByLabelText('Fecha de Nacimiento')).toBeInTheDocument()
  })

  test('renders form with imperial units', () => {
    const imperialPreferences = { ...mockPreferences, preferred_units: 'imperial' as const }
    mockUseUserPreferences.mockReturnValue({
      preferences: imperialPreferences,
      loading: false,
      error: null,
      refetch: jest.fn(),
      updatePreferences: jest.fn(),
      resetPreferences: jest.fn(),
      updateSinglePreference: jest.fn()
    })

    render(<PersonalDataSection {...defaultProps} />)
    
    expect(screen.getByLabelText('Peso (lbs)')).toBeInTheDocument()
    expect(screen.getByLabelText('Estatura (pies y pulgadas)')).toBeInTheDocument()
    expect(screen.getByText('Pies')).toBeInTheDocument()
    expect(screen.getByText('Pulgadas')).toBeInTheDocument()
  })

  test('populates form with existing profile data in metric', () => {
    render(<PersonalDataSection {...defaultProps} />)
    
    expect(screen.getByDisplayValue('70')).toBeInTheDocument() // weight
    expect(screen.getByDisplayValue('175')).toBeInTheDocument() // height
    
    // Check select values by getting the element and checking its value
    const genderSelect = screen.getByLabelText('Género') as HTMLSelectElement
    expect(genderSelect.value).toBe('male')
    
    const experienceSelect = screen.getByLabelText('Nivel de Experiencia') as HTMLSelectElement
    expect(experienceSelect.value).toBe('intermediate')
    
    expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument() // birth date
  })

  test('populates form with existing profile data in imperial', () => {
    const imperialPreferences = { ...mockPreferences, preferred_units: 'imperial' as const }
    mockUseUserPreferences.mockReturnValue({
      preferences: imperialPreferences,
      loading: false,
      error: null,
      refetch: jest.fn(),
      updatePreferences: jest.fn(),
      resetPreferences: jest.fn(),
      updateSinglePreference: jest.fn()
    })

    render(<PersonalDataSection {...defaultProps} />)
    
    // Weight should be converted from 70kg to ~154.3 lbs
    expect(screen.getByDisplayValue('154.3')).toBeInTheDocument()
    // Height should be converted from 175cm to 5'8.9"
    expect(screen.getByDisplayValue('5')).toBeInTheDocument() // feet
    expect(screen.getByDisplayValue('8.9')).toBeInTheDocument() // inches
  })

  test('validates weight input', async () => {
    render(<PersonalDataSection {...defaultProps} />)
    
    const weightInput = screen.getByLabelText('Peso (kg)')
    
    // Test invalid weight
    fireEvent.change(weightInput, { target: { value: '-10' } })
    fireEvent.click(screen.getByText('Guardar Cambios'))
    
    await waitFor(() => {
      expect(screen.getByText('Peso debe ser mayor que 0')).toBeInTheDocument()
    })
    
    // Test out of range weight
    fireEvent.change(weightInput, { target: { value: '500' } })
    fireEvent.click(screen.getByText('Guardar Cambios'))
    
    await waitFor(() => {
      expect(screen.getByText('Peso debe estar entre 20 y 300 kg')).toBeInTheDocument()
    })
  })

  test('validates height input in metric', async () => {
    render(<PersonalDataSection {...defaultProps} />)
    
    const heightInput = screen.getByLabelText('Estatura (cm)')
    
    // Test invalid height
    fireEvent.change(heightInput, { target: { value: '-10' } })
    fireEvent.click(screen.getByText('Guardar Cambios'))
    
    await waitFor(() => {
      expect(screen.getByText('Estatura debe ser mayor que 0')).toBeInTheDocument()
    })
    
    // Test out of range height
    fireEvent.change(heightInput, { target: { value: '300' } })
    fireEvent.click(screen.getByText('Guardar Cambios'))
    
    await waitFor(() => {
      expect(screen.getByText('Estatura debe estar entre 100 y 250 cm')).toBeInTheDocument()
    })
  })

  test('validates birth date input', async () => {
    render(<PersonalDataSection {...defaultProps} />)
    
    const birthDateInput = screen.getByLabelText('Fecha de Nacimiento')
    
    // Test future date (too young)
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() - 10) // 10 years old
    fireEvent.change(birthDateInput, { target: { value: futureDate.toISOString().split('T')[0] } })
    fireEvent.click(screen.getByText('Guardar Cambios'))
    
    await waitFor(() => {
      expect(screen.getByText('Debe tener al menos 13 años')).toBeInTheDocument()
    })
  })

  test('shows save/discard buttons when form has changes', async () => {
    render(<PersonalDataSection {...defaultProps} />)
    
    // Initially no buttons should be visible
    expect(screen.queryByText('Guardar Cambios')).not.toBeInTheDocument()
    expect(screen.queryByText('Descartar')).not.toBeInTheDocument()
    
    // Make a change
    const weightInput = screen.getByLabelText('Peso (kg)')
    fireEvent.change(weightInput, { target: { value: '75' } })
    
    await waitFor(() => {
      expect(screen.getByText('Guardar Cambios')).toBeInTheDocument()
      expect(screen.getByText('Descartar')).toBeInTheDocument()
    })
  })

  test('calls updateProfile when saving valid data', async () => {
    const mockUpdateProfile = jest.fn()
    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createProfile: jest.fn(),
      updateProfile: mockUpdateProfile,
      uploadProfilePhoto: jest.fn(),
      deleteProfile: jest.fn()
    })

    render(<PersonalDataSection {...defaultProps} />)
    
    // Make changes
    const weightInput = screen.getByLabelText('Peso (kg)')
    fireEvent.change(weightInput, { target: { value: '75' } })
    
    const genderSelect = screen.getByLabelText('Género')
    fireEvent.change(genderSelect, { target: { value: 'female' } })
    
    // Save changes
    fireEvent.click(screen.getByText('Guardar Cambios'))
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        weight_kg: 75,
        height_cm: 175,
        gender: 'female',
        experience_level: 'intermediate',
        birth_date: '1990-01-01'
      })
    })
  })

  test('discards changes when discard button is clicked', async () => {
    render(<PersonalDataSection {...defaultProps} />)
    
    // Make a change
    const weightInput = screen.getByLabelText('Peso (kg)')
    fireEvent.change(weightInput, { target: { value: '75' } })
    
    // Discard changes
    fireEvent.click(screen.getByText('Descartar'))
    
    await waitFor(() => {
      expect(weightInput).toHaveValue(70) // Should revert to original value
    })
  })

  test('handles empty profile gracefully', () => {
    mockUseUserProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createProfile: jest.fn(),
      updateProfile: jest.fn(),
      uploadProfilePhoto: jest.fn(),
      deleteProfile: jest.fn()
    })

    render(<PersonalDataSection {...defaultProps} />)
    
    // Should render form with empty values
    expect(screen.getByLabelText('Peso (kg)')).toHaveValue(null)
    expect(screen.getByLabelText('Estatura (cm)')).toHaveValue(null)
    expect(screen.getByLabelText('Género')).toHaveValue('')
  })
})