import React from 'react'
import { render } from '@testing-library/react'

// Mock the components that use Supabase
jest.mock('@/components/settings/UserSettingsMenu', () => {
  return function MockUserSettingsMenu() {
    return <div data-testid="user-settings-menu">UserSettingsMenu</div>
  }
})

jest.mock('@/components/settings/UserSettingsModal', () => {
  return function MockUserSettingsModal() {
    return <div data-testid="user-settings-modal">UserSettingsModal</div>
  }
})

jest.mock('@/components/settings/sections/ProfileSection', () => {
  return function MockProfileSection() {
    return <div data-testid="profile-section">ProfileSection</div>
  }
})

jest.mock('@/components/settings/sections/PersonalDataSection', () => {
  return function MockPersonalDataSection() {
    return <div data-testid="personal-data-section">PersonalDataSection</div>
  }
})

jest.mock('@/components/settings/sections/ExerciseManagementSection', () => {
  return function MockExerciseManagementSection() {
    return <div data-testid="exercise-management-section">ExerciseManagementSection</div>
  }
})

jest.mock('@/components/settings/sections/AppPreferencesSection', () => {
  return function MockAppPreferencesSection() {
    return <div data-testid="app-preferences-section">AppPreferencesSection</div>
  }
})

jest.mock('@/components/settings/sections/SecuritySection', () => {
  return function MockSecuritySection() {
    return <div data-testid="security-section">SecuritySection</div>
  }
})

jest.mock('@/components/settings/sections/TrainingSection', () => {
  return function MockTrainingSection() {
    return <div data-testid="training-section">TrainingSection</div>
  }
})

import {
  SettingsCard,
  SettingsToggle,
  SettingsButton,
  UserSettingsMenu,
  UserSettingsModal,
  ProfileSection,
  PersonalDataSection,
  ExerciseManagementSection,
  AppPreferencesSection,
  SecuritySection,
  TrainingSection
} from '@/components/settings'

describe('Settings Components Index', () => {
  it('should export all shared components', () => {
    expect(SettingsCard).toBeDefined()
    expect(SettingsToggle).toBeDefined()
    expect(SettingsButton).toBeDefined()
  })

  it('should export main components', () => {
    expect(UserSettingsMenu).toBeDefined()
    expect(UserSettingsModal).toBeDefined()
  })

  it('should export all section components', () => {
    expect(ProfileSection).toBeDefined()
    expect(PersonalDataSection).toBeDefined()
    expect(ExerciseManagementSection).toBeDefined()
    expect(AppPreferencesSection).toBeDefined()
    expect(SecuritySection).toBeDefined()
    expect(TrainingSection).toBeDefined()
  })

  it('should render shared components without errors', () => {
    const mockOnChange = jest.fn()
    const mockOnClick = jest.fn()

    expect(() => {
      render(
        <SettingsCard title="Test">
          <div>Content</div>
        </SettingsCard>
      )
    }).not.toThrow()

    expect(() => {
      render(
        <SettingsToggle
          label="Test"
          checked={false}
          onChange={mockOnChange}
        />
      )
    }).not.toThrow()

    expect(() => {
      render(
        <SettingsButton onClick={mockOnClick}>
          Test
        </SettingsButton>
      )
    }).not.toThrow()
  })

  it('should render section components without errors', () => {
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

    expect(() => {
      render(<ProfileSection {...mockProps} />)
    }).not.toThrow()

    expect(() => {
      render(<PersonalDataSection {...mockProps} />)
    }).not.toThrow()

    expect(() => {
      render(<ExerciseManagementSection {...mockProps} />)
    }).not.toThrow()

    expect(() => {
      render(<AppPreferencesSection {...mockProps} />)
    }).not.toThrow()

    expect(() => {
      render(<SecuritySection {...mockProps} />)
    }).not.toThrow()

    expect(() => {
      render(<TrainingSection {...mockProps} />)
    }).not.toThrow()
  })
})