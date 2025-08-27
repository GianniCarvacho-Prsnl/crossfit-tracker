'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { SettingsSection } from '@/types/settings'

// Import lazy section loader
import LazySection from '@/utils/dynamicSettingsImports'

// Screen reader announcements utility
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement)
    }
  }, 1000)
}

interface UserSettingsModalProps {
  isOpen: boolean
  activeSection: SettingsSection
  onSectionChange: (section: SettingsSection) => void
  onClose: () => void
  user: User
}

interface SectionInfo {
  id: SettingsSection
  title: string
  icon: React.ReactNode
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  activeSection,
  onSectionChange,
  onClose,
  user
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [tempFormData, setTempFormData] = useState<Record<string, any>>({})
  const [focusedSectionIndex, setFocusedSectionIndex] = useState(-1)
  const [previousFocusElement, setPreviousFocusElement] = useState<HTMLElement | null>(null)

  // Section definitions
  const sections: SectionInfo[] = [
    {
      id: 'profile',
      title: 'Perfil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'personal-data',
      title: 'Datos Personales',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    // TODO: Temporarily hidden - restore when needed
    // {
    //   id: 'exercise-management',
    //   title: 'Administrar Ejercicios',
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    //     </svg>
    //   )
    // },
    // TODO: Temporarily hidden - restore when preferences functionality is implemented
    // {
    //   id: 'app-preferences',
    //   title: 'Preferencias',
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    //     </svg>
    //   )
    // },
    {
      id: 'security',
      title: 'Seguridad',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 'about',
      title: 'Acerca de',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  // Handle keyboard navigation and focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          handleClose()
          break
          
        case 'Tab':
          // Trap focus within modal
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as NodeListOf<HTMLElement>
          
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0]
            const lastElement = focusableElements[focusableElements.length - 1]
            
            if (event.shiftKey) {
              if (document.activeElement === firstElement) {
                event.preventDefault()
                lastElement.focus()
              }
            } else {
              if (document.activeElement === lastElement) {
                event.preventDefault()
                firstElement.focus()
              }
            }
          }
          break
          
        case 'ArrowUp':
        case 'ArrowDown':
          // Handle sidebar navigation
          if (document.activeElement?.closest('[role="navigation"]')) {
            event.preventDefault()
            const direction = event.key === 'ArrowDown' ? 1 : -1
            const newIndex = Math.max(0, Math.min(sections.length - 1, focusedSectionIndex + direction))
            setFocusedSectionIndex(newIndex)
            
            const sectionButton = sidebarRef.current?.querySelector(`[data-testid="nav-${sections[newIndex].id}"]`) as HTMLButtonElement
            sectionButton?.focus()
          }
          break
      }
    }

    if (isOpen) {
      // Store previous focus element
      setPreviousFocusElement(document.activeElement as HTMLElement)
      
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      
      // Focus the close button initially
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus()
        announceToScreenReader(`Modal de configuración abierto. Sección actual: ${sections.find(s => s.id === activeSection)?.title}`)
      })
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, focusedSectionIndex, activeSection])

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle modal close with unsaved changes check
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        '¿Estás seguro de que quieres cerrar? Los cambios no guardados se perderán.'
      )
      if (!confirmClose) return
    }
    
    // Clear temporary form data
    setTempFormData({})
    setHasUnsavedChanges(false)
    setFocusedSectionIndex(-1)
    
    // Restore focus to previous element
    requestAnimationFrame(() => {
      previousFocusElement?.focus()
    })
    
    announceToScreenReader('Modal de configuración cerrado')
    onClose()
  }

  // Handle section navigation
  const handleSectionChange = (section: SettingsSection, sectionTitle: string) => {
    if (hasUnsavedChanges) {
      const confirmNavigation = window.confirm(
        '¿Quieres cambiar de sección? Los cambios no guardados se perderán.'
      )
      if (!confirmNavigation) return
    }

    // Clear temporary form data when changing sections
    setTempFormData({})
    setHasUnsavedChanges(false)
    onSectionChange(section)
    
    // Update focused section index
    const sectionIndex = sections.findIndex(s => s.id === section)
    setFocusedSectionIndex(sectionIndex)
    
    announceToScreenReader(`Navegando a sección: ${sectionTitle}`)
  }

  // Update temporary form data
  const updateTempFormData = (key: string, value: any) => {
    setTempFormData(prev => ({
      ...prev,
      [key]: value
    }))
    setHasUnsavedChanges(true)
  }

  // Save temporary changes
  const saveTempChanges = () => {
    // This will be implemented by individual sections
    setHasUnsavedChanges(false)
    setTempFormData({})
  }

  // Discard temporary changes
  const discardTempChanges = () => {
    setTempFormData({})
    setHasUnsavedChanges(false)
  }

  // Get current section info
  const currentSection = sections.find(section => section.id === activeSection)

  // Render section content with lazy loading
  const renderSectionContent = () => {
    const sectionProps = {
      user,
      tempFormData,
      updateTempFormData,
      saveTempChanges,
      discardTempChanges,
      hasUnsavedChanges
    }

    return (
      <LazySection
        section={activeSection}
        props={sectionProps}
      />
    )
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-testid="user-settings-modal"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl transform transition-all"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {currentSection?.icon && (
                <div className="text-gray-600">
                  {currentSection.icon}
                </div>
              )}
              <h2 
                id="modal-title"
                className="text-xl font-semibold text-gray-900"
              >
                {currentSection?.title || 'Configuración'}
              </h2>
            </div>
            
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Cerrar modal de configuración"
              data-testid="close-modal-button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex flex-col sm:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full sm:w-64 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200">
              <nav 
                ref={sidebarRef}
                className="p-2 sm:p-4 space-x-2 sm:space-x-0 sm:space-y-1 flex sm:flex-col overflow-x-auto sm:overflow-x-visible" 
                role="navigation" 
                aria-label="Navegación de secciones de configuración"
              >
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id, section.title)}
                    className={`min-w-0 flex-shrink-0 sm:w-full flex flex-col sm:flex-row items-center sm:space-x-3 px-2 sm:px-3 py-2 text-center sm:text-left rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-800 font-medium'
                        : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    aria-current={activeSection === section.id ? 'page' : undefined}
                    aria-label={`${section.title}${activeSection === section.id ? ' (sección actual)' : ''}`}
                    data-testid={`nav-${section.id}`}
                  >
                    <div 
                      className={`flex-shrink-0 mb-1 sm:mb-0 ${activeSection === section.id ? 'text-blue-700' : 'text-gray-600'}`}
                      aria-hidden="true"
                    >
                      {section.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-medium leading-tight">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div 
              ref={contentRef}
              className="flex-1 p-4 sm:p-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto"
              role="main"
              aria-label={`Contenido de configuración: ${currentSection?.title}`}
              tabIndex={-1}
            >
              {renderSectionContent()}
            </div>
          </div>

          {/* Modal Footer - Show if there are unsaved changes */}
          {hasUnsavedChanges && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2 text-sm text-amber-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Tienes cambios sin guardar</span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={discardTempChanges}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="discard-changes-button"
                >
                  Descartar
                </button>
                <button
                  onClick={saveTempChanges}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="save-changes-button"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserSettingsModal