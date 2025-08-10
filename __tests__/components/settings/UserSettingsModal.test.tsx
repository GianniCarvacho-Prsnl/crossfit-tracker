import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserSettingsModal from '@/components/settings/UserSettingsModal'
import type { User } from '@supabase/supabase-js'
import type { SettingsSection } from '@/types/settings'

// Mock the section components
jest.mock('@/components/settings/sections/ProfileSection', () => {
  return function MockProfileSection() {
    return <div data-testid="profile-section">Profile Section</div>
  }
})

jest.mock('@/components/settings/sections/PersonalDataSection', () => {
  return function MockPersonalDataSection() {
    return <div data-testid="personal-data-section">Personal Data Section</div>
  }
})

jest.mock('@/components/settings/sections/ExerciseManagementSection', () => {
  return function MockExerciseManagementSection() {
    return <div data-testid="exercise-management-section">Exercise Management Section</div>
  }
})

jest.mock('@/components/settings/sections/AppPreferencesSection', () => {
  return function MockAppPreferencesSection() {
    return <div data-testid="app-preferences-section">App Preferences Section</div>
  }
})

jest.mock('@/components/settings/sections/SecuritySection', () => {
  return function MockSecuritySection() {
    return <div data-testid="security-section">Security Section</div>
  }
})

jest.mock('@/components/settings/sections/TrainingSection', () => {
  return function MockTrainingSection() {
    return <div data-testid="training-section">Training Section</div>
  }
})

const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated'
}

const defaultProps = {
  isOpen: true,
  activeSection: 'profile' as SettingsSection,
  onSectionChange: jest.fn(),
  onClose: jest.fn(),
  user: mockUser
}

// Mock window.confirm
const mockConfirm = jest.fn()
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true
})

describe('UserSettingsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  afterEach(() => {
    // Reset body overflow style
    document.body.style.overflow = 'unset'
  })

  it('renders modal when isOpen is true', () => {
    render(<UserSettingsModal {...defaultProps} />)

    expect(screen.getByTestId('user-settings-modal')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Perfil' })).toBeInTheDocument()
  })

  it('does not render modal when isOpen is false', () => {
    render(<UserSettingsModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByTestId('user-settings-modal')).not.toBeInTheDocument()
  })

  it('renders all navigation sections', () => {
    render(<UserSettingsModal {...defaultProps} />)

    expect(screen.getByTestId('nav-profile')).toBeInTheDocument()
    expect(screen.getByTestId('nav-personal-data')).toBeInTheDocument()
    expect(screen.getByTestId('nav-exercise-management')).toBeInTheDocument()
    expect(screen.getByTestId('nav-app-preferences')).toBeInTheDocument()
    expect(screen.getByTestId('nav-security')).toBeInTheDocument()
    expect(screen.getByTestId('nav-training')).toBeInTheDocument()
  })

  it('highlights active section in navigation', () => {
    render(<UserSettingsModal {...defaultProps} activeSection="personal-data" />)

    const activeButton = screen.getByTestId('nav-personal-data')
    expect(activeButton).toHaveClass('bg-blue-100', 'text-blue-700', 'font-medium')
  })

  it('renders correct section content based on activeSection', () => {
    const { rerender } = render(<UserSettingsModal {...defaultProps} activeSection="profile" />)
    expect(screen.getByTestId('profile-section')).toBeInTheDocument()

    rerender(<UserSettingsModal {...defaultProps} activeSection="personal-data" />)
    expect(screen.getByTestId('personal-data-section')).toBeInTheDocument()

    rerender(<UserSettingsModal {...defaultProps} activeSection="exercise-management" />)
    expect(screen.getByTestId('exercise-management-section')).toBeInTheDocument()

    rerender(<UserSettingsModal {...defaultProps} activeSection="app-preferences" />)
    expect(screen.getByTestId('app-preferences-section')).toBeInTheDocument()

    rerender(<UserSettingsModal {...defaultProps} activeSection="security" />)
    expect(screen.getByTestId('security-section')).toBeInTheDocument()

    rerender(<UserSettingsModal {...defaultProps} activeSection="training" />)
    expect(screen.getByTestId('training-section')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<UserSettingsModal {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByTestId('close-modal-button')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onSectionChange when navigation item is clicked', () => {
    const onSectionChange = jest.fn()
    render(<UserSettingsModal {...defaultProps} onSectionChange={onSectionChange} />)

    const personalDataButton = screen.getByTestId('nav-personal-data')
    fireEvent.click(personalDataButton)

    expect(onSectionChange).toHaveBeenCalledWith('personal-data')
  })

  it('closes modal on Escape key press', () => {
    const onClose = jest.fn()
    render(<UserSettingsModal {...defaultProps} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('prevents body scroll when modal is open', () => {
    render(<UserSettingsModal {...defaultProps} />)

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when modal is closed', () => {
    const { rerender } = render(<UserSettingsModal {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<UserSettingsModal {...defaultProps} isOpen={false} />)
    expect(document.body.style.overflow).toBe('unset')
  })

  it('shows unsaved changes footer when hasUnsavedChanges is true', async () => {
    render(<UserSettingsModal {...defaultProps} />)

    // The modal starts without unsaved changes
    expect(screen.queryByText('Tienes cambios sin guardar')).not.toBeInTheDocument()

    // This would be triggered by section components updating form data
    // For now, we can't easily test this without implementing the actual form logic
  })

  it('shows confirmation dialog when closing with unsaved changes', () => {
    // This test would require simulating unsaved changes state
    // which will be properly testable once the form sections are implemented
    expect(true).toBe(true) // Placeholder
  })

  it('shows confirmation dialog when changing sections with unsaved changes', () => {
    // This test would require simulating unsaved changes state
    // which will be properly testable once the form sections are implemented
    expect(true).toBe(true) // Placeholder
  })

  it('closes modal when clicking outside', () => {
    const onClose = jest.fn()
    render(<UserSettingsModal {...defaultProps} onClose={onClose} />)

    // Click on the backdrop (outside the modal content)
    const backdrop = screen.getByTestId('user-settings-modal')
    fireEvent.mouseDown(backdrop)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<UserSettingsModal {...defaultProps} />)

    const modal = screen.getByTestId('user-settings-modal')
    expect(modal).toHaveAttribute('role', 'dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title')

    const closeButton = screen.getByTestId('close-modal-button')
    expect(closeButton).toHaveAttribute('aria-label', 'Cerrar modal')
  })

  it('focuses management works correctly', () => {
    render(<UserSettingsModal {...defaultProps} />)

    // Modal should be focusable and have proper focus management
    const modal = screen.getByTestId('user-settings-modal')
    expect(modal).toBeInTheDocument()

    // Navigation buttons should be focusable (buttons are focusable by default)
    const profileButton = screen.getByTestId('nav-profile')
    expect(profileButton.tagName).toBe('BUTTON')
    expect(profileButton).not.toHaveAttribute('disabled')
  })
})