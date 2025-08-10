import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { AppError, ErrorType } from '@/utils/errorHandling'
import type { UserPreferences, UpdateUserPreferences } from '@/types/database'

// Mock the UserPreferencesService
jest.mock('@/services/userPreferencesService', () => ({
  UserPreferencesService: {
    getOrCreateUserPreferences: jest.fn(),
    updateUserPreferences: jest.fn(),
    resetUserPreferences: jest.fn(),
  }
}))

import { UserPreferencesService } from '@/services/userPreferencesService'

const mockUserPreferencesService = UserPreferencesService as jest.Mocked<typeof UserPreferencesService>

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock matchMedia
const mockMatchMedia = jest.fn()
Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia,
  writable: true,
})

const mockPreferences: UserPreferences = {
  id: 'pref-1',
  user_id: 'user-1',
  preferred_units: 'metric',
  theme: 'light',
  language: 'es',
  notifications_enabled: true,
  workout_reminders: true,
  preferred_1rm_formula: 'epley',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

describe('useUserPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock matchMedia to return a basic implementation
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
    
    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      },
      writable: true,
    })
  })

  it('should initialize with loading state', () => {
    mockUserPreferencesService.getOrCreateUserPreferences.mockImplementation(() => new Promise(() => {}))
    
    const { result } = renderHook(() => useUserPreferences('user-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.preferences).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should fetch preferences successfully', async () => {
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(mockPreferences)

    const { result } = renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.preferences).toEqual(mockPreferences)
    expect(result.current.error).toBe(null)
    expect(mockUserPreferencesService.getOrCreateUserPreferences).toHaveBeenCalledWith('user-1')
  })

  it('should handle fetch preferences error', async () => {
    const error = new AppError('Preferences not found', ErrorType.DATABASE, 'Not found')
    mockUserPreferencesService.getOrCreateUserPreferences.mockRejectedValue(error)

    const { result } = renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.preferences).toBe(null)
    expect(result.current.error).toEqual(error)
  })

  it('should not fetch when userId is empty', () => {
    const { result } = renderHook(() => useUserPreferences(''))

    expect(result.current.loading).toBe(false)
    expect(mockUserPreferencesService.getOrCreateUserPreferences).not.toHaveBeenCalled()
  })

  it('should update preferences successfully', async () => {
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(mockPreferences)
    const updatedPreferences = { ...mockPreferences, preferred_units: 'imperial' as const }
    mockUserPreferencesService.updateUserPreferences.mockResolvedValue(updatedPreferences)

    const { result } = renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updates: UpdateUserPreferences = { preferred_units: 'imperial' }
    let updatedResult: UserPreferences | undefined

    await act(async () => {
      updatedResult = await result.current.updatePreferences(updates)
    })

    expect(updatedResult).toEqual(updatedPreferences)
    expect(result.current.preferences).toEqual(updatedPreferences)
    expect(mockUserPreferencesService.updateUserPreferences).toHaveBeenCalledWith('user-1', updates)
  })

  it('should apply theme changes when updating theme preference', async () => {
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(mockPreferences)
    const updatedPreferences = { ...mockPreferences, theme: 'dark' as const }
    mockUserPreferencesService.updateUserPreferences.mockResolvedValue(updatedPreferences)

    const { result } = renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updates: UpdateUserPreferences = { theme: 'dark' }

    await act(async () => {
      await result.current.updatePreferences(updates)
    })

    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark')
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('should handle system theme preference', async () => {
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(mockPreferences)
    const updatedPreferences = { ...mockPreferences, theme: 'system' as const }
    mockUserPreferencesService.updateUserPreferences.mockResolvedValue(updatedPreferences)

    // Mock system preference for dark mode
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })

    const { result } = renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updates: UpdateUserPreferences = { theme: 'system' }

    await act(async () => {
      await result.current.updatePreferences(updates)
    })

    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark')
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'system')
  })

  it('should handle update preferences error', async () => {
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(mockPreferences)
    const error = new AppError('Update failed', ErrorType.DATABASE, 'Database error')
    mockUserPreferencesService.updateUserPreferences.mockRejectedValue(error)

    const { result } = renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updates: UpdateUserPreferences = { preferred_units: 'imperial' }

    await act(async () => {
      await expect(result.current.updatePreferences(updates)).rejects.toEqual(error)
    })

    expect(result.current.error).toEqual(error)
  })

  it('should update single preference successfully', async () => {
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(mockPreferences)
    const updatedPreferences = { ...mockPreferences, notifications_enabled: false }
    mockUserPreferencesService.updateUserPreferences.mockResolvedValue(updatedPreferences)

    const { result } = renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let updatedResult: UserPreferences | undefined

    await act(async () => {
      updatedResult = await result.current.updateSinglePreference('notifications_enabled', false)
    })

    expect(updatedResult).toEqual(updatedPreferences)
    expect(result.current.preferences).toEqual(updatedPreferences)
    expect(mockUserPreferencesService.updateUserPreferences).toHaveBeenCalledWith('user-1', {
      notifications_enabled: false
    })
  })

  it('should reset preferences successfully', async () => {
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(mockPreferences)
    const resetPreferences = { 
      ...mockPreferences, 
      preferred_units: 'metric' as const,
      theme: 'system' as const,
      notifications_enabled: true 
    }
    mockUserPreferencesService.resetUserPreferences.mockResolvedValue(resetPreferences)

    const { result } = renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let resetResult: UserPreferences | undefined

    await act(async () => {
      resetResult = await result.current.resetPreferences()
    })

    expect(resetResult).toEqual(resetPreferences)
    expect(result.current.preferences).toEqual(resetPreferences)
    expect(mockUserPreferencesService.resetUserPreferences).toHaveBeenCalledWith('user-1')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'system')
  })

  it('should handle reset preferences error', async () => {
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(mockPreferences)
    const error = new AppError('Reset failed', ErrorType.DATABASE, 'Database error')
    mockUserPreferencesService.resetUserPreferences.mockRejectedValue(error)

    const { result } = renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await expect(result.current.resetPreferences()).rejects.toEqual(error)
    })

    expect(result.current.error).toEqual(error)
  })

  it('should refetch preferences data', async () => {
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(mockPreferences)

    const { result } = renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear the mock to verify refetch calls the service again
    mockUserPreferencesService.getOrCreateUserPreferences.mockClear()
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(mockPreferences)

    await act(async () => {
      await result.current.refetch()
    })

    expect(mockUserPreferencesService.getOrCreateUserPreferences).toHaveBeenCalledWith('user-1')
  })

  it('should listen for system theme changes when using system preference', async () => {
    const mockAddEventListener = jest.fn()
    const mockRemoveEventListener = jest.fn()
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    })

    const systemPreferences = { ...mockPreferences, theme: 'system' as const }
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(systemPreferences)

    const { unmount } = renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should apply theme on preferences load', async () => {
    const darkPreferences = { ...mockPreferences, theme: 'dark' as const }
    mockUserPreferencesService.getOrCreateUserPreferences.mockResolvedValue(darkPreferences)

    renderHook(() => useUserPreferences('user-1'))

    await waitFor(() => {
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })
  })
})