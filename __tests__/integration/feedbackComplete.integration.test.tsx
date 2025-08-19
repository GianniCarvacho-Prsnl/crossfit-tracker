import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { FeedbackProvider } from '@/components/feedback/FeedbackProvider'
import FeedbackTrigger from '@/components/feedback/FeedbackTrigger'
import FeedbackModal from '@/components/feedback/FeedbackModal'
import Footer from '@/components/Footer'
import Navigation from '@/components/navigation/Navigation'

// Import the useFeedback hook
import { useFeedback } from '@/components/feedback/FeedbackProvider'

// Connected modal component
const ConnectedFeedbackModal = () => {
  const { isModalOpen, closeModal } = useFeedback()
  return <FeedbackModal isOpen={isModalOpen} onClose={closeModal} />
}

// Mock the complete feedback app with proper provider connection
const MockedFeedbackApp = () => {
  return (
    <div>
      {/* Simulate Navigation with feedback trigger */}
      <nav>
        <FeedbackTrigger variant="menu">
          <span>📤 Feedback</span>
        </FeedbackTrigger>
      </nav>
      
      {/* Simulate Footer with feedback trigger */}
      <footer>
        <FeedbackTrigger variant="footer">
          <span>Reportar un problema</span>
        </FeedbackTrigger>
      </footer>
      
      {/* Connected Modal */}
      <ConnectedFeedbackModal />
    </div>
  )
}

describe('Feedback Complete Integration Flow', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
  })

  describe('Complete Flow from Trigger to Modal Close', () => {
    it('completes full flow: menu trigger -> form interaction -> close', async () => {
      render(
        <FeedbackProvider>
          <MockedFeedbackApp />
        </FeedbackProvider>
      )

      // Step 1: Click menu trigger
      const menuTrigger = screen.getByRole('button', { name: /abrir feedback/i })
      await user.click(menuTrigger)

      // Step 2: Verify modal opens
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      expect(screen.getByText('📤 Enviar Feedback')).toBeInTheDocument()

      // Step 3: Interact with form
      const titleInput = screen.getByLabelText(/título/i)
      const descriptionTextarea = screen.getByLabelText(/descripción/i)
      const typeSelect = screen.getByLabelText(/tipo de feedback/i)

      await user.type(titleInput, 'Test feedback title')
      await user.selectOptions(typeSelect, 'bug')
      await user.type(descriptionTextarea, 'Test description')

      // Step 4: Verify form values
      expect(titleInput).toHaveValue('Test feedback title')
      expect(typeSelect).toHaveValue('bug')
      expect(descriptionTextarea.value).toContain('Test')

      // Step 5: Close modal with cancel button
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      // Step 6: Verify modal closes
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('completes full flow: footer trigger -> form interaction -> ESC close', async () => {
      render(
        <FeedbackProvider>
          <MockedFeedbackApp />
        </FeedbackProvider>
      )

      // Step 1: Click footer trigger
      const footerTrigger = screen.getByRole('button', { name: /reportar un problema/i })
      await user.click(footerTrigger)

      // Step 2: Verify modal opens
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Step 3: Fill form partially
      const titleInput = screen.getByLabelText(/título/i)
      await user.type(titleInput, 'Footer test')

      // Step 4: Close with ESC key
      await user.keyboard('{Escape}')

      // Step 5: Verify modal closes
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('completes full flow: trigger -> outside click close', async () => {
      render(
        <FeedbackProvider>
          <MockedFeedbackApp />
        </FeedbackProvider>
      )

      // Open modal
      const menuTrigger = screen.getByRole('button', { name: /abrir feedback/i })
      await user.click(menuTrigger)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Click outside modal (on overlay)
      const overlay = screen.getByRole('dialog')
      await user.click(overlay)

      // Verify modal closes
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('Both Triggers Open Same Modal', () => {
    it('validates both menu and footer triggers open identical modal', async () => {
      render(
        <FeedbackProvider>
          <MockedFeedbackApp />
        </FeedbackProvider>
      )

      // Test menu trigger
      const menuTrigger = screen.getByRole('button', { name: /abrir feedback/i })
      await user.click(menuTrigger)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Verify modal content
      expect(screen.getByText('📤 Enviar Feedback')).toBeInTheDocument()
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tipo de feedback/i)).toBeInTheDocument()

      // Close modal
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      // Test footer trigger
      const footerTrigger = screen.getByRole('button', { name: /reportar un problema/i })
      await user.click(footerTrigger)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Verify same modal content
      expect(screen.getByText('📤 Enviar Feedback')).toBeInTheDocument()
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tipo de feedback/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation Integration', () => {
    it('shows validation errors and prevents submission', async () => {
      render(
        <FeedbackProvider>
          <MockedFeedbackApp />
        </FeedbackProvider>
      )

      // Open modal
      const menuTrigger = screen.getByRole('button', { name: /abrir feedback/i })
      await user.click(menuTrigger)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Try to submit without required fields
      const submitButton = screen.getByRole('button', { name: /enviar/i })
      expect(submitButton).toBeDisabled()

      // Fill title to enable submit
      const titleInput = screen.getByLabelText(/título/i)
      await user.type(titleInput, 'Test title')

      // Submit button should still be disabled (placeholder functionality)
      expect(submitButton).toBeDisabled()

      // Verify placeholder message is shown
      expect(screen.getByText(/esta es una versión de vista previa/i)).toBeInTheDocument()
    })
  })

  describe('Multiple Modal Prevention', () => {
    it('prevents multiple modals from opening simultaneously', async () => {
      render(
        <FeedbackProvider>
          <MockedFeedbackApp />
        </FeedbackProvider>
      )

      // Open modal with menu trigger
      const menuTrigger = screen.getByRole('button', { name: /abrir feedback/i })
      await user.click(menuTrigger)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Try to open another modal with footer trigger
      const footerTrigger = screen.getByRole('button', { name: /reportar un problema/i })
      await user.click(footerTrigger)

      // Should still have only one modal
      const modals = screen.getAllByRole('dialog')
      expect(modals).toHaveLength(1)
    })
  })
})