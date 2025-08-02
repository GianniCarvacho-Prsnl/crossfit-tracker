'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthComponentProps {
  mode?: 'login' | 'signup'
  onAuthChange?: (user: any) => void
}

export default function AuthComponent({ mode = 'login', onAuthChange }: AuthComponentProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState(mode)
  
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (currentMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`
          }
        })

        if (error) throw error

        if (data.user && !data.user.email_confirmed_at) {
          setMessage('Revisa tu email para confirmar tu cuenta antes de iniciar sesión.')
        } else if (data.user) {
          onAuthChange?.(data.user)
          router.push('/')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        if (data.user) {
          onAuthChange?.(data.user)
          router.push('/')
        }
      }
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Credenciales inválidas. Verifica tu email y contraseña.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Debes confirmar tu email antes de iniciar sesión.')
      } else {
        setError(error.message || 'Ocurrió un error. Intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      onAuthChange?.(null)
      router.push('/login')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen-safe flex items-center justify-center bg-gray-50 py-responsive px-responsive">
      <div className="max-w-md w-full space-y-responsive">
        <div className="text-center">
          <h2 className="text-responsive-3xl font-extrabold text-gray-900 mb-3">
            {currentMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-responsive-base text-gray-600">
            CrossFit Tracker - Registra tus récords personales
          </p>
        </div>
        
        <form className="space-y-responsive" onSubmit={handleAuth} data-testid="login-form">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-responsive-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-mobile w-full"
                placeholder="tu@email.com"
                data-testid="email-input"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-responsive-sm font-medium text-gray-900 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={currentMode === 'login' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-mobile w-full"
                placeholder="Contraseña"
                minLength={6}
                data-testid="password-input"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-responsive-sm" data-testid="error-message">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-responsive-sm" data-testid="success-message">
              {message}
            </div>
          )}

          {loading && (
            <div data-testid="loading" className="text-center">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full min-h-[48px] sm:min-h-[52px] text-responsive-base font-semibold"
              data-testid="login-button"
            >
              {loading ? 'Procesando...' : (currentMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setCurrentMode(currentMode === 'login' ? 'signup' : 'login')
                setError(null)
                setMessage(null)
              }}
              className="text-blue-600 hover:text-blue-500 text-responsive-sm font-medium min-h-touch py-2"
              data-testid="toggle-mode"
            >
              {currentMode === 'login' 
                ? '¿No tienes cuenta? Crear una nueva' 
                : '¿Ya tienes cuenta? Iniciar sesión'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}