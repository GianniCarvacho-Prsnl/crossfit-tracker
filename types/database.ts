// Database types generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      workout_records: {
        Row: {
          id: string
          user_id: string
          exercise_id: number
          weight_lbs: number
          repetitions: number
          calculated_1rm: number
          is_calculated: boolean
          original_unit: 'lbs' | 'kg'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: number
          weight_lbs: number
          repetitions: number
          calculated_1rm: number
          is_calculated?: boolean
          original_unit: 'lbs' | 'kg'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: number
          weight_lbs?: number
          repetitions?: number
          calculated_1rm?: number
          is_calculated?: boolean
          original_unit?: 'lbs' | 'kg'
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          profile_photo_url?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          gender?: 'male' | 'female' | 'other' | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | null
          birth_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          profile_photo_url?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          gender?: 'male' | 'female' | 'other' | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | null
          birth_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          preferred_units?: 'metric' | 'imperial'
          theme?: 'light' | 'dark' | 'system'
          language?: 'es' | 'en'
          notifications_enabled?: boolean
          workout_reminders?: boolean
          preferred_1rm_formula?: 'epley' | 'brzycki' | 'lombardi'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferred_units?: 'metric' | 'imperial'
          theme?: 'light' | 'dark' | 'system'
          language?: 'es' | 'en'
          notifications_enabled?: boolean
          workout_reminders?: boolean
          preferred_1rm_formula?: 'epley' | 'brzycki' | 'lombardi'
          created_at?: string
          updated_at?: string
        }
      }
      exercise_goals: {
        Row: {
          id: string
          user_id: string
          exercise_id: number
          target_1rm_lbs: number | null
          target_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: number
          target_1rm_lbs?: number | null
          target_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: number
          target_1rm_lbs?: number | null
          target_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Exercise = Database['public']['Tables']['exercises']['Row']
export type WorkoutRecord = Database['public']['Tables']['workout_records']['Row']
export type NewWorkoutRecord = Database['public']['Tables']['workout_records']['Insert']
export type UpdateWorkoutRecord = Database['public']['Tables']['workout_records']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type NewUserProfile = Database['public']['Tables']['user_profiles']['Insert']
export type UpdateUserProfile = Database['public']['Tables']['user_profiles']['Update']

export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type NewUserPreferences = Database['public']['Tables']['user_preferences']['Insert']
export type UpdateUserPreferences = Database['public']['Tables']['user_preferences']['Update']

export type ExerciseGoals = Database['public']['Tables']['exercise_goals']['Row']
export type NewExerciseGoals = Database['public']['Tables']['exercise_goals']['Insert']
export type UpdateExerciseGoals = Database['public']['Tables']['exercise_goals']['Update']