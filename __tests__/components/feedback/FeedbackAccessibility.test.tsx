import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FeedbackProvider, useFeedback } from '@/components/feedback/FeedbackProvider'
import FeedbackTrigger from '@/components/feedback/FeedbackTrigger'
import FeedbackModal from '@/components/feedback/FeedbackModal'

// Create a connected modal component for testing
function ConnectedFeedbackModal() {
  const { isModalOpen, closeModal } = useFeedback()
  return <FeedbackModal isOpen={isModalOpen} onClose={closeModal} />
}

describe('Feedback Accessibility Integration', () => {
  afterEach(() => {
    // Reset body overflow style after each test
    document.body.style.overflow = 'unset'
  })

  describe('Complete accessibility flow', () => {
    it('should provide complete keyboard navigation experience', async () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            Feedback
          </FeedbackTrigger>
          <ConnectedFeedbackModal />
        </FeedbackProvider>
      )

      const triggerButton = screen.getByLabelText('Abrir feedback')
      
      // Open modal with keyboard
      triggerButton.focus()
      expect(triggerButton).toHaveFocus()
      
      fireEvent.click(triggerButton)
      
      // Wait for modal to open and focus to be set
      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
      })

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Cerrar modal de feedback')
        expect(closeButton).toHaveFocus()
      }, { timeout: 200 })

      // Test ESC key closes modal
      fireEvent.keyDown(document, { key: 'Escape' })
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should maintain focus trap during form interaction', async () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="footer">
            Reportar problema
          </FeedbackTrigger>
          <ConnectedFeedbackModal />
        </FeedbackProvider>
      )

      const triggerButton = screen.getByLabelText('Reportar un problema')
      fireEvent.click(triggerButton)

      // Wait for modal to open
      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
      })

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Cerrar modal de feedback')
        expect(closeButton).toHaveFocus()
      }, { timeout: 200 })

      // Navigate to form fields
      const titleInput = screen.getByLabelText(/título/i)
      titleInput.focus()
      expect(titleInput).toHaveFocus()

      // Type in form field
      fireEvent.change(titleInput, { target: { value: 'Test accessibility' } })
      expect(titleInput).toHaveValue('Test accessibility')

      // Navigate to description
      const descriptionInput = screen.getByLabelText(/descripción/i)
      descriptionInput.focus()
      expect(descriptionInput).toHaveFocus()

      // Test focus trap - Tab from last element should go to first
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      cancelButton.focus()
      expect(cancelButton).toHaveFocus()

      fireEvent.keyDown(document, { key: 'Tab' })
      
      const closeButton = screen.getByLabelText('Cerrar modal de feedback')
      expect(closeButton).toHaveFocus()
    })

    it('should announce form validation errors to screen readers', async () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            Feedback
          </FeedbackTrigger>
          <ConnectedFeedbackModal />
        </FeedbackProvider>
      )

      const triggerButton = screen.getByLabelText('Abrir feedback')
      fireEvent.click(triggerButton)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
      })

      // Submit form without required field
      const form = screen.getByRole('form')
      fireEvent.submit(form)

      await waitFor(() => {
        const errorMessage = screen.getByText('El título es obligatorio')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveAttribute('role', 'alert')
        expect(errorMessage).toHaveAttribute('id', 'feedback-title-error')
      })

      // Verify ARIA attributes are updated
      const titleInput = screen.getByLabelText(/título/i)
      expect(titleInput).toHaveAttribute('aria-invalid', 'true')
      expect(titleInput).toHaveAttribute('aria-describedby', 'feedback-title-error')
    })

    it('should have proper ARIA landmark structure', async () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            Feedback
          </FeedbackTrigger>
          <ConnectedFeedbackModal />
        </FeedbackProvider>
      )

      const triggerButton = screen.getByLabelText('Abrir feedback')
      fireEvent.click(triggerButton)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveAttribute('aria-labelledby', 'feedback-modal-title')
        expect(dialog).toHaveAttribute('aria-describedby', 'feedback-modal-description')
      })

      // Verify form has proper role and description
      const form = screen.getByRole('form')
      expect(form).toHaveAttribute('aria-describedby', 'feedback-modal-description')

      // Verify title and description elements exist
      const title = screen.getByRole('heading', { name: 'Feedback' })
      expect(title).toHaveAttribute('id', 'feedback-modal-title')

      const description = screen.getByText(/esta es una versión de vista previa/i)
      expect(description.closest('div')).toHaveAttribute('id', 'feedback-modal-description')
    })

    it('should handle multiple trigger types with same accessibility standards', async () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            Menu Feedback
          </FeedbackTrigger>
          <FeedbackTrigger variant="footer">
            Footer Feedback
          </FeedbackTrigger>
          <ConnectedFeedbackModal />
        </FeedbackProvider>
      )

      // Test menu trigger
      const menuTrigger = screen.getByLabelText('Abrir feedback')
      fireEvent.click(menuTrigger)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
      })

      // Close modal
      fireEvent.keyDown(document, { key: 'Escape' })
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      // Test footer trigger
      const footerTrigger = screen.getByLabelText('Reportar un problema')
      fireEvent.click(footerTrigger)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
        // Same accessibility attributes should be present
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveAttribute('aria-labelledby', 'feedback-modal-title')
        expect(dialog).toHaveAttribute('aria-describedby', 'feedback-modal-description')
      })
    })

    it('should maintain accessibility during form state changes', async () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="menu">
            Feedback
          </FeedbackTrigger>
          <ConnectedFeedbackModal />
        </FeedbackProvider>
      )

      const triggerButton = screen.getByLabelText('Abrir feedback')
      fireEvent.click(triggerButton)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
      })

      const titleInput = screen.getByLabelText(/título/i)
      const descriptionInput = screen.getByLabelText(/descripción/i)

      // Initially no errors
      expect(titleInput).toHaveAttribute('aria-invalid', 'false')
      expect(titleInput).toHaveAttribute('aria-describedby', 'feedback-title-help')
      expect(descriptionInput).toHaveAttribute('aria-invalid', 'false')
      expect(descriptionInput).toHaveAttribute('aria-describedby', 'feedback-description-help')

      // Trigger validation error
      fireEvent.submit(screen.getByRole('form'))

      await waitFor(() => {
        expect(titleInput).toHaveAttribute('aria-invalid', 'true')
        expect(titleInput).toHaveAttribute('aria-describedby', 'feedback-title-error')
      })

      // Clear error by typing
      fireEvent.change(titleInput, { target: { value: 'Valid title' } })

      await waitFor(() => {
        expect(titleInput).toHaveAttribute('aria-invalid', 'false')
        expect(titleInput).toHaveAttribute('aria-describedby', 'feedback-title-help')
      })
    })
  })

  describe('Touch accessibility', () => {
    it('should have proper touch target sizes for mobile', async () => {
      render(
        <FeedbackProvider>
          <FeedbackTrigger variant="footer">
            Reportar problema
          </FeedbackTrigger>
          <ConnectedFeedbackModal />
        </FeedbackProvider>
      )

      const triggerButton = screen.getByLabelText('Reportar un problema')
      fireEvent.click(triggerButton)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
      })

      // Check all interactive elements have minimum touch target size
      const closeButton = screen.getByLabelText('Cerrar modal de feedback')
      const titleInput = screen.getByLabelText(/título/i)
      const submitButton = screen.getByRole('button', { name: /enviar feedback/i })
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })

      expect(closeButton).toHaveClass('min-w-[44px]', 'min-h-[44px]')
      expect(titleInput).toHaveClass('min-h-[44px]')
      expect(submitButton).toHaveClass('min-h-[44px]')
      expect(cancelButton).toHaveClass('min-h-[44px]')
    })
  })
})