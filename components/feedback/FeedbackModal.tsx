'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { submitFeedback } from '@/services/feedbackService'
import type { User } from '@supabase/supabase-js'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

type FeedbackType = 'bug' | 'improvement' | 'feature'

interface FeedbackFormData {
  type: FeedbackType
  title: string
  description: string
}

interface FormErrors {
  title?: string
  description?: string
  general?: string
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'bug',
    title: '',
    description: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [user, setUser] = useState<User | null>(null)
  
  // New states for submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  
  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const lastFocusableRef = useRef<HTMLButtonElement>(null)

  // Get user and reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: 'bug',
        title: '',
        description: ''
      })
      setErrors({})
      setSubmitStatus('idle')
      setSubmitMessage('')
      
      // Get current user
      const getUser = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      }
      getUser()
    }
  }, [isOpen])

  // Focus management and keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    // Focus the first focusable element when modal opens
    const focusFirstElement = () => {
      if (firstFocusableRef.current) {
        firstFocusableRef.current.focus()
      }
    }

    // Set focus after a small delay to ensure modal is rendered
    const timeoutId = setTimeout(focusFirstElement, 100)

    // Handle keyboard navigation and focus trap
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap: handle Tab and Shift+Tab
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (event.shiftKey) {
          // Shift + Tab: if focused on first element, move to last
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab: if focused on last element, move to first
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle click outside modal to close
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio'
    } else if (formData.title.length > 100) {
      newErrors.title = 'El título no puede exceder 100 caracteres'
    }

    if (formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form input changes
  const handleInputChange = (field: keyof FeedbackFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle form submission with real backend integration
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    // Validate form first
    if (!validateForm()) {
      return
    }

    // Check if user is authenticated
    if (!user) {
      setSubmitStatus('error')
      setSubmitMessage('Debes iniciar sesión para enviar feedback')
      return
    }

    // Additional validation for description (required for backend)
    if (!formData.description.trim()) {
      setErrors(prev => ({ ...prev, description: 'La descripción es requerida' }))
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrors({})

    try {
      const result = await submitFeedback(formData)
      
      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage('¡Feedback enviado!')
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose()
          setSubmitStatus('idle')
          setSubmitMessage('')
          // Reset form
          setFormData({ type: 'bug', title: '', description: '' })
        }, 2000)
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error || 'Error al enviar feedback. Inténtalo de nuevo.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Error inesperado. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      aria-describedby="feedback-modal-description"
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-[95%] sm:max-w-[80%] md:max-w-md bg-white rounded-lg shadow-xl animate-modal-enter"
      >
        {/* Close button */}
        <button
          ref={firstFocusableRef}
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Cerrar modal de feedback"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal content */}
        <div className="p-4 sm:p-6">
          <h2 id="feedback-modal-title" className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 pr-8">
            Feedback
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4" role="form">
            {/* Feedback Type */}
            <div>
              <label htmlFor="feedback-type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de feedback
              </label>
              <select
                id="feedback-type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] ${
                  isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="bug">🐛 Reportar un error</option>
                <option value="improvement">💡 Sugerir mejora</option>
                <option value="feature">✨ Solicitar funcionalidad</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="feedback-title" className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                id="feedback-title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Resumen breve del problema o sugerencia"
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                maxLength={100}
                required
                aria-required="true"
                aria-invalid={errors.title ? 'true' : 'false'}
                aria-describedby={errors.title ? 'feedback-title-error' : 'feedback-title-help'}
              />
              {errors.title && (
                <p id="feedback-title-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.title}
                </p>
              )}
              <p id="feedback-title-help" className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 caracteres
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="feedback-description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="feedback-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe con más detalle tu feedback, pasos para reproducir el problema, o cualquier información adicional relevante..."
                rows={4}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                maxLength={500}
                aria-invalid={errors.description ? 'true' : 'false'}
                aria-describedby={errors.description ? 'feedback-description-error' : 'feedback-description-help'}
              />
              {errors.description && (
                <p id="feedback-description-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.description}
                </p>
              )}
              <p id="feedback-description-help" className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 caracteres
              </p>
            </div>

            {/* Status message */}
            {submitMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                submitStatus === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {submitMessage}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !user}
                className={`flex-1 px-4 py-2 rounded-md font-medium min-h-[44px] flex items-center justify-center transition-colors ${
                  isSubmitting || !user
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    ¡Enviado!
                  </>
                ) : submitStatus === 'error' ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Error
                  </>
                ) : !user ? (
                  'Inicia sesión para enviar'
                ) : (
                  'Enviar Feedback'
                )}
              </button>
              <button
                ref={lastFocusableRef}
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 rounded-md font-medium min-h-[44px] flex items-center justify-center transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}