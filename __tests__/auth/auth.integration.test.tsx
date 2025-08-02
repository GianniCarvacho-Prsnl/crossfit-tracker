/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import AuthComponent from '@/components/auth/AuthComponent'
import { createClient } from '@/utils/supabase/client'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

const mockPush = jest.fn()
const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })),
    getUser: jest.fn(),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
})

describe('AuthComponent Integration Tests', () => {
  describe('Login Flow', () => {
    it('should successfully log in with valid credentials', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const onAuthChange = jest.fn()
      render(<AuthComponent mode="login" onAuthChange={onAuthChange} />)

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'password123' }
      })

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
        expect(onAuthChange).toHaveBeenCalledWith(mockUser)
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('should show error message for invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' }
      })

      render(<AuthComponent mode="login" />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'wrong@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'wrongpassword' }
      })

      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      await waitFor(() => {
        expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
      })
    })

    it('should show error for unconfirmed email', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email not confirmed' }
      })

      render(<AuthComponent mode="login" />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'unconfirmed@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      await waitFor(() => {
        expect(screen.getByText(/debes confirmar tu email/i)).toBeInTheDocument()
      })
    })
  })

  describe('Signup Flow', () => {
    it('should successfully sign up and show confirmation message', async () => {
      const mockUser = { 
        id: '123', 
        email: 'newuser@example.com',
        email_confirmed_at: null 
      }
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:3000' },
        writable: true
      })

      render(<AuthComponent mode="signup" />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'newuser@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'password123',
          options: {
            emailRedirectTo: 'http://localhost:3000/auth/confirm'
          }
        })
        expect(screen.getByText(/revisa tu email para confirmar/i)).toBeInTheDocument()
      })
    })

    it('should handle signup errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' }
      })

      render(<AuthComponent mode="signup" />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'existing@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

      await waitFor(() => {
        expect(screen.getByText(/user already registered/i)).toBeInTheDocument()
      })
    })
  })

  describe('Mode Switching', () => {
    it('should switch between login and signup modes', () => {
      render(<AuthComponent mode="login" />)

      expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()

      // Switch to signup
      fireEvent.click(screen.getByText(/¿no tienes cuenta\?/i))

      expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()

      // Switch back to login
      fireEvent.click(screen.getByText(/¿ya tienes cuenta\?/i))

      expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should require email and password fields', () => {
      render(<AuthComponent mode="login" />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)

      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('minLength', '6')
    })

    it('should have proper input types and autocomplete', () => {
      render(<AuthComponent mode="login" />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('autoComplete', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
    })
  })

  describe('Loading States', () => {
    it('should show loading state during authentication', async () => {
      // Mock a delayed response
      mockSupabase.auth.signInWithPassword.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { user: { id: '123' } },
          error: null
        }), 100))
      )

      render(<AuthComponent mode="login" />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

      // Should show loading state
      expect(screen.getByText(/procesando\.\.\./i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /procesando/i })).toBeDisabled()

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText(/procesando\.\.\./i)).not.toBeInTheDocument()
      })
    })
  })
})