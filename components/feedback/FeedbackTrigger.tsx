'use client'

import React from 'react'
import { useFeedback } from './FeedbackProvider'

interface FeedbackTriggerProps {
  variant: 'menu' | 'footer'
  children: React.ReactNode
  className?: string
}

export default function FeedbackTrigger({ 
  variant, 
  children, 
  className = '' 
}: FeedbackTriggerProps) {
  const { openModal } = useFeedback()

  const handleClick = () => {
    openModal()
  }

  // Base styles for both variants
  const baseStyles = 'cursor-pointer transition-colors duration-200'
  
  // Variant-specific styles
  const variantStyles = {
    menu: 'flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg',
    footer: 'text-gray-500 hover:text-gray-700 text-sm underline opacity-80 hover:opacity-100'
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`.trim()

  return (
    <button
      onClick={handleClick}
      className={combinedClassName}
      type="button"
      aria-label={variant === 'menu' ? 'Abrir feedback' : 'Reportar un problema'}
    >
      {children}
    </button>
  )
}