import { 
  UserProfile, 
  UserPreferences, 
  ExerciseGoals, 
  SettingsSection,
  SettingsCardProps,
  SettingsToggleProps,
  SettingsButtonProps
} from '@/types/settings'

describe('Settings Types', () => {
  it('should have correct UserProfile interface', () => {
    const userProfile: UserProfile = {
      id: '1',
      user_id: 'user-1',
      display_name: 'Test User',
      profile_photo_url: null,
      weight_kg: 80,
      height_cm: 180,
      gender: 'male',
      experience_level: 'intermediate',
      birth_date: '1990-01-01',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    expect(userProfile.id).toBe('1')
    expect(userProfile.gender).toBe('male')
    expect(userProfile.experience_level).toBe('intermediate')
  })

  it('should have correct UserPreferences interface', () => {
    const userPreferences: UserPreferences = {
      id: '1',
      user_id: 'user-1',
      preferred_units: 'metric',
      theme: 'dark',
      language: 'es',
      notifications_enabled: true,
      workout_reminders: false,
      preferred_1rm_formula: 'epley',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    expect(userPreferences.preferred_units).toBe('metric')
    expect(userPreferences.theme).toBe('dark')
    expect(userPreferences.preferred_1rm_formula).toBe('epley')
  })

  it('should have correct ExerciseGoals interface', () => {
    const exerciseGoals: ExerciseGoals = {
      id: '1',
      user_id: 'user-1',
      exercise_id: 1,
      target_1rm_lbs: 300,
      target_date: '2024-12-31',
      notes: 'Goal for end of year',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    expect(exerciseGoals.exercise_id).toBe(1)
    expect(exerciseGoals.target_1rm_lbs).toBe(300)
  })

  it('should have correct SettingsSection type', () => {
    const sections: SettingsSection[] = [
      'profile',
      'personal-data',
      'exercise-management',
      'app-preferences',
      'security',
      'training'
    ]

    expect(sections).toHaveLength(6)
    expect(sections).toContain('profile')
    expect(sections).toContain('training')
  })
})