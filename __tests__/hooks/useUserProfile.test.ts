import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { AppError, ErrorType } from '@/utils/errorHandling'
import type { UserProfile, NewUserProfile, UpdateUserProfile } from '@/types/database'

// Mock the UserProfileService
jest.mock('@/services/userProfileService', () => ({
  UserProfileService: {
    getUserProfile: jest.fn(),
    createUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    uploadProfilePhoto: jest.fn(),
    deleteUserProfile: jest.fn(),
  }
}))

import { UserProfileService } from '@/services/userProfileService'

const mockUserProfileService = UserProfileService as jest.Mocked<typeof UserProfileService>

const mockProfile: UserProfile = {
  id: 'profile-1',
  user_id: 'user-1',
  display_name: 'Test User',
  profile_photo_url: 'https://example.com/photo.jpg',
  weight_kg: 70,
  height_cm: 175,
  gender: 'male',
  experience_level: 'intermediate',
  birth_date: '1990-01-01',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const mockNewProfile: NewUserProfile = {
  user_id: 'user-1',
  display_name: 'New User',
  weight_kg: 65,
  height_cm: 170,
  gender: 'female',
  experience_level: 'beginner'
}

describe('useUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    mockUserProfileService.getUserProfile.mockImplementation(() => new Promise(() => {}))
    
    const { result } = renderHook(() => useUserProfile('user-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.profile).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should fetch profile successfully', async () => {
    mockUserProfileService.getUserProfile.mockResolvedValue(mockProfile)

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.profile).toEqual(mockProfile)
    expect(result.current.error).toBe(null)
    expect(mockUserProfileService.getUserProfile).toHaveBeenCalledWith('user-1')
  })

  it('should handle fetch profile error', async () => {
    const error = new AppError('Profile not found', ErrorType.DATABASE, 'Not found')
    mockUserProfileService.getUserProfile.mockRejectedValue(error)

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.profile).toBe(null)
    expect(result.current.error).toEqual(error)
  })

  it('should not fetch when userId is empty', () => {
    const { result } = renderHook(() => useUserProfile(''))

    expect(result.current.loading).toBe(false)
    expect(mockUserProfileService.getUserProfile).not.toHaveBeenCalled()
  })

  it('should create profile successfully', async () => {
    mockUserProfileService.getUserProfile.mockResolvedValue(null)
    mockUserProfileService.createUserProfile.mockResolvedValue(mockProfile)

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let createdProfile: UserProfile | undefined
    await act(async () => {
      createdProfile = await result.current.createProfile(mockNewProfile)
    })

    expect(createdProfile).toEqual(mockProfile)
    expect(result.current.profile).toEqual(mockProfile)
    expect(result.current.error).toBe(null)
    expect(mockUserProfileService.createUserProfile).toHaveBeenCalledWith(mockNewProfile)
  })

  it('should handle create profile error', async () => {
    mockUserProfileService.getUserProfile.mockResolvedValue(null)
    const error = new AppError('Create failed', ErrorType.DATABASE, 'Database error')
    mockUserProfileService.createUserProfile.mockRejectedValue(error)

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await expect(result.current.createProfile(mockNewProfile)).rejects.toEqual(error)
    })

    expect(result.current.error).toEqual(error)
  })

  it('should update profile successfully', async () => {
    mockUserProfileService.getUserProfile.mockResolvedValue(mockProfile)
    const updatedProfile = { ...mockProfile, display_name: 'Updated User' }
    mockUserProfileService.updateUserProfile.mockResolvedValue(updatedProfile)

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updates: UpdateUserProfile = { display_name: 'Updated User' }
    let updatedResult: UserProfile | undefined

    await act(async () => {
      updatedResult = await result.current.updateProfile(updates)
    })

    expect(updatedResult).toEqual(updatedProfile)
    expect(result.current.profile).toEqual(updatedProfile)
    expect(mockUserProfileService.updateUserProfile).toHaveBeenCalledWith('user-1', updates)
  })

  it('should handle update profile error', async () => {
    mockUserProfileService.getUserProfile.mockResolvedValue(mockProfile)
    const error = new AppError('Update failed', ErrorType.DATABASE, 'Database error')
    mockUserProfileService.updateUserProfile.mockRejectedValue(error)

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updates: UpdateUserProfile = { display_name: 'Updated User' }

    await act(async () => {
      await expect(result.current.updateProfile(updates)).rejects.toEqual(error)
    })

    expect(result.current.error).toEqual(error)
  })

  it('should upload profile photo successfully', async () => {
    mockUserProfileService.getUserProfile.mockResolvedValue(mockProfile)
    mockUserProfileService.uploadProfilePhoto.mockResolvedValue('https://example.com/new-photo.jpg')
    const updatedProfile = { ...mockProfile, profile_photo_url: 'https://example.com/new-photo.jpg' }
    mockUserProfileService.updateUserProfile.mockResolvedValue(updatedProfile)

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    let photoUrl: string | undefined

    await act(async () => {
      photoUrl = await result.current.uploadProfilePhoto(file)
    })

    expect(photoUrl).toBe('https://example.com/new-photo.jpg')
    expect(mockUserProfileService.uploadProfilePhoto).toHaveBeenCalledWith('user-1', file)
    expect(mockUserProfileService.updateUserProfile).toHaveBeenCalledWith('user-1', {
      profile_photo_url: 'https://example.com/new-photo.jpg'
    })
  })

  it('should validate file type when uploading photo', async () => {
    mockUserProfileService.getUserProfile.mockResolvedValue(mockProfile)

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const file = new File(['test'], 'test.txt', { type: 'text/plain' })

    await act(async () => {
      await expect(result.current.uploadProfilePhoto(file)).rejects.toMatchObject({
        type: 'validation'
      })
    })
  })

  it('should validate file size when uploading photo', async () => {
    mockUserProfileService.getUserProfile.mockResolvedValue(mockProfile)

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Create a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

    await act(async () => {
      await expect(result.current.uploadProfilePhoto(largeFile)).rejects.toMatchObject({
        type: 'validation'
      })
    })
  })

  it('should delete profile successfully', async () => {
    mockUserProfileService.getUserProfile.mockResolvedValue(mockProfile)
    mockUserProfileService.deleteUserProfile.mockResolvedValue()

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteProfile()
    })

    expect(result.current.profile).toBe(null)
    expect(mockUserProfileService.deleteUserProfile).toHaveBeenCalledWith('user-1')
  })

  it('should handle delete profile error', async () => {
    mockUserProfileService.getUserProfile.mockResolvedValue(mockProfile)
    const error = new AppError('Delete failed', ErrorType.DATABASE, 'Database error')
    mockUserProfileService.deleteUserProfile.mockRejectedValue(error)

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await expect(result.current.deleteProfile()).rejects.toEqual(error)
    })

    expect(result.current.error).toEqual(error)
  })

  it('should refetch profile data', async () => {
    mockUserProfileService.getUserProfile.mockResolvedValue(mockProfile)

    const { result } = renderHook(() => useUserProfile('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear the mock to verify refetch calls the service again
    mockUserProfileService.getUserProfile.mockClear()
    mockUserProfileService.getUserProfile.mockResolvedValue(mockProfile)

    await act(async () => {
      await result.current.refetch()
    })

    expect(mockUserProfileService.getUserProfile).toHaveBeenCalledWith('user-1')
  })
})