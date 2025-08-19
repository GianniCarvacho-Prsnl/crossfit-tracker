import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { FeedbackProvider } from '@/components/feedback/FeedbackProvider'
import FeedbackTrigger from '@/components/feedback/FeedbackTrigger'
import FeedbackModal from '@/components/feedback/FeedbackModal'

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
})

// Import the useFeedback hook
import { useFeedback } from '@/components/feedback/FeedbackProvider'

// Connected modal component
const ConnectedFeedbackModal = () => {
  const { isModalOpen, closeModal } = useFeedback()
  return <FeedbackModal isOpen={isModalOpen} onClose={closeModal} />
}

// Test component with modal
const ResponsiveTestApp = () => {
  return (
    <FeedbackProvider>
      <div>
        <FeedbackTrigger variant="menu">
          <span>Feedback</span>
        </FeedbackTrigger>
        <FeedbackTrigger variant="footer">
          <span>Reportar problema</span>
        </FeedbackTrigger>
        <ConnectedFeedbackModal />
      </div>
    </FeedbackProvider>
  )
}

describe('Feedback Responsive Integration', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(mockMatchMedia),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Mobile Viewport (< 640px)', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })
    })

    it('modal takes up most of screen on mobile', async () => {
      render(<ResponsiveTestApp />)

      const trigger = screen.getByRole('button', { name: /abrir feedback/i })
      await user.click(trigger)

      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()

      // Check mobile-specific classes are applied
      const modalContainer = modal.querySelector('[class*="max-w-"]')
      expect(modalContainer).toHaveClass('max-w-[95%]')
    })

    it('form elements are touch-friendly on mobile', async () => {
      render(<ResponsiveTestApp />)

      const trigger = screen.getByRole('button', { name: /abrir feedback/i })
      await user.click(trigger)

      // Check touch target sizes
      const titleInput = screen.getByLabelText(/título/i)
      const submitButton = screen.getByRole('button', { name: /enviar/i })
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })

      // Verify minimum touch target size (44px)
      expect(titleInput).toHaveClass('min-h-[44px]')
      expect(submitButton).toHaveClass('min-h-[44px]')
      expect(cancelButton).toHaveClass('min-h-[44px]')
    })

    it('handles mobile touch interactions', async () => {
      render(<ResponsiveTestApp />)

      const trigger = screen.getByRole('button', { name: /abrir feedback/i })
      
      // Simulate touch events
      fireEvent.touchStart(trigger)
      fireEvent.touchEnd(trigger)
      fireEvent.click(trigger)

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Test touch interaction with form elements
      const titleInput = screen.getByLabelText(/título/i)
      fireEvent.touchStart(titleInput)
      fireEvent.focus(titleInput)
      
      await user.type(titleInput, 'Mobile touch test')
      expect(titleInput).toHaveValue('Mobile touch test')
    })
  })

  describe('Tablet Viewport (640px - 1024px)', () => {
    beforeEach(() => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      })
    })

    it('modal has appropriate size on tablet', async () => {
      render(<ResponsiveTestApp />)

      const trigger = screen.getByRole('button', { name: /abrir feedback/i })
      await user.click(trigger)

      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()

      // Check tablet-specific responsive classes
      const modalContainer = modal.querySelector('[class*="max-w-"]')
      expect(modalContainer).toHaveClass('sm:max-w-[80%]')
    })
  })

  describe('Desktop Viewport (> 1024px)', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 900,
      })
    })

    it('modal has fixed max width on desktop', async () => {
      render(<ResponsiveTestApp />)

      const trigger = screen.getByRole('button', { name: /abrir feedback/i })
      await user.click(trigger)

      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()

      // Check desktop-specific responsive classes
      const modalContainer = modal.querySelector('[class*="max-w-"]')
      expect(modalContainer).toHaveClass('md:max-w-md')
    })

    it('supports keyboard navigation on desktop', async () => {
      render(<ResponsiveTestApp />)

      const trigger = screen.getByRole('button', { name: /abrir feedback/i })
      
      // Focus and activate with keyboard
      trigger.focus()
      await user.keyboard('{Enter}')

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Wait for focus to be set (modal has a timeout for focus management)
      await new Promise(resolve => setTimeout(resolve, 150))

      // Test tab navigation through form
      // First focusable element should be the close button
      const closeButton = screen.getByLabelText(/cerrar modal/i)
      expect(closeButton).toHaveFocus()

      await user.keyboard('{Tab}') // Move to next element
      const typeSelect = screen.getByLabelText(/tipo de feedback/i)
      expect(typeSelect).toHaveFocus()

      // Test ESC to close
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Viewport Change Handling', () => {
    it('adapts when viewport changes from mobile to desktop', async () => {
      // Start with mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<ResponsiveTestApp />)

      const trigger = screen.getByRole('button', { name: /abrir feedback/i })
      await user.click(trigger)

      let modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()

      // Simulate viewport change to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })

      // Trigger resize event
      fireEvent(window, new Event('resize'))

      // Modal should still be present and functional
      modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()

      // Should be able to interact with form
      const titleInput = screen.getByLabelText(/título/i)
      await user.type(titleInput, 'Responsive test')
      expect(titleInput).toHaveValue('Responsive test')
    })
  })

  describe('Orientation Change Handling', () => {
    it('handles orientation change on mobile devices', async () => {
      // Portrait mode
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })

      render(<ResponsiveTestApp />)

      const trigger = screen.getByRole('button', { name: /abrir feedback/i })
      await user.click(trigger)

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Simulate landscape mode
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375,
      })

      // Trigger orientation change
      fireEvent(window, new Event('orientationchange'))

      // Modal should still be functional
      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()

      // Form should still be usable
      const titleInput = screen.getByLabelText(/título/i)
      await user.type(titleInput, 'Orientation test')
      expect(titleInput).toHaveValue('Orientation test')
    })
  })
})