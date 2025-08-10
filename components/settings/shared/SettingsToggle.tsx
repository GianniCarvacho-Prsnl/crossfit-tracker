'use client'

import React from 'react'
import { SettingsToggleProps } from '@/types/settings'

const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  const toggleId = React.useId()
  const descriptionId = React.useId()

  const handleToggle = () => {
    if (!disabled) {
      const newState = !checked
      onChange(newState)
      
      // Announce state change to screen readers
      requestAnimationFrame(() => {
        const announcement = document.createElement('div')
        announcement.setAttribute('aria-live', 'polite')
        announcement.setAttribute('aria-atomic', 'true')
        announcement.className = 'sr-only'
        announcement.textContent = `${label} ${newState ? 'activado' : 'desactivado'}`
        document.body.appendChild(announcement)
        
        setTimeout(() => {
          if (document.body.contains(announcement)) {
            document.body.removeChild(announcement)
          }
        }, 1000)
      })
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1">
        <label 
          htmlFor={toggleId}
          className="text-sm font-medium text-gray-900 cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">
        <button
          id={toggleId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={toggleId}
          aria-describedby={description ? descriptionId : undefined}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${checked ? 'bg-blue-600' : 'bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="sr-only">
            {checked ? `Desactivar ${label}` : `Activar ${label}`}
          </span>
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${checked ? 'translate-x-6' : 'translate-x-1'}
            `}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  )
}

export default SettingsToggle