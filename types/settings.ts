// Settings-related TypeScript interfaces

export interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  profile_photo_url: string | null
  weight_kg: number | null
  height_cm: number | null
  gender: 'male' | 'female' | 'other' | null
  experience_level: 'beginner' | 'intermediate' | 'advanced' | null
  birth_date: string | null
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  preferred_units: 'metric' | 'imperial'
  theme: 'light' | 'dark' | 'system'
  language: 'es' | 'en'
  notifications_enabled: boolean
  workout_reminders: boolean
  preferred_1rm_formula: 'epley' | 'brzycki' | 'lombardi'
  created_at: string
  updated_at: string
}

export interface ExerciseGoals {
  id: string
  user_id: string
  exercise_id: number
  target_1rm_lbs: number | null
  target_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Settings section types
export type SettingsSection = 
  | 'profile'
  | 'personal-data'
  | 'exercise-management'
  | 'app-preferences'
  | 'security'

// Component prop types
export interface SettingsCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export interface SettingsToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export interface SettingsButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: (event?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void
  disabled?: boolean
  loading?: boolean
  className?: string
  'data-testid'?: string
}