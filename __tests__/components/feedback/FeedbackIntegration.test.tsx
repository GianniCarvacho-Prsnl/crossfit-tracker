import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FeedbackProvider, useFeedback } from '@/components/feedback/FeedbackProvider'
import FeedbackTrigger from '@/components/feedback/FeedbackTrigger'
import FeedbackModal from '@/components/feedback/FeedbackModal'

// Create a connected modal component for testing
function ConnectedFeedbackModal() {
  const { isModalOpen, closeModal } = useFeedback()
  return <FeedbackModal isOpen={isModalOpen} onClose={closeModal} />
}

describe('Feedback Components Integration', () => {
  it('FeedbackTrigger opens FeedbackModal when clicked', () => {
    render(
      <FeedbackProvider>
        <FeedbackTrigger variant="menu">
          <span>Feedback</span>
        </FeedbackTrigger>
        <ConnectedFeedbackModal />
      </FeedbackProvider>
    )

    // Initially modal should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Click the trigger
    const trigger = screen.getByRole('button', { name: /abrir feedback/i })
    fireEvent.click(trigger)

    // Modal should now be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('📤 Enviar Feedback')).toBeInTheDocument()
  })

  it('Both menu and footer variants open the same modal', () => {
    render(
      <FeedbackProvider>
        <FeedbackTrigger variant="menu">
          <span>Menu Feedback</span>
        </FeedbackTrigger>
        <FeedbackTrigger variant="footer">
          <span>Footer Feedback</span>
        </FeedbackTrigger>
        <ConnectedFeedbackModal />
      </FeedbackProvider>
    )

    // Test menu trigger
    const menuTrigger = screen.getByRole('button', { name: /abrir feedback/i })
    fireEvent.click(menuTrigger)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Close modal
    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelButton)
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Test footer trigger
    const footerTrigger = screen.getByRole('button', { name: /reportar un problema/i })
    fireEvent.click(footerTrigger)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('Modal can be closed and trigger can reopen it', () => {
    render(
      <FeedbackProvider>
        <FeedbackTrigger variant="menu">
          <span>Feedback</span>
        </FeedbackTrigger>
        <ConnectedFeedbackModal />
      </FeedbackProvider>
    )

    const trigger = screen.getByRole('button', { name: /abrir feedback/i })

    // Open modal
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Close modal with cancel button
    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelButton)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Reopen modal
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})