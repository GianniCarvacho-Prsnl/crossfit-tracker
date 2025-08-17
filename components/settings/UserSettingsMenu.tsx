'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { SettingsSection } from '@/types/settings'
import { useUserProfile } from '@/hooks/useUserProfile'
import UserSettingsModal from './UserSettingsModal'

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

interface UserSettingsMenuProps {
  user: User
  onClose?: () => void
}

interface SettingsMenuItem {
  id: SettingsSection
  label: string
  description: string
  icon: React.ReactNode
}

const UserSettingsMenu: React.FC<UserSettingsMenuProps> = ({
  user,
  onClose
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const router = useRouter()
  const supabase = createClient()
  
  // Get user profile to access display name
  const { profile } = useUserProfile(user?.id)

  // Settings menu items
  const menuItems: SettingsMenuItem[] = [
    {
      id: 'profile',
      label: 'Perfil',
      description: 'Foto y nombre de usuario',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'personal-data',
      label: 'Datos Personales',
      description: 'Peso, altura y más',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    // TODO: Temporarily hidden - restore when needed
    // {
    //   id: 'exercise-management',
    //   label: 'Administrar Ejercicios',
    //   description: 'Gestionar ejercicios disponibles',
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    //     </svg>
    //   )
    // },
    {
      id: 'app-preferences',
      label: 'Preferencias',
      description: 'Unidades, tema e idioma',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'security',
      label: 'Seguridad',
      description: 'Contraseña y privacidad',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ]

  // Handle logout
  const handleLogout = async () => {
    announceToScreenReader('Cerrando sesión...')
    await supabase.auth.signOut()
    setIsDropdownOpen(false)
    router.push('/login')
  }

  // Handle menu item click
  const handleMenuItemClick = (sectionId: SettingsSection, itemLabel: string) => {
    setActiveSection(sectionId)
    setIsModalOpen(true)
    setIsDropdownOpen(false)
    setFocusedItemIndex(-1)
    announceToScreenReader(`Abriendo configuración de ${itemLabel}`)
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    // Return focus to the settings button
    buttonRef.current?.focus()
    onClose?.()
  }

  // Handle section change within modal
  const handleSectionChange = (section: SettingsSection) => {
    setActiveSection(section)
  }

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    const newState = !isDropdownOpen
    setIsDropdownOpen(newState)
    setFocusedItemIndex(-1)
    
    if (newState) {
      announceToScreenReader('Menú de configuración abierto. Usa las flechas para navegar.')
    } else {
      announceToScreenReader('Menú de configuración cerrado')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isDropdownOpen) return

      const totalItems = menuItems.length + 1 // +1 for logout button
      
      switch (event.key) {
        case 'Escape':
          setIsDropdownOpen(false)
          setFocusedItemIndex(-1)
          buttonRef.current?.focus()
          announceToScreenReader('Menú cerrado')
          break
          
        case 'ArrowDown':
          event.preventDefault()
          const nextIndex = focusedItemIndex < totalItems - 1 ? focusedItemIndex + 1 : 0
          setFocusedItemIndex(nextIndex)
          
          // Focus the appropriate element
          if (nextIndex < menuItems.length) {
            menuItemsRef.current[nextIndex]?.focus()
          } else {
            // Focus logout button
            const logoutButton = dropdownRef.current?.querySelector('[data-testid="logout-button"]') as HTMLButtonElement
            logoutButton?.focus()
          }
          break
          
        case 'ArrowUp':
          event.preventDefault()
          const prevIndex = focusedItemIndex > 0 ? focusedItemIndex - 1 : totalItems - 1
          setFocusedItemIndex(prevIndex)
          
          // Focus the appropriate element
          if (prevIndex < menuItems.length) {
            menuItemsRef.current[prevIndex]?.focus()
          } else {
            // Focus logout button
            const logoutButton = dropdownRef.current?.querySelector('[data-testid="logout-button"]') as HTMLButtonElement
            logoutButton?.focus()
          }
          break
          
        case 'Home':
          event.preventDefault()
          setFocusedItemIndex(0)
          menuItemsRef.current[0]?.focus()
          break
          
        case 'End':
          event.preventDefault()
          setFocusedItemIndex(totalItems - 1)
          const logoutButton = dropdownRef.current?.querySelector('[data-testid="logout-button"]') as HTMLButtonElement
          logoutButton?.focus()
          break
          
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedItemIndex >= 0 && focusedItemIndex < menuItems.length) {
            const item = menuItems[focusedItemIndex]
            handleMenuItemClick(item.id, item.label)
          } else if (focusedItemIndex === totalItems - 1) {
            handleLogout()
          }
          break
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen, focusedItemIndex, menuItems])

  // Get display name from profile, fallback to email username, then to 'Usuario'
  const displayName = profile?.display_name?.trim() || user?.email?.split('@')[0] || 'Usuario'

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* User Profile Button */}
        <button
          ref={buttonRef}
          onClick={handleDropdownToggle}
          className="min-h-touch flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
          aria-label={`Configuración de usuario para ${displayName}. ${isDropdownOpen ? 'Menú abierto' : 'Presiona Enter para abrir menú'}`}
          data-testid="user-settings-button"
        >
          {/* User Avatar */}
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          {/* User Name (hidden on mobile) */}
          <span className="hidden lg:inline text-responsive-sm font-medium">
            {displayName}
          </span>
          
          {/* Online indicator */}
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          
          {/* Dropdown arrow */}
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div 
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-slide-in-from-top"
            role="menu"
            aria-labelledby="user-settings-button"
            aria-orientation="vertical"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Settings Menu Items */}
            <div className="py-2" role="group" aria-label="Opciones de configuración">
              {menuItems.map((item, index) => (
                <button
                  key={item.id}
                  ref={(el) => { menuItemsRef.current[index] = el }}
                  onClick={() => handleMenuItemClick(item.id, item.label)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  role="menuitem"
                  aria-describedby={`settings-${item.id}-desc`}
                  data-testid={`settings-${item.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-400" aria-hidden="true">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p id={`settings-${item.id}-desc`} className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="border-t border-gray-100 pt-2" role="group" aria-label="Acciones de cuenta">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50 focus:ring-2 focus:ring-inset focus:ring-red-500"
                role="menuitem"
                aria-label="Cerrar sesión y salir de la aplicación"
                data-testid="logout-button"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium">Cerrar Sesión</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <UserSettingsModal
        isOpen={isModalOpen}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onClose={handleModalClose}
        user={user}
      />
    </>
  )
}

export default UserSettingsMenu