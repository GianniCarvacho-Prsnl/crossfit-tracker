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