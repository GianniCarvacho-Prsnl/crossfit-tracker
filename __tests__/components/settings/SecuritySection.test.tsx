import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SecuritySection from '@/components/settings/sections/SecuritySection'

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn()
}))

// Mock window.confirm and window.alert
const mockConfirm = jest.fn()
const mockAlert = jest.fn()
Object.defineProperty(window, 'confirm', { value: mockConfirm })
Object.defineProperty(window, 'alert', { value: mockAlert })

// Mock URL.createObjectURL and related APIs
Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'mock-url')
})
Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn()
})

// Mock document.createElement and related DOM APIs
const mockLink = {
  href: '',
  download: '',
  click: jest.fn()
}
const originalCreateElement = document.createElement
document.createElement = jest.fn((tagName) => {
  if (tagName === 'a') {
    return mockLink as any
  }
  return originalCreateElement.call(document, tagName)
})

const mockSupabase = {
  auth: {
    updateUser: jest.fn(),
    signOut: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
}

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {}
}

const defaultProps = {
  user: mockUser,
  tempFormData: {},
  updateTempFormData: jest.fn(),
  saveTempChanges: jest.fn(),
  discardTempChanges: jest.fn(),
  hasUnsavedChanges: false
}

describe('SecuritySection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { createClient } = require('@/utils/supabase/client')
    createClient.mockReturnValue(mockSupabase)
    mockConfirm.mockReturnValue(true)
  })

  afterEach(() => {
    document.createElement = originalCreateElement
  })

  it('renders security section with all cards', () => {
    render(<SecuritySection {...defaultProps} />)
    
    expect(screen.getByText('Seguridad de Contraseña')).toBeInTheDocument()
    expect(screen.getByText('Exportación de Datos')).toBeInTheDocument()
    expect(screen.getByText('Configuración de Privacidad')).toBeInTheDocument()
    expect(screen.getByText('Información de Seguridad')).toBeInTheDocument()
    expect(screen.getByText('Zona de Peligro')).toBeInTheDocument()
  })

  it('shows password change form when button is clicked', () => {
    render(<SecuritySection {...defaultProps} />)
    
    const changePasswordButton = screen.getByTestId('change-password-button')
    fireEvent.click(changePasswordButton)
    
    expect(screen.getByTestId('current-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('new-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument()
  })

  it('validates password requirements', async () => {
    render(<SecuritySection {...defaultProps} />)
    
    // Open password form
    fireEvent.click(screen.getByTestId('change-password-button'))
    
    // Fill form with invalid password
    fireEvent.change(screen.getByTestId('current-password-input'), {
      target: { value: 'oldpass' }
    })
    fireEvent.change(screen.getByTestId('new-password-input'), {
      target: { value: 'weak' }
    })
    fireEvent.change(screen.getByTestId('confirm-password-input'), {
      target: { value: 'weak' }
    })
    
    // Try to save
    fireEvent.click(screen.getByTestId('save-password-button'))
    
    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeInTheDocument()
    })
  })

  it('validates password confirmation match', async () => {
    render(<SecuritySection {...defaultProps} />)
    
    // Open password form
    fireEvent.click(screen.getByTestId('change-password-button'))
    
    // Fill form with mismatched passwords
    fireEvent.change(screen.getByTestId('current-password-input'), {
      target: { value: 'oldPassword123' }
    })
    fireEvent.change(screen.getByTestId('new-password-input'), {
      target: { value: 'NewPassword123' }
    })
    fireEvent.change(screen.getByTestId('confirm-password-input'), {
      target: { value: 'DifferentPassword123' }
    })
    
    // Try to save
    fireEvent.click(screen.getByTestId('save-password-button'))
    
    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })
  })

  it('successfully changes password with valid data', async () => {
    mockSupabase.auth.updateUser.mockResolvedValue({ error: null })
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })
    
    render(<SecuritySection {...defaultProps} />)
    
    // Open password form
    fireEvent.click(screen.getByTestId('change-password-button'))
    
    // Fill form with valid data
    fireEvent.change(screen.getByTestId('current-password-input'), {
      target: { value: 'oldPassword123' }
    })
    fireEvent.change(screen.getByTestId('new-password-input'), {
      target: { value: 'NewPassword123' }
    })
    fireEvent.change(screen.getByTestId('confirm-password-input'), {
      target: { value: 'NewPassword123' }
    })
    
    // Save password
    fireEvent.click(screen.getByTestId('save-password-button'))
    
    await waitFor(() => {
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'NewPassword123'
      })
    })
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Contraseña cambiada exitosamente. Por favor, inicia sesión nuevamente.'
      )
    })
    
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })

  it('shows export data button and handles click', () => {
    render(<SecuritySection {...defaultProps} />)
    
    expect(screen.getByText('Exportación de Datos')).toBeInTheDocument()
    expect(screen.getByText('Exportar Datos de Entrenamiento')).toBeInTheDocument()
    
    const exportButton = screen.getByTestId('export-data-button')
    expect(exportButton).toBeInTheDocument()
    expect(exportButton).toHaveTextContent('Exportar Datos')
  })

  it('updates privacy settings', () => {
    const mockUpdateTempFormData = jest.fn()
    
    render(<SecuritySection {...defaultProps} updateTempFormData={mockUpdateTempFormData} />)
    
    // Change data visibility
    const visibilitySelect = screen.getByTestId('data-visibility-select')
    fireEvent.change(visibilitySelect, { target: { value: 'public' } })
    
    expect(mockUpdateTempFormData).toHaveBeenCalledWith('privacy_dataVisibility', 'public')
  })

  it('shows account security information', () => {
    render(<SecuritySection {...defaultProps} />)
    
    expect(screen.getByText('Cuenta verificada')).toBeInTheDocument()
    expect(screen.getByText('Autenticación activa')).toBeInTheDocument()
    expect(screen.getByText('Datos encriptados')).toBeInTheDocument()
    expect(screen.getByText(mockUser.email!)).toBeInTheDocument()
  })

  it('shows danger zone with delete account option', () => {
    render(<SecuritySection {...defaultProps} />)
    
    expect(screen.getByText('Zona de Peligro')).toBeInTheDocument()
    expect(screen.getAllByText('Eliminar Cuenta')).toHaveLength(2) // Title and button
    
    const deleteButton = screen.getByTestId('delete-account-button')
    fireEvent.click(deleteButton)
    
    expect(mockAlert).toHaveBeenCalledWith(
      'Funcionalidad de eliminación de cuenta no implementada en el MVP'
    )
  })

  it('cancels password change form', () => {
    render(<SecuritySection {...defaultProps} />)
    
    // Open password form
    fireEvent.click(screen.getByTestId('change-password-button'))
    expect(screen.getByTestId('current-password-input')).toBeInTheDocument()
    
    // Cancel form
    fireEvent.click(screen.getByTestId('cancel-password-change'))
    expect(screen.queryByTestId('current-password-input')).not.toBeInTheDocument()
  })

  it('handles password change error', async () => {
    mockSupabase.auth.updateUser.mockResolvedValue({
      error: { message: 'Invalid login credentials' }
    })
    
    render(<SecuritySection {...defaultProps} />)
    
    // Open password form and fill with valid data
    fireEvent.click(screen.getByTestId('change-password-button'))
    fireEvent.change(screen.getByTestId('current-password-input'), {
      target: { value: 'wrongPassword' }
    })
    fireEvent.change(screen.getByTestId('new-password-input'), {
      target: { value: 'NewPassword123' }
    })
    fireEvent.change(screen.getByTestId('confirm-password-input'), {
      target: { value: 'NewPassword123' }
    })
    
    // Try to save
    fireEvent.click(screen.getByTestId('save-password-button'))
    
    await waitFor(() => {
      expect(screen.getByText('Contraseña actual incorrecta')).toBeInTheDocument()
    })
  })

  it('handles data export error', async () => {
    mockSupabase.from.mockImplementation(() => {
      const mockChain = {
        select: jest.fn(() => mockChain),
        eq: jest.fn(() => Promise.resolve({ data: null, error: new Error('Database error') })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }
      return mockChain
    })
    
    render(<SecuritySection {...defaultProps} />)
    
    const exportButton = screen.getByTestId('export-data-button')
    fireEvent.click(exportButton)
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Error al exportar los datos')
    })
  })
})