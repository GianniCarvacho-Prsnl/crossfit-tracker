import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AppError, ErrorType } from '@/utils/errorHandling'

// Mock the hooks before importing the component
jest.mock('@/hooks/useExerciseGoals', () => ({
  useExerciseGoals: jest.fn()
}))

jest.mock('@/hooks/useUserPreferences', () => ({
  useUserPreferences: jest.fn()
}))

jest.mock('@/hooks/useExercises', () => ({
  useExercises: jest.fn()
}))

import TrainingSection from '@/components/settings/sections/TrainingSection'
import { useExerciseGoals } from '@/hooks/useExerciseGoals'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useExercises } from '@/hooks/useExercises'

const mockUseExerciseGoals = useExerciseGoals as jest.MockedFunction<typeof useExerciseGoals>
const mockUseUserPreferences = useUserPreferences as jest.MockedFunction<typeof useUserPreferences>
const mockUseExercises = useExercises as jest.MockedFunction<typeof useExercises>

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: '2023-01-01T00:00:00Z',
  phone: '',
  confirmed_at: '2023-01-01T00:00:00Z',
  last_sign_in_at: '2023-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const mockExercises = [
  { id: 1, name: 'Squat', created_at: '2023-01-01T00:00:00Z' },
  { id: 2, name: 'Deadlift', created_at: '2023-01-01T00:00:00Z' },
  { id: 3, name: 'Bench Press', created_at: '2023-01-01T00:00:00Z' }
]

const mockGoals = [
  {
    id: 'goal-1',
    user_id: 'test-user-id',
    exercise_id: 1,
    target_1rm_lbs: 225,
    target_date: '2024-12-31',
    notes: 'Focus on form',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'goal-2',
    user_id: 'test-user-id',
    exercise_id: 2,
    target_1rm_lbs: 315,
    target_date: null,
    notes: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
]

const mockPreferences = {
  id: 'pref-1',
  user_id: 'test-user-id',
  preferred_units: 'imperial' as const,
  theme: 'system' as const,
  language: 'es' as const,
  notifications_enabled: true,
  workout_reminders: true,
  preferred_1rm_formula: 'epley' as const,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

describe('TrainingSection', () => {
  beforeEach(() => {
    mockUseExerciseGoals.mockReturnValue({
      goals: mockGoals,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createGoal: jest.fn(),
      updateGoal: jest.fn(),
      deleteGoal: jest.fn(),
      setGoal: jest.fn(),
      getGoalByExercise: jest.fn(),
      getUpcomingGoals: jest.fn()
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

    mockUseExercises.mockReturnValue({
      exercises: mockExercises,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      deleteExercise: jest.fn()
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders training section with goals', () => {
    render(<TrainingSection user={mockUser} />)
    
    expect(screen.getByText('Metas Personales')).toBeInTheDocument()
    expect(screen.getByText('Recordatorios de Entrenamiento')).toBeInTheDocument()
    expect(screen.getByText('Cálculos de 1RM')).toBeInTheDocument()
    expect(screen.getByText('Sistema de Notificaciones')).toBeInTheDocument()
  })

  it('displays existing goals correctly', () => {
    render(<TrainingSection user={mockUser} />)
    
    expect(screen.getByText('Squat')).toBeInTheDocument()
    expect(screen.getByText('Meta: 225 lbs')).toBeInTheDocument()
    expect(screen.getByText('Fecha objetivo: 30 de diciembre de 2024')).toBeInTheDocument()
    expect(screen.getByText('Notas: Focus on form')).toBeInTheDocument()
    
    expect(screen.getByText('Deadlift')).toBeInTheDocument()
    expect(screen.getByText('Meta: 315 lbs')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseExerciseGoals.mockReturnValue({
      goals: [],
      loading: true,
      error: null,
      refetch: jest.fn(),
      createGoal: jest.fn(),
      updateGoal: jest.fn(),
      deleteGoal: jest.fn(),
      setGoal: jest.fn(),
      getGoalByExercise: jest.fn(),
      getUpcomingGoals: jest.fn()
    })

    render(<TrainingSection user={mockUser} />)
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('shows error state', () => {
    const error = new AppError('Test error', ErrorType.DATABASE, 'Test error details')
    mockUseExerciseGoals.mockReturnValue({
      goals: [],
      loading: false,
      error,
      refetch: jest.fn(),
      createGoal: jest.fn(),
      updateGoal: jest.fn(),
      deleteGoal: jest.fn(),
      setGoal: jest.fn(),
      getGoalByExercise: jest.fn(),
      getUpcomingGoals: jest.fn()
    })

    render(<TrainingSection user={mockUser} />)
    
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('opens goal form when add button is clicked', () => {
    render(<TrainingSection user={mockUser} />)
    
    const addButton = screen.getByText('Agregar Meta')
    fireEvent.click(addButton)
    
    expect(screen.getByText('Nueva Meta')).toBeInTheDocument()
    expect(screen.getByLabelText('Ejercicio *')).toBeInTheDocument()
    expect(screen.getByLabelText('Peso objetivo (lbs) *')).toBeInTheDocument()
    expect(screen.getByLabelText('Fecha objetivo (opcional)')).toBeInTheDocument()
    expect(screen.getByLabelText('Notas (opcional)')).toBeInTheDocument()
  })

  it('validates goal form submission', async () => {
    const mockSetGoal = jest.fn()
    mockUseExerciseGoals.mockReturnValue({
      goals: mockGoals,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createGoal: jest.fn(),
      updateGoal: jest.fn(),
      deleteGoal: jest.fn(),
      setGoal: mockSetGoal,
      getGoalByExercise: jest.fn(),
      getUpcomingGoals: jest.fn()
    })

    render(<TrainingSection user={mockUser} />)
    
    // Open form
    fireEvent.click(screen.getByText('Agregar Meta'))
    
    // Try to save without filling required fields
    fireEvent.click(screen.getByText('Guardar'))
    
    await waitFor(() => {
      expect(screen.getByText('Por favor completa los campos requeridos')).toBeInTheDocument()
    })
    
    expect(mockSetGoal).not.toHaveBeenCalled()
  })

  it('saves goal successfully', async () => {
    const mockSetGoal = jest.fn().mockResolvedValue({
      id: 'new-goal',
      user_id: 'test-user-id',
      exercise_id: 1,
      target_1rm_lbs: 200,
      target_date: '2024-06-01',
      notes: 'New goal',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    })

    mockUseExerciseGoals.mockReturnValue({
      goals: mockGoals,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createGoal: jest.fn(),
      updateGoal: jest.fn(),
      deleteGoal: jest.fn(),
      setGoal: mockSetGoal,
      getGoalByExercise: jest.fn(),
      getUpcomingGoals: jest.fn()
    })

    render(<TrainingSection user={mockUser} />)
    
    // Open form
    fireEvent.click(screen.getByText('Agregar Meta'))
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Ejercicio *'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('Peso objetivo (lbs) *'), { target: { value: '200' } })
    fireEvent.change(screen.getByLabelText('Fecha objetivo (opcional)'), { target: { value: '2024-06-01' } })
    fireEvent.change(screen.getByLabelText('Notas (opcional)'), { target: { value: 'New goal' } })
    
    // Save
    fireEvent.click(screen.getByText('Guardar'))
    
    await waitFor(() => {
      expect(mockSetGoal).toHaveBeenCalledWith(1, {
        target_1rm_lbs: 200,
        target_date: '2024-06-01',
        notes: 'New goal'
      })
    })
  })

  it('edits existing goal', async () => {
    render(<TrainingSection user={mockUser} />)
    
    // Click edit on first goal
    const editButtons = screen.getAllByText('Editar')
    fireEvent.click(editButtons[0])
    
    expect(screen.getByText('Editar Meta')).toBeInTheDocument()
    expect(screen.getByDisplayValue('225')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Focus on form')).toBeInTheDocument()
  })

  it('deletes goal with confirmation', async () => {
    const mockDeleteGoal = jest.fn().mockResolvedValue(undefined)
    mockUseExerciseGoals.mockReturnValue({
      goals: mockGoals,
      loading: false,
      error: null,
      refetch: jest.fn(),
      createGoal: jest.fn(),
      updateGoal: jest.fn(),
      deleteGoal: mockDeleteGoal,
      setGoal: jest.fn(),
      getGoalByExercise: jest.fn(),
      getUpcomingGoals: jest.fn()
    })

    // Mock window.confirm
    const originalConfirm = window.confirm
    window.confirm = jest.fn().mockReturnValue(true)

    render(<TrainingSection user={mockUser} />)
    
    // Click delete on first goal
    const deleteButtons = screen.getAllByText('Eliminar')
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(mockDeleteGoal).toHaveBeenCalledWith('goal-1')
    })

    // Restore original confirm
    window.confirm = originalConfirm
  })

  it('updates workout reminders preference', async () => {
    const mockUpdateSinglePreference = jest.fn().mockResolvedValue(mockPreferences)
    mockUseUserPreferences.mockReturnValue({
      preferences: mockPreferences,
      loading: false,
      error: null,
      refetch: jest.fn(),
      updatePreferences: jest.fn(),
      resetPreferences: jest.fn(),
      updateSinglePreference: mockUpdateSinglePreference
    })

    render(<TrainingSection user={mockUser} />)
    
    const reminderToggle = screen.getByRole('switch')
    fireEvent.click(reminderToggle)
    
    await waitFor(() => {
      expect(mockUpdateSinglePreference).toHaveBeenCalledWith('workout_reminders', false)
    })
  })

  it('updates 1RM formula preference', async () => {
    const mockUpdateSinglePreference = jest.fn().mockResolvedValue(mockPreferences)
    mockUseUserPreferences.mockReturnValue({
      preferences: mockPreferences,
      loading: false,
      error: null,
      refetch: jest.fn(),
      updatePreferences: jest.fn(),
      resetPreferences: jest.fn(),
      updateSinglePreference: mockUpdateSinglePreference
    })

    render(<TrainingSection user={mockUser} />)
    
    const formulaSelect = screen.getByDisplayValue('Epley (más común)')
    fireEvent.change(formulaSelect, { target: { value: 'brzycki' } })
    
    await waitFor(() => {
      expect(mockUpdateSinglePreference).toHaveBeenCalledWith('preferred_1rm_formula', 'brzycki')
    })
  })

  it('shows notification status correctly', () => {
    render(<TrainingSection user={mockUser} />)
    
    expect(screen.getByText('Sistema de Notificaciones')).toBeInTheDocument()
    expect(screen.getByText('1 metas con fecha')).toBeInTheDocument()
  })

  it('shows empty state when no goals exist', () => {
    mockUseExerciseGoals.mockReturnValue({
      goals: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
      createGoal: jest.fn(),
      updateGoal: jest.fn(),
      deleteGoal: jest.fn(),
      setGoal: jest.fn(),
      getGoalByExercise: jest.fn(),
      getUpcomingGoals: jest.fn()
    })

    render(<TrainingSection user={mockUser} />)
    
    expect(screen.getByText('No tienes metas establecidas aún.')).toBeInTheDocument()
  })

  it('disables workout reminders when notifications are disabled', () => {
    const preferencesWithoutNotifications = {
      ...mockPreferences,
      notifications_enabled: false
    }

    mockUseUserPreferences.mockReturnValue({
      preferences: preferencesWithoutNotifications,
      loading: false,
      error: null,
      refetch: jest.fn(),
      updatePreferences: jest.fn(),
      resetPreferences: jest.fn(),
      updateSinglePreference: jest.fn()
    })

    render(<TrainingSection user={mockUser} />)
    
    const reminderToggle = screen.getByRole('switch')
    expect(reminderToggle).toBeDisabled()
    
    expect(screen.getByText('Los recordatorios requieren que las notificaciones estén habilitadas en Preferencias de Aplicación.')).toBeInTheDocument()
  })
})