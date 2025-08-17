'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import UserSettingsMenu from '@/components/settings/UserSettingsMenu'

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])



  // Don't show navigation on login page
  if (pathname === '/login' || !user) {
    return null
  }

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/register', label: 'Registrar' },
    { href: '/records', label: 'Historial' },
    { href: '/percentages', label: 'Porcentajes' },
    { href: '/conversions', label: 'Conversiones' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-responsive">
        <div className="flex justify-between h-16 sm:h-18">
          <div className="flex items-center">
            <Link href="/" className="text-responsive-lg font-bold text-gray-900 truncate">
              CrossFit Tracker
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`min-h-touch px-4 py-2 text-responsive-sm font-medium rounded-lg transition-colors flex items-center ${
                  pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* User Settings Menu */}
            <UserSettingsMenu user={user} />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="min-h-touch min-w-touch inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              data-testid="menu-toggle"
            >
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white" data-testid="nav-menu">
          <div className="px-responsive py-4 space-y-2">
            {/* User Settings Menu for mobile */}
            <div className="px-4 py-3 border-b border-gray-100 mb-4">
              <UserSettingsMenu user={user} onClose={() => setIsMenuOpen(false)} />
            </div>
            
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`nav-link-mobile ${
                  pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}