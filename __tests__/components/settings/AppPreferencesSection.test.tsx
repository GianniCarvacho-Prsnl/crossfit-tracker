import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the hooks before importing the component
jest.mock('@/hooks/useUserPreferences', () => ({
  useUserPreferences: jest.fn()
}))

import AppPreferencesSection from '@/components/settings/sections/AppPreferencesSection'
import { useUserPreferences } from '@/hooks/useUserPreferences'

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

const mockProps = {
  user: mockUser,
  tempFormData: {},
  updateTempFormData: jest.fn(),
  saveTempChanges: jest.fn(),
  discardTempChanges: jest.fn(),
  hasUnsavedChanges: false
}

const mockPreferences = {
  id: 'pref-1',
  user_id: 'test-user-id',
  preferred_units: 'metric' as const,
  theme: 'light' as const,
  language: 'es' as const,
  notifications_enabled: true,
  workout_reminders: false,
  preferred_1rm_formula: 'epley' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockUpdateSinglePreference = jest.fn()

describe('AppPreferencesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseUserPreferences.mockReturnValue({
      preferences: mockPreferences,
      loading: false,
      error: null,
      refetch: jest.fn(),
      updatePreferences: jest.fn(),
      resetPreferences: jest.fn(),
      updateSinglePreference: mockUpdateSinglePreference
    })
  })

  it('renders all preference sections', () => {
    render(<AppPreferencesSection {...mockProps} />)

    expect(screen.getByText('Unidades de Medida')).toBeInTheDocument()
    expect(screen.getByText('Apariencia')).toBeInTheDocument()
    expect(screen.getByText('Idioma')).toBeInTheDocument()
    expect(screen.getByText('Notificaciones')).toBeInTheDocument()
    expect(screen.getByText('Cálculos de Entrenamiento')).toBeInTheDocument()
  })

  it('displays current preferences correctly', () => {
    render(<AppPreferencesSection {...mockProps} />)

    // Check units
    expect(screen.getByDisplayValue('metric')).toBeChecked()
    expect(screen.getByDisplayValue('imperial')).not.toBeChecked()

    // Check theme
    expect(screen.getByDisplayValue('light')).toBeChecked()
    expect(screen.getByDisplayValue('dark')).not.toBeChecked()
    expect(screen.getByDisplayValue('system')).not.toBeChecked()

    // Check language
    expect(screen.getByDisplayValue('es')).toBeChecked()
    expect(screen.getByDisplayValue('en')).not.toBeChecked()

    // Check 1RM formula select
    const formulaSelect = screen.getByRole('combobox')
    expect(formulaSelect).toHaveValue('epley')
  })

  it('handles unit preference change', async () => {
    mockUpdateSinglePreference.mockResolvedValue({
      ...mockPreferences,
      preferred_units: 'imperial'
    })

    render(<AppPreferencesSection {...mockProps} />)

    const imperialRadio = screen.getByDisplayValue('imperial')
    fireEvent.click(imperialRadio)

    await waitFor(() => {
      expect(mockUpdateSinglePreference).toHaveBeenCalledWith('preferred_units', 'imperial')
    })
  })

  it('handles theme preference change', async () => {
    mockUpdateSinglePreference.mockResolvedValue({
      ...mockPreferences,
      theme: 'dark'
    })

    render(<AppPreferencesSection {...mockProps} />)

    const darkRadio = screen.getByDisplayValue('dark')
    fireEvent.click(darkRadio)

    await waitFor(() => {
      expect(mockUpdateSinglePreference).toHaveBeenCalledWith('theme', 'dark')
    })
  })

  it('handles language preference change', async () => {
    mockUpdateSinglePreference.mockResolvedValue({
      ...mockPreferences,
      language: 'en'
    })

    render(<AppPreferencesSection {...mockProps} />)

    const englishRadio = screen.getByDisplayValue('en')
    fireEvent.click(englishRadio)

    await waitFor(() => {
      expect(mockUpdateSinglePreference).toHaveBeenCalledWith('language', 'en')
    })
  })

  it('handles notifications toggle', async () => {
    mockUpdateSinglePreference.mockResolvedValue({
      ...mockPreferences,
      notifications_enabled: false
    })

    render(<AppPreferencesSection {...mockProps} />)

    // Get the first switch (notifications)
    const switches = screen.getAllByRole('switch')
    const notificationsToggle = switches[0]
    fireEvent.click(notificationsToggle)

    await waitFor(() => {
      expect(mockUpdateSinglePreference).toHaveBeenCalledWith('notifications_enabled', false)
    })
  })

  it('handles workout reminders toggle', async () => {
    mockUpdateSinglePreference.mockResolvedValue({
      ...mockPreferences,
      workout_reminders: true
    })

    render(<AppPreferencesSection {...mockProps} />)

    // Get the second switch (workout reminders)
    const switches = screen.getAllByRole('switch')
    const remindersToggle = switches[1]
    fireEvent.click(remindersToggle)

    await waitFor(() => {
      expect(mockUpdateSinglePreference).toHaveBeenCalledWith('workout_reminders', true)
    })
  })

  it('handles 1RM formula change', async () => {
    mockUpdateSinglePreference.mockResolvedValue({
      ...mockPreferences,
      preferred_1rm_formula: 'brzycki'
    })

    render(<AppPreferencesSection {...mockProps} />)

    const formulaSelect = screen.getByDisplayValue('Epley (más común)')
    fireEvent.change(formulaSelect, { target: { value: 'brzycki' } })

    await waitFor(() => {
      expect(mockUpdateSinglePreference).toHaveBeenCalledWith('preferred_1rm_formula', 'brzycki')
    })
  })

  it('disables workout reminders when notifications are disabled', () => {
    mockUseUserPreferences.mockReturnValue({
      preferences: {
        ...mockPreferences,
        notifications_enabled: false,
        workout_reminders: true
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
      updatePreferences: jest.fn(),
      resetPreferences: jest.fn(),
      updateSinglePreference: mockUpdateSinglePreference
    })

    render(<AppPreferencesSection {...mockProps} />)

    // Find the switch by its aria-checked attribute and disabled state
    const switches = screen.getAllByRole('switch')
    const remindersToggle = switches.find(toggle => toggle.hasAttribute('disabled'))
    expect(remindersToggle).toBeDisabled()

    // Should show warning message
    expect(screen.getByText(/los recordatorios de entrenamiento requieren/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseUserPreferences.mockReturnValue({
      preferences: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
      updatePreferences: jest.fn(),
      resetPreferences: jest.fn(),
      updateSinglePreference: mockUpdateSinglePreference
    })

    const { container } = render(<AppPreferencesSection {...mockProps} />)

    // Check for loading animation elements
    const loadingElements = container.querySelectorAll('.animate-pulse')
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('shows error state', () => {
    const mockError = {
      message: 'Error loading preferences',
      type: 'DATABASE' as const,
      originalError: new Error('DB Error'),
      retryable: true,
      userMessage: 'Error loading preferences',
      name: 'AppError'
    }

    mockUseUserPreferences.mockReturnValue({
      preferences: null,
      loading: false,
      error: mockError,
      refetch: jest.fn(),
      updatePreferences: jest.fn(),
      resetPreferences: jest.fn(),
      updateSinglePreference: mockUpdateSinglePreference
    })

    render(<AppPreferencesSection {...mockProps} />)

    expect(screen.getByText('Error loading preferences')).toBeInTheDocument()
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('shows update error when preference update fails', async () => {
    const updateError = new Error('Update failed')
    mockUpdateSinglePreference.mockRejectedValue(updateError)

    render(<AppPreferencesSection {...mockProps} />)

    const imperialRadio = screen.getByDisplayValue('imperial')
    fireEvent.click(imperialRadio)

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument()
    })
  })

  it('shows loading overlay during updates', async () => {
    // Mock a slow update
    mockUpdateSinglePreference.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockPreferences), 100))
    )

    render(<AppPreferencesSection {...mockProps} />)

    const imperialRadio = screen.getByDisplayValue('imperial')
    fireEvent.click(imperialRadio)

    // Should show loading overlay
    expect(screen.getByText('Actualizando preferencia...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText('Actualizando preferencia...')).not.toBeInTheDocument()
    })
  })

  it('shows informational notes for future features', () => {
    render(<AppPreferencesSection {...mockProps} />)

    expect(screen.getByText(/la funcionalidad de cambio de idioma estará disponible/i)).toBeInTheDocument()
    expect(screen.getByText(/las notificaciones push estarán disponibles/i)).toBeInTheDocument()
  })
})