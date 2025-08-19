import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import FeedbackTrigger from '@/components/feedback/FeedbackTrigger'
import { FeedbackProvider } from '@/components/feedback/FeedbackProvider'

// Mock the useFeedback hook
const mockOpenModal = jest.fn()

jest.mock('@/components/feedback/FeedbackProvider', () => ({
  ...jest.requireActual('@/components/feedback/FeedbackProvider'),
  useFeedback: () => ({
    isModalOpen: false,
    openModal: mockOpenModal,
    closeModal: jest.fn(),
  }),
}))

describe('FeedbackTrigger', () => {
  beforeEach(() => {
    mockOpenModal.mockClear()
  })

  describe('Menu variant', () => {
    it('renders with menu variant styles', () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            <span>Feedback</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      const button = screen.getByRole('button', { name: /abrir feedback/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('flex', 'items-center', 'space-x-3', 'px-4', 'py-3')
      expect(button).toHaveClass('text-gray-700', 'hover:bg-gray-100', 'hover:text-gray-900')
      expect(button).toHaveClass('rounded-lg')
    })

    it('renders children content for menu variant', () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            <span data-testid="menu-content">Feedback Menu Item</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      expect(screen.getByTestId('menu-content')).toBeInTheDocument()
      expect(screen.getByText('Feedback Menu Item')).toBeInTheDocument()
    })

    it('calls openModal when menu variant is clicked', () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            <span>Feedback</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      const button = screen.getByRole('button', { name: /abrir feedback/i })
      fireEvent.click(button)

      expect(mockOpenModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Footer variant', () => {
    it('renders with footer variant styles', () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="footer">
            <span>Reportar un problema</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      const button = screen.getByRole('button', { name: /reportar un problema/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('text-gray-500', 'hover:text-gray-700', 'text-sm')
      expect(button).toHaveClass('underline', 'opacity-80', 'hover:opacity-100')
    })

    it('renders children content for footer variant', () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="footer">
            <span data-testid="footer-content">Reportar problema</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      expect(screen.getByTestId('footer-content')).toBeInTheDocument()
      expect(screen.getByText('Reportar problema')).toBeInTheDocument()
    })

    it('calls openModal when footer variant is clicked', () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="footer">
            <span>Reportar un problema</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      const button = screen.getByRole('button', { name: /reportar un problema/i })
      fireEvent.click(button)

      expect(mockOpenModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Common functionality', () => {
    it('applies custom className when provided', () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu" className="custom-class">
            <span>Feedback</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      const button = screen.getByRole('button', { name: /abrir feedback/i })
      expect(button).toHaveClass('custom-class')
    })

    it('applies base styles to both variants', () => {
      const { rerender } = render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            <span>Menu</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      const menuButton = screen.getByRole('button', { name: /abrir feedback/i })
      expect(menuButton).toHaveClass('cursor-pointer', 'transition-colors', 'duration-200')

      rerender(
        <FeedbackProvider>
          <FeedbackTrigger variant="footer">
            <span>Footer</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      const footerButton = screen.getByRole('button', { name: /reportar un problema/i })
      expect(footerButton).toHaveClass('cursor-pointer', 'transition-colors', 'duration-200')
    })

    it('has correct button type', () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            <span>Feedback</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      const button = screen.getByRole('button', { name: /abrir feedback/i })
      expect(button).toHaveAttribute('type', 'button')
    })

    it('has appropriate aria-label for accessibility', () => {
      const { rerender } = render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            <span>Menu</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      expect(screen.getByLabelText('Abrir feedback')).toBeInTheDocument()

      rerender(
        <FeedbackProvider>
          <FeedbackTrigger variant="footer">
            <span>Footer</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      expect(screen.getByLabelText('Reportar un problema')).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('should be used within FeedbackProvider', () => {
      // This test verifies that the component works correctly when wrapped in provider
      // The actual error case is handled by the useFeedback hook itself
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            <span>Feedback</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      const button = screen.getByRole('button', { name: /abrir feedback/i })
      expect(button).toBeInTheDocument()
      
      // Verify it can call openModal without errors
      fireEvent.click(button)
      expect(mockOpenModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('Keyboard accessibility', () => {
    it('is focusable and accessible via keyboard', () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            <span>Feedback</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      const button = screen.getByRole('button', { name: /abrir feedback/i })
      
      // Verify button is focusable
      button.focus()
      expect(button).toHaveFocus()
      
      // Verify button can be activated (browsers handle Enter/Space automatically for buttons)
      fireEvent.click(button)
      expect(mockOpenModal).toHaveBeenCalledTimes(1)
    })

    it('maintains focus management for footer variant', () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="footer">
            <span>Reportar problema</span>
          </FeedbackTrigger>
        </FeedbackProvider>
      )

      const button = screen.getByRole('button', { name: /reportar un problema/i })
      
      // Verify button is focusable
      button.focus()
      expect(button).toHaveFocus()
      
      // Verify button functionality
      fireEvent.click(button)
      expect(mockOpenModal).toHaveBeenCalledTimes(1)
    })
  })
})