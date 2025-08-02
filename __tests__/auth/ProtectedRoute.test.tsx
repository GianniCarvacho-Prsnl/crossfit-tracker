/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
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
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
})

describe('ProtectedRoute Component', () => {
  it('should show loading spinner initially', () => {
    mockSupabase.auth.getUser.mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    )

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Check for loading spinner by class name since it doesn't have role="status"
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should render children when user is authenticated', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser }
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should redirect to login when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should show custom fallback during loading', () => {
    mockSupabase.auth.getUser.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const CustomFallback = () => <div>Custom Loading...</div>

    render(
      <ProtectedRoute fallback={<CustomFallback />}>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Custom Loading...')).toBeInTheDocument()
  })

  it('should handle auth state changes', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    let authCallback: (event: string, session: any) => void

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser }
    })

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    // Simulate sign out with act
    await act(async () => {
      authCallback!('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('should handle session updates', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    let authCallback: (event: string, session: any) => void

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Initially should redirect to login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    // Simulate sign in with act
    await act(async () => {
      authCallback!('SIGNED_IN', { user: mockUser })
    })

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('should unsubscribe from auth changes on unmount', async () => {
    const mockUnsubscribe = jest.fn()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: '123' } }
    })

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    })

    const { unmount } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})