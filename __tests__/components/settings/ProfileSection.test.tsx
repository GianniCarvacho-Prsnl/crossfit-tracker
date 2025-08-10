import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the useUserProfile hook before importing the component
jest.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: jest.fn()
}))

// Mock the error handling module
jest.mock('@/utils/errorHandling', () => ({
  AppError: class AppError extends Error {
    constructor(public message: string, public type: string, public originalError: any) {
      super(message)
    }
  },
  ErrorType: {
    DATABASE: 'DATABASE',
    VALIDATION: 'VALIDATION',
    STORAGE: 'STORAGE'
  }
}))

import ProfileSection from '@/components/settings/sections/ProfileSection'
import { useUserProfile } from '@/hooks/useUserProfile'
import { AppError, ErrorType } from '@/utils/errorHandling'

const mockUseUserProfile = useUserProfile as jest.MockedFunction<typeof useUserProfile>

// Mock file reader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result: 'data:image/jpeg;base64,mockbase64data',
  onload: null as any
}

Object.defineProperty(global, 'FileReader', {
  writable: true,
  value: jest.fn(() => mockFileReader)
})

describe('ProfileSection', () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' }
  const mockProfile = {
    id: 'profile-id',
    user_id: mockUser.id,
    display_name: 'Test User',
    profile_photo_url: 'https://example.com/photo.jpg',
    weight_kg: null,
    height_cm: null,
    gender: null,
    experience_level: null,
    birth_date: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const defaultMockReturn = {
    profile: mockProfile,
    loading: false,
    error: null,
    refetch: jest.fn(),
    createProfile: jest.fn(),
    updateProfile: jest.fn(),
    uploadProfilePhoto: jest.fn(),
    deleteProfile: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUserProfile.mockReturnValue(defaultMockReturn)
  })

  it('renders loading state correctly', () => {
    mockUseUserProfile.mockReturnValue({
      ...defaultMockReturn,
      loading: true
    })

    render(<ProfileSection user={mockUser} />)
    
    // Check for the loading spinner by class
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders profile section with existing data', () => {
    render(<ProfileSection user={mockUser} />)
    
    expect(screen.getByText('Foto de Perfil')).toBeInTheDocument()
    expect(screen.getAllByText('Nombre de Usuario')).toHaveLength(2) // Title and label
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
    expect(screen.getByText('Cambiar Foto')).toBeInTheDocument()
  })

  it('renders profile section without existing photo', () => {
    mockUseUserProfile.mockReturnValue({
      ...defaultMockReturn,
      profile: { ...mockProfile, profile_photo_url: null }
    })

    render(<ProfileSection user={mockUser} />)
    
    expect(screen.getByText('Subir Foto')).toBeInTheDocument()
  })

  it('updates display name on input change', () => {
    render(<ProfileSection user={mockUser} />)
    
    const input = screen.getByDisplayValue('Test User')
    fireEvent.change(input, { target: { value: 'New Name' } })
    
    expect(input).toHaveValue('New Name')
  })

  it('calls updateProfile when save button is clicked', async () => {
    const mockUpdateProfile = jest.fn()
    mockUseUserProfile.mockReturnValue({
      ...defaultMockReturn,
      updateProfile: mockUpdateProfile
    })

    render(<ProfileSection user={mockUser} />)
    
    const input = screen.getByDisplayValue('Test User')
    fireEvent.change(input, { target: { value: 'New Name' } })
    
    const saveButton = screen.getByText('Guardar Nombre')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({ display_name: 'New Name' })
    })
  })

  it('calls updateProfile when Enter key is pressed', async () => {
    const mockUpdateProfile = jest.fn()
    mockUseUserProfile.mockReturnValue({
      ...defaultMockReturn,
      updateProfile: mockUpdateProfile
    })

    render(<ProfileSection user={mockUser} />)
    
    const input = screen.getByDisplayValue('Test User')
    fireEvent.change(input, { target: { value: 'New Name' } })
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({ display_name: 'New Name' })
    })
  })

  it('validates file type on photo upload', () => {
    render(<ProfileSection user={mockUser} />)
    
    const fileInput = screen.getByRole('button', { name: /cambiar foto/i })
    fireEvent.click(fileInput)
    
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' })
    
    Object.defineProperty(hiddenInput, 'files', {
      value: [invalidFile],
      writable: false
    })
    
    fireEvent.change(hiddenInput)
    
    expect(screen.getByText('Formato de imagen no válido. Use JPG, PNG o WebP.')).toBeInTheDocument()
  })

  it('validates file size on photo upload', () => {
    render(<ProfileSection user={mockUser} />)
    
    const fileInput = screen.getByRole('button', { name: /cambiar foto/i })
    fireEvent.click(fileInput)
    
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement
    // Create a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(hiddenInput, 'files', {
      value: [largeFile],
      writable: false
    })
    
    fireEvent.change(hiddenInput)
    
    expect(screen.getByText('La imagen es demasiado grande. Máximo 5MB.')).toBeInTheDocument()
  })

  it('calls uploadProfilePhoto with valid file', async () => {
    const mockUploadProfilePhoto = jest.fn()
    mockUseUserProfile.mockReturnValue({
      ...defaultMockReturn,
      uploadProfilePhoto: mockUploadProfilePhoto
    })

    render(<ProfileSection user={mockUser} />)
    
    const fileInput = screen.getByRole('button', { name: /cambiar foto/i })
    fireEvent.click(fileInput)
    
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(hiddenInput, 'files', {
      value: [validFile],
      writable: false
    })
    
    // Simulate FileReader onload
    mockFileReader.onload = jest.fn()
    fireEvent.change(hiddenInput)
    
    // Trigger the FileReader onload callback
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,mockdata' } } as any)
    }
    
    await waitFor(() => {
      expect(mockUploadProfilePhoto).toHaveBeenCalledWith(validFile)
    })
  })

  it('displays error from hook', () => {
    const mockError = new AppError('Test error message', ErrorType.DATABASE, 'Test error')
    mockUseUserProfile.mockReturnValue({
      ...defaultMockReturn,
      error: mockError
    })

    render(<ProfileSection user={mockUser} />)
    
    expect(screen.getByText('Error en el perfil')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('disables save button when name is empty', () => {
    render(<ProfileSection user={mockUser} />)
    
    const input = screen.getByDisplayValue('Test User')
    fireEvent.change(input, { target: { value: '' } })
    
    const saveButton = screen.getByText('Guardar Nombre')
    expect(saveButton).toBeDisabled()
  })

  it('disables save button when name is unchanged', () => {
    render(<ProfileSection user={mockUser} />)
    
    const saveButton = screen.getByText('Guardar Nombre')
    expect(saveButton).toBeDisabled()
  })

  it('shows loading state when updating name', () => {
    mockUseUserProfile.mockReturnValue({
      ...defaultMockReturn,
      updateProfile: jest.fn(() => new Promise(() => {})) // Never resolves
    })

    render(<ProfileSection user={mockUser} />)
    
    const input = screen.getByDisplayValue('Test User')
    fireEvent.change(input, { target: { value: 'New Name' } })
    
    const saveButton = screen.getByText('Guardar Nombre')
    fireEvent.click(saveButton)
    
    expect(saveButton).toHaveAttribute('disabled')
  })
})