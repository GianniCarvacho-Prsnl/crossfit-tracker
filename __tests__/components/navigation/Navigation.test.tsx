import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import Navigation from '@/components/navigation/Navigation'
import { FeedbackProvider } from '@/components/feedback/FeedbackProvider'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } }
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    }
  }))
}))

// Mock UserSettingsMenu component
jest.mock('@/components/settings/UserSettingsMenu', () => {
  return function MockUserSettingsMenu() {
    return <div data-testid="user-settings-menu">User Settings</div>
  }
})

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
}

const renderWithFeedbackProvider = (component: React.ReactElement) => {
  return render(
    <FeedbackProvider>
      {component}
    </FeedbackProvider>
  )
}

describe('Navigation', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(usePathname as jest.Mock).mockReturnValue('/')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Feedback Integration', () => {
    it('should display feedback option in desktop navigation', async () => {
      renderWithFeedbackProvider(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument()
      })

      // Check for feedback option in desktop navigation (only desktop is visible initially)
      const feedbackElements = screen.getAllByTestId('nav-feedback')
      expect(feedbackElements).toHaveLength(1) // Only desktop version visible initially
      
      // Check that feedback text is present
      expect(screen.getByText('Feedback')).toBeInTheDocument()
    })

    it('should display feedback option in mobile navigation menu', async () => {
      renderWithFeedbackProvider(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument()
      })

      // Open mobile menu
      const menuToggle = screen.getByTestId('menu-toggle')
      fireEvent.click(menuToggle)

      // Check that mobile menu is open
      await waitFor(() => {
        expect(screen.getByTestId('nav-menu')).toBeInTheDocument()
      })

      // Check for feedback option in mobile menu
      const mobileFeedbackElements = screen.getAllByTestId('nav-feedback')
      expect(mobileFeedbackElements).toHaveLength(2) // Desktop (hidden) and mobile (visible)
      
      // Check that feedback text is present in mobile menu
      expect(screen.getAllByText('Feedback')).toHaveLength(2)
    })

    it('should have proper accessibility attributes for feedback option', async () => {
      renderWithFeedbackProvider(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument()
      })

      // Check that feedback triggers have proper aria-label
      const feedbackButtons = screen.getAllByRole('button', { name: /abrir feedback/i })
      expect(feedbackButtons.length).toBeGreaterThan(0)
    })

    it('should close mobile menu when feedback option is clicked', async () => {
      renderWithFeedbackProvider(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument()
      })

      // Open mobile menu
      const menuToggle = screen.getByTestId('menu-toggle')
      fireEvent.click(menuToggle)

      await waitFor(() => {
        expect(screen.getByTestId('nav-menu')).toBeInTheDocument()
      })

      // Click feedback option in mobile menu
      const mobileFeedbackElements = screen.getAllByTestId('nav-feedback')
      const mobileFeedbackElement = mobileFeedbackElements.find(el => 
        el.closest('[data-testid="nav-menu"]')
      )
      
      if (mobileFeedbackElement) {
        fireEvent.click(mobileFeedbackElement)
        
        // Menu should close (nav-menu should not be in document)
        await waitFor(() => {
          expect(screen.queryByTestId('nav-menu')).not.toBeInTheDocument()
        })
      }
    })

    it('should display chat icon with feedback text', async () => {
      renderWithFeedbackProvider(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument()
      })

      // Check that SVG elements are present (chat icons)
      const svgElements = document.querySelectorAll('svg')
      expect(svgElements.length).toBeGreaterThan(0)
      
      // Check that feedback text is present
      expect(screen.getByText('Feedback')).toBeInTheDocument()
    })
  })

  describe('Navigation Consistency', () => {
    it('should maintain existing navigation items', async () => {
      renderWithFeedbackProvider(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument()
      })

      // Check that all existing nav items are still present
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Registrar')).toBeInTheDocument()
      expect(screen.getByText('Historial')).toBeInTheDocument()
      expect(screen.getByText('Porcentajes')).toBeInTheDocument()
      expect(screen.getByText('Conversiones')).toBeInTheDocument()
    })

    it('should maintain existing styling patterns', async () => {
      renderWithFeedbackProvider(<Navigation />)
      
      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument()
      })

      // Open mobile menu to check mobile styling
      const menuToggle = screen.getByTestId('menu-toggle')
      fireEvent.click(menuToggle)

      await waitFor(() => {
        expect(screen.getByTestId('nav-menu')).toBeInTheDocument()
      })

      // Check that feedback option has consistent styling with other nav items
      const feedbackElements = screen.getAllByTestId('nav-feedback')
      expect(feedbackElements.length).toBeGreaterThan(0)
      
      // Check that feedback buttons have proper styling
      const feedbackButtons = screen.getAllByRole('button', { name: /abrir feedback/i })
      feedbackButtons.forEach(button => {
        expect(button).toHaveClass('cursor-pointer', 'transition-colors')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle missing FeedbackProvider gracefully', () => {
      // This test ensures the component doesn't crash if FeedbackProvider is missing
      // In a real scenario, this would show an error, but we want to ensure it doesn't break the nav
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<Navigation />)
      }).not.toThrow()
      
      consoleSpy.mockRestore()
    })
  })
})