import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import UserSettingsMenu from '@/components/settings/UserSettingsMenu'
import { createClient } from '@/utils/supabase/client'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

// Mock UserSettingsModal
jest.mock('@/components/settings/UserSettingsModal', () => {
  return function MockUserSettingsModal({ isOpen, onClose }: any) {
    return isOpen ? (
      <div data-testid="settings-modal">
        <button onClick={onClose} data-testid="modal-close">Close Modal</button>
      </div>
    ) : null
  }
})

const mockUser = {
  id: '123',
  email: 'test@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z',
}

const mockRouter = {
  push: jest.fn(),
}

const mockSupabase = {
  auth: {
    signOut: jest.fn(),
  },
}

describe('UserSettingsMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('renders user profile button with correct display name', () => {
    render(<UserSettingsMenu user={mockUser} />)
    
    expect(screen.getByTestId('user-settings-button')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument() // email prefix
  })

  it('opens dropdown menu when profile button is clicked', () => {
    render(<UserSettingsMenu user={mockUser} />)
    
    const profileButton = screen.getByTestId('user-settings-button')
    fireEvent.click(profileButton)
    
    expect(screen.getByText('Perfil')).toBeInTheDocument()
    expect(screen.getByText('Datos Personales')).toBeInTheDocument()
    expect(screen.getByText('Administrar Ejercicios')).toBeInTheDocument()
    expect(screen.getByText('Preferencias')).toBeInTheDocument()
    expect(screen.getByText('Seguridad')).toBeInTheDocument()
    expect(screen.getByText('Entrenamiento')).toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    render(<UserSettingsMenu user={mockUser} />)
    
    // Open dropdown
    const profileButton = screen.getByTestId('user-settings-button')
    fireEvent.click(profileButton)
    
    expect(screen.getByText('Perfil')).toBeInTheDocument()
    
    // Click outside
    fireEvent.mouseDown(document.body)
    
    await waitFor(() => {
      expect(screen.queryByText('Perfil')).not.toBeInTheDocument()
    })
  })

  it('closes dropdown when pressing Escape key', async () => {
    render(<UserSettingsMenu user={mockUser} />)
    
    // Open dropdown
    const profileButton = screen.getByTestId('user-settings-button')
    fireEvent.click(profileButton)
    
    expect(screen.getByText('Perfil')).toBeInTheDocument()
    
    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' })
    
    await waitFor(() => {
      expect(screen.queryByText('Perfil')).not.toBeInTheDocument()
    })
  })

  it('opens settings modal when menu item is clicked', () => {
    render(<UserSettingsMenu user={mockUser} />)
    
    // Open dropdown
    const profileButton = screen.getByTestId('user-settings-button')
    fireEvent.click(profileButton)
    
    // Click on Profile menu item
    const profileMenuItem = screen.getByTestId('settings-profile')
    fireEvent.click(profileMenuItem)
    
    // Modal should be open
    expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    
    // Dropdown should be closed
    expect(screen.queryByText('Foto y nombre de usuario')).not.toBeInTheDocument()
  })

  it('handles logout correctly', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({})
    
    render(<UserSettingsMenu user={mockUser} />)
    
    // Open dropdown
    const profileButton = screen.getByTestId('user-settings-button')
    fireEvent.click(profileButton)
    
    // Click logout
    const logoutButton = screen.getByTestId('logout-button')
    fireEvent.click(logoutButton)
    
    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })
  })

  it('calls onClose when modal is closed', () => {
    const mockOnClose = jest.fn()
    render(<UserSettingsMenu user={mockUser} onClose={mockOnClose} />)
    
    // Open dropdown and then modal
    const profileButton = screen.getByTestId('user-settings-button')
    fireEvent.click(profileButton)
    
    const profileMenuItem = screen.getByTestId('settings-profile')
    fireEvent.click(profileMenuItem)
    
    // Close modal
    const modalCloseButton = screen.getByTestId('modal-close')
    fireEvent.click(modalCloseButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows correct user email in dropdown header', () => {
    render(<UserSettingsMenu user={mockUser} />)
    
    const profileButton = screen.getByTestId('user-settings-button')
    fireEvent.click(profileButton)
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<UserSettingsMenu user={mockUser} />)
    
    const profileButton = screen.getByTestId('user-settings-button')
    
    expect(profileButton).toHaveAttribute('aria-expanded', 'false')
    expect(profileButton).toHaveAttribute('aria-haspopup', 'true')
    
    fireEvent.click(profileButton)
    
    expect(profileButton).toHaveAttribute('aria-expanded', 'true')
  })
})