import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import FeedbackModal from '@/components/feedback/FeedbackModal'

// Mock alert for form submission tests
const mockAlert = jest.fn()
global.alert = mockAlert

describe('FeedbackModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockAlert.mockClear()
  })

  afterEach(() => {
    // Reset body overflow style after each test
    document.body.style.overflow = 'unset'
  })

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<FeedbackModal isOpen={false} onClose={mockOnClose} />)
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Feedback')).toBeInTheDocument()
    })

    it('should have proper ARIA attributes', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'feedback-modal-title')
    })

    it('should render close button with proper accessibility', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByLabelText('Cerrar modal de feedback')
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Close functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByLabelText('Cerrar modal de feedback')
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when overlay is clicked', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const overlay = screen.getByRole('dialog')
      fireEvent.click(overlay)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when modal content is clicked', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const modalContent = screen.getByText('Feedback')
      fireEvent.click(modalContent)
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should call onClose when Escape key is pressed', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      })
    })

    it('should not call onClose when other keys are pressed', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'Space' })
      
      await waitFor(() => {
        expect(mockOnClose).not.toHaveBeenCalled()
      })
    })
  })

  describe('Body scroll management', () => {
    it('should prevent body scroll when modal is open', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should restore body scroll when modal is closed', () => {
      const { rerender } = render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      expect(document.body.style.overflow).toBe('hidden')
      
      rerender(<FeedbackModal isOpen={false} onClose={mockOnClose} />)
      
      expect(document.body.style.overflow).toBe('unset')
    })

    it('should clean up event listeners when component unmounts', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
      
      const { unmount } = render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(document.body.style.overflow).toBe('unset')
      
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Event listener management', () => {
    it('should add event listener when modal opens', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
      
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      
      addEventListenerSpy.mockRestore()
    })

    it('should not add event listener when modal is closed', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
      
      render(<FeedbackModal isOpen={false} onClose={mockOnClose} />)
      
      expect(addEventListenerSpy).not.toHaveBeenCalled()
      
      addEventListenerSpy.mockRestore()
    })

    it('should update event listeners when isOpen prop changes', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
      
      const { rerender } = render(<FeedbackModal isOpen={false} onClose={mockOnClose} />)
      
      // Initially closed, no listeners
      expect(addEventListenerSpy).not.toHaveBeenCalled()
      
      // Open modal, should add listener
      rerender(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      
      // Close modal, should remove listener
      rerender(<FeedbackModal isOpen={false} onClose={mockOnClose} />)
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      
      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Form functionality', () => {
    it('should render form with all required fields', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      expect(screen.getByLabelText(/tipo de feedback/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /enviar feedback/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    })

    it('should show preview notice', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      expect(screen.getByText(/esta es una versión de vista previa/i)).toBeInTheDocument()
    })

    it('should have submit button disabled', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const submitButton = screen.getByRole('button', { name: /enviar feedback/i })
      expect(submitButton).toBeDisabled()
    })

    it('should reset form when modal opens', () => {
      const { rerender } = render(<FeedbackModal isOpen={false} onClose={mockOnClose} />)
      
      rerender(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const titleInput = screen.getByLabelText(/título/i) as HTMLInputElement
      const descriptionInput = screen.getByLabelText(/descripción/i) as HTMLTextAreaElement
      const typeSelect = screen.getByLabelText(/tipo de feedback/i) as HTMLSelectElement
      
      expect(titleInput.value).toBe('')
      expect(descriptionInput.value).toBe('')
      expect(typeSelect.value).toBe('bug')
    })
  })

  describe('Form validation', () => {
    it('should show error when title is empty and form is submitted', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const form = screen.getByRole('form')
      fireEvent.submit(form)
      
      await waitFor(() => {
        expect(screen.getByText('El título es obligatorio')).toBeInTheDocument()
      })
    })

    it('should show error when title exceeds 100 characters', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const titleInput = screen.getByLabelText(/título/i)
      const longTitle = 'a'.repeat(101)
      
      fireEvent.change(titleInput, { target: { value: longTitle } })
      fireEvent.submit(screen.getByRole('form'))
      
      await waitFor(() => {
        expect(screen.getByText('El título no puede exceder 100 caracteres')).toBeInTheDocument()
      })
    })

    it('should show error when description exceeds 500 characters', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const titleInput = screen.getByLabelText(/título/i)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      const longDescription = 'a'.repeat(501)
      
      fireEvent.change(titleInput, { target: { value: 'Valid title' } })
      fireEvent.change(descriptionInput, { target: { value: longDescription } })
      fireEvent.submit(screen.getByRole('form'))
      
      await waitFor(() => {
        expect(screen.getByText('La descripción no puede exceder 500 caracteres')).toBeInTheDocument()
      })
    })

    it('should clear error when user starts typing in title field', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      // Trigger validation error
      fireEvent.submit(screen.getByRole('form'))
      
      await waitFor(() => {
        expect(screen.getByText('El título es obligatorio')).toBeInTheDocument()
      })
      
      // Start typing to clear error
      const titleInput = screen.getByLabelText(/título/i)
      fireEvent.change(titleInput, { target: { value: 'New title' } })
      
      await waitFor(() => {
        expect(screen.queryByText('El título es obligatorio')).not.toBeInTheDocument()
      })
    })

    it('should show placeholder alert when valid form is submitted', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const titleInput = screen.getByLabelText(/título/i)
      fireEvent.change(titleInput, { target: { value: 'Valid title' } })
      
      fireEvent.submit(screen.getByRole('form'))
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Funcionalidad próximamente disponible. Esta es una versión de vista previa.')
      })
    })
  })

  describe('Form interactions', () => {
    it('should update form data when inputs change', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const titleInput = screen.getByLabelText(/título/i) as HTMLInputElement
      const descriptionInput = screen.getByLabelText(/descripción/i) as HTMLTextAreaElement
      const typeSelect = screen.getByLabelText(/tipo de feedback/i) as HTMLSelectElement
      
      fireEvent.change(titleInput, { target: { value: 'Test title' } })
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
      fireEvent.change(typeSelect, { target: { value: 'improvement' } })
      
      expect(titleInput.value).toBe('Test title')
      expect(descriptionInput.value).toBe('Test description')
      expect(typeSelect.value).toBe('improvement')
    })

    it('should show character count for title field', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const titleInput = screen.getByLabelText(/título/i)
      fireEvent.change(titleInput, { target: { value: 'Test' } })
      
      expect(screen.getByText('4/100 caracteres')).toBeInTheDocument()
    })

    it('should show character count for description field', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const descriptionInput = screen.getByLabelText(/descripción/i)
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
      
      expect(screen.getByText('16/500 caracteres')).toBeInTheDocument()
    })

    it('should close modal when cancel button is clicked', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      fireEvent.click(cancelButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on dialog', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'feedback-modal-title')
      expect(dialog).toHaveAttribute('aria-describedby', 'feedback-modal-description')
    })

    it('should have proper form labels and associations', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const titleInput = screen.getByLabelText(/título/i)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      const typeSelect = screen.getByLabelText(/tipo de feedback/i)
      
      expect(titleInput).toHaveAttribute('id', 'feedback-title')
      expect(descriptionInput).toHaveAttribute('id', 'feedback-description')
      expect(typeSelect).toHaveAttribute('id', 'feedback-type')
    })

    it('should have proper ARIA attributes on form fields', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const titleInput = screen.getByLabelText(/título/i)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      
      expect(titleInput).toHaveAttribute('aria-required', 'true')
      expect(titleInput).toHaveAttribute('required')
      expect(titleInput).toHaveAttribute('aria-invalid', 'false')
      expect(titleInput).toHaveAttribute('aria-describedby', 'feedback-title-help')
      
      expect(descriptionInput).toHaveAttribute('aria-invalid', 'false')
      expect(descriptionInput).toHaveAttribute('aria-describedby', 'feedback-description-help')
    })

    it('should update ARIA attributes when validation errors occur', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const titleInput = screen.getByLabelText(/título/i)
      const form = screen.getByRole('form')
      
      // Submit form to trigger validation
      fireEvent.submit(form)
      
      await waitFor(() => {
        expect(titleInput).toHaveAttribute('aria-invalid', 'true')
        expect(titleInput).toHaveAttribute('aria-describedby', 'feedback-title-error')
      })
    })

    it('should have error messages with role="alert"', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const form = screen.getByRole('form')
      fireEvent.submit(form)
      
      await waitFor(() => {
        const errorMessage = screen.getByText('El título es obligatorio')
        expect(errorMessage).toHaveAttribute('role', 'alert')
        expect(errorMessage).toHaveAttribute('id', 'feedback-title-error')
      })
    })

    it('should have proper close button accessibility', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByLabelText('Cerrar modal de feedback')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveClass('min-w-[44px]', 'min-h-[44px]')
    })

    it('should have minimum touch target sizes', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const titleInput = screen.getByLabelText(/título/i)
      const submitButton = screen.getByRole('button', { name: /enviar feedback/i })
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      
      expect(titleInput).toHaveClass('min-h-[44px]')
      expect(submitButton).toHaveClass('min-h-[44px]')
      expect(cancelButton).toHaveClass('min-h-[44px]')
    })

    it('should show required field indicator', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('should focus first focusable element when modal opens', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Cerrar modal de feedback')
        expect(closeButton).toHaveFocus()
      }, { timeout: 200 })
    })

    it('should trap focus within modal - Tab from last to first element', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      // Wait for initial focus
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Cerrar modal de feedback')
        expect(closeButton).toHaveFocus()
      }, { timeout: 200 })
      
      const closeButton = screen.getByLabelText('Cerrar modal de feedback')
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      
      // Focus the last element manually
      cancelButton.focus()
      expect(cancelButton).toHaveFocus()
      
      // Tab from last element should go to first (focus trap)
      fireEvent.keyDown(document, { key: 'Tab' })
      expect(closeButton).toHaveFocus()
    })

    it('should trap focus within modal - Shift+Tab from first to last element', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      // Wait for initial focus
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Cerrar modal de feedback')
        expect(closeButton).toHaveFocus()
      }, { timeout: 200 })
      
      const closeButton = screen.getByLabelText('Cerrar modal de feedback')
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      
      // Shift+Tab from first element should go to last (focus trap)
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
      expect(cancelButton).toHaveFocus()
    })

    it('should have proper tab order in form', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      // Wait for initial focus
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Cerrar modal de feedback')
        expect(closeButton).toHaveFocus()
      }, { timeout: 200 })
      
      // Get all focusable elements in expected order
      const closeButton = screen.getByLabelText('Cerrar modal de feedback')
      const typeSelect = screen.getByLabelText(/tipo de feedback/i)
      const titleInput = screen.getByLabelText(/título/i)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      const submitButton = screen.getByRole('button', { name: /enviar feedback/i })
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      
      // Verify elements are focusable and in correct order
      expect(closeButton).toBeInTheDocument()
      expect(typeSelect).toBeInTheDocument()
      expect(titleInput).toBeInTheDocument()
      expect(descriptionInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()
      
      // Test manual focus navigation
      typeSelect.focus()
      expect(typeSelect).toHaveFocus()
      
      titleInput.focus()
      expect(titleInput).toHaveFocus()
      
      descriptionInput.focus()
      expect(descriptionInput).toHaveFocus()
    })

    it('should handle keyboard navigation properly', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      // ESC should close modal
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not interfere with other keyboard events', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      // Other keys should not close modal
      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'Space' })
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should have proper form role and description', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const form = screen.getByRole('form')
      expect(form).toHaveAttribute('aria-describedby', 'feedback-modal-description')
      
      const description = screen.getByText(/esta es una versión de vista previa/i)
      expect(description.closest('div')).toHaveAttribute('id', 'feedback-modal-description')
    })
  })

  describe('Responsive design', () => {
    it('should have responsive modal container classes', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const modalContainer = screen.getByRole('dialog').firstChild as HTMLElement
      expect(modalContainer).toHaveClass('max-w-[95%]', 'sm:max-w-[80%]', 'md:max-w-md')
    })

    it('should have responsive padding classes', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const overlay = screen.getByRole('dialog')
      expect(overlay).toHaveClass('p-2', 'sm:p-4')
      
      const modalContent = screen.getByText('Feedback').closest('div')
      expect(modalContent).toHaveClass('p-4', 'sm:p-6')
    })

    it('should have responsive title classes', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const title = screen.getByText('Feedback')
      expect(title).toHaveClass('text-lg', 'sm:text-xl')
    })

    it('should have responsive close button positioning', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByLabelText('Cerrar modal de feedback')
      expect(closeButton).toHaveClass('top-3', 'right-3', 'sm:top-4', 'sm:right-4')
    })

    it('should have responsive button layout', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const buttonContainer = screen.getByRole('button', { name: /enviar feedback/i }).parentElement
      expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row')
    })
  })

  describe('Animations', () => {
    it('should have fade-in animation on overlay', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const overlay = screen.getByRole('dialog')
      expect(overlay).toHaveClass('animate-fade-in')
    })

    it('should have modal enter animation on container', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const modalContainer = screen.getByRole('dialog').firstChild as HTMLElement
      expect(modalContainer).toHaveClass('animate-modal-enter')
    })

    it('should have backdrop blur effect', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      
      const overlay = screen.getByRole('dialog')
      expect(overlay).toHaveClass('backdrop-blur-sm')
    })
  })
})