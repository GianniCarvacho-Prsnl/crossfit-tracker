import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ExerciseManagementSection from '@/components/settings/sections/ExerciseManagementSection'
import { useExercises } from '@/hooks/useExercises'
import { AppError } from '@/utils/errorHandling'

// Mock the useExercises hook
jest.mock('@/hooks/useExercises')
const mockUseExercises = useExercises as jest.MockedFunction<typeof useExercises>

// Mock user object
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z'
}

// Mock props
const mockProps = {
  user: mockUser,
  tempFormData: {},
  updateTempFormData: jest.fn(),
  saveTempChanges: jest.fn(),
  discardTempChanges: jest.fn(),
  hasUnsavedChanges: false
}

// Mock exercises data
const mockExercises = [
  { id: 1, name: 'Squat', created_at: '2023-01-01T00:00:00Z' },
  { id: 2, name: 'Deadlift', created_at: '2023-01-01T00:00:00Z' },
  { id: 3, name: 'Bench Press', created_at: '2023-01-01T00:00:00Z' }
]

describe('ExerciseManagementSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    mockUseExercises.mockReturnValue({
      exercises: [],
      loading: true,
      error: null,
      refetch: jest.fn(),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      deleteExercise: jest.fn()
    })

    render(<ExerciseManagementSection {...mockProps} />)

    expect(screen.getByText('Cargando ejercicios...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders exercises list correctly', () => {
    mockUseExercises.mockReturnValue({
      exercises: mockExercises,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      deleteExercise: jest.fn()
    })

    render(<ExerciseManagementSection {...mockProps} />)

    expect(screen.getByText('Administrar Ejercicios')).toBeInTheDocument()
    expect(screen.getByText('Ejercicios Disponibles (3)')).toBeInTheDocument()
    expect(screen.getByText('Squat')).toBeInTheDocument()
    expect(screen.getByText('Deadlift')).toBeInTheDocument()
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('renders empty state when no exercises', () => {
    mockUseExercises.mockReturnValue({
      exercises: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      deleteExercise: jest.fn()
    })

    render(<ExerciseManagementSection {...mockProps} />)

    expect(screen.getByText('No hay ejercicios disponibles')).toBeInTheDocument()
    expect(screen.getByText('Ejercicios Disponibles (0)')).toBeInTheDocument()
  })

  it('handles creating new exercise', async () => {
    const mockCreateExercise = jest.fn().mockResolvedValue({ id: 4, name: 'Clean', created_at: '2023-01-01T00:00:00Z' })
    
    mockUseExercises.mockReturnValue({
      exercises: mockExercises,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createExercise: mockCreateExercise,
      updateExercise: jest.fn(),
      deleteExercise: jest.fn()
    })

    render(<ExerciseManagementSection {...mockProps} />)

    const input = screen.getByPlaceholderText('Nombre del nuevo ejercicio')
    const addButton = screen.getByText('Agregar')

    fireEvent.change(input, { target: { value: 'Clean' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockCreateExercise).toHaveBeenCalledWith('Clean')
    })
  })

  it('handles editing exercise', async () => {
    const mockUpdateExercise = jest.fn().mockResolvedValue({ id: 1, name: 'Back Squat', created_at: '2023-01-01T00:00:00Z' })
    
    mockUseExercises.mockReturnValue({
      exercises: mockExercises,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createExercise: jest.fn(),
      updateExercise: mockUpdateExercise,
      deleteExercise: jest.fn()
    })

    render(<ExerciseManagementSection {...mockProps} />)

    // Click edit button for first exercise
    const editButtons = screen.getAllByText('Editar')
    fireEvent.click(editButtons[0])

    // Should show edit form
    const editInput = screen.getByDisplayValue('Squat')
    const saveButton = screen.getByText('Guardar')

    fireEvent.change(editInput, { target: { value: 'Back Squat' } })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateExercise).toHaveBeenCalledWith(1, 'Back Squat')
    })
  })

  it('handles deleting exercise with confirmation', async () => {
    const mockDeleteExercise = jest.fn().mockResolvedValue(undefined)
    
    // Mock window.confirm
    const originalConfirm = window.confirm
    window.confirm = jest.fn().mockReturnValue(true)

    mockUseExercises.mockReturnValue({
      exercises: mockExercises,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      deleteExercise: mockDeleteExercise
    })

    render(<ExerciseManagementSection {...mockProps} />)

    const deleteButtons = screen.getAllByText('Eliminar')
    fireEvent.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar "Squat"? Esta acción no se puede deshacer.')

    await waitFor(() => {
      expect(mockDeleteExercise).toHaveBeenCalledWith(1)
    })

    // Restore original confirm
    window.confirm = originalConfirm
  })

  it('cancels delete when user declines confirmation', () => {
    const mockDeleteExercise = jest.fn()
    
    // Mock window.confirm to return false
    const originalConfirm = window.confirm
    window.confirm = jest.fn().mockReturnValue(false)

    mockUseExercises.mockReturnValue({
      exercises: mockExercises,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      deleteExercise: mockDeleteExercise
    })

    render(<ExerciseManagementSection {...mockProps} />)

    const deleteButtons = screen.getAllByText('Eliminar')
    fireEvent.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalled()
    expect(mockDeleteExercise).not.toHaveBeenCalled()

    // Restore original confirm
    window.confirm = originalConfirm
  })

  it('displays error when exercise operations fail', async () => {
    const mockError = new AppError('Error al crear ejercicio', 'CREATE_ERROR', 'Database error')
    const mockCreateExercise = jest.fn().mockRejectedValue(mockError)
    
    mockUseExercises.mockReturnValue({
      exercises: mockExercises,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createExercise: mockCreateExercise,
      updateExercise: jest.fn(),
      deleteExercise: jest.fn()
    })

    render(<ExerciseManagementSection {...mockProps} />)

    const input = screen.getByPlaceholderText('Nombre del nuevo ejercicio')
    const addButton = screen.getByText('Agregar')

    fireEvent.change(input, { target: { value: 'Clean' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Error al crear ejercicio')).toBeInTheDocument()
    })
  })

  it('displays loading error from hook', () => {
    const mockError = new AppError('Error al cargar ejercicios', 'FETCH_ERROR', 'Network error')
    
    mockUseExercises.mockReturnValue({
      exercises: [],
      loading: false,
      error: mockError,
      refetch: jest.fn(),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      deleteExercise: jest.fn()
    })

    render(<ExerciseManagementSection {...mockProps} />)

    expect(screen.getByText('Error al cargar ejercicios')).toBeInTheDocument()
  })

  it('handles cancel edit correctly', () => {
    mockUseExercises.mockReturnValue({
      exercises: mockExercises,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      deleteExercise: jest.fn()
    })

    render(<ExerciseManagementSection {...mockProps} />)

    // Click edit button for first exercise
    const editButtons = screen.getAllByText('Editar')
    fireEvent.click(editButtons[0])

    // Should show edit form
    expect(screen.getByDisplayValue('Squat')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()

    // Click cancel
    fireEvent.click(screen.getByText('Cancelar'))

    // Should return to normal view
    expect(screen.queryByDisplayValue('Squat')).not.toBeInTheDocument()
    expect(screen.getByText('Squat')).toBeInTheDocument()
  })

  it('prevents creating exercise with empty name', () => {
    const mockCreateExercise = jest.fn()
    
    mockUseExercises.mockReturnValue({
      exercises: mockExercises,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createExercise: mockCreateExercise,
      updateExercise: jest.fn(),
      deleteExercise: jest.fn()
    })

    render(<ExerciseManagementSection {...mockProps} />)

    const addButton = screen.getByText('Agregar')
    
    // Button should be disabled when input is empty
    expect(addButton).toBeDisabled()

    // Try to submit form with empty input
    fireEvent.click(addButton)
    expect(mockCreateExercise).not.toHaveBeenCalled()
  })
})