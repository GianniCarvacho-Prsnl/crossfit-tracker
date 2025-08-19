import { createClient } from '@/utils/supabase/client'

export interface FeedbackData {
  type: 'bug' | 'improvement' | 'feature'
  title: string
  description: string
}

export interface FeedbackResult {
  success: boolean
  error?: string
  data?: any
}

export async function submitFeedback(data: FeedbackData): Promise<FeedbackResult> {
  try {
    const supabase = createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Debes iniciar sesión para enviar feedback' }
    }

    // Validar datos
    if (!data.description.trim()) {
      return { success: false, error: 'La descripción es requerida' }
    }

    // Insertar feedback
    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        type: data.type,
        title: data.title.trim(),
        description: data.description.trim()
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting feedback:', error)
      return { success: false, error: 'Error al enviar feedback. Inténtalo de nuevo.' }
    }

    return { success: true, data: feedback }
  } catch (error) {
    console.error('Unexpected error in submitFeedback:', error)
    return { success: false, error: 'Error inesperado. Inténtalo de nuevo.' }
  }
}