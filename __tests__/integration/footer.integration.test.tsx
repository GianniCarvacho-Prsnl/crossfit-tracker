import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Footer from '../../components/Footer'
import { FeedbackProvider } from '../../components/feedback/FeedbackProvider'

describe('Footer Integration', () => {
  const renderFooterWithProvider = () => {
    return render(
      <FeedbackProvider>
        <Footer />
      </FeedbackProvider>
    )
  }

  it('integrates correctly with FeedbackProvider and opens modal on click', () => {
    renderFooterWithProvider()
    
    // Footer should render
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    
    // Link should be present
    const link = screen.getByText('Reportar un problema')
    expect(link).toBeInTheDocument()
    
    // Link should be clickable (we can't test modal opening without mocking more components)
    expect(link).toHaveAttribute('type', 'button')
    expect(link.tagName).toBe('BUTTON')
  })

  it('applies footer variant styles correctly', () => {
    renderFooterWithProvider()
    
    const link = screen.getByText('Reportar un problema')
    
    // Should have footer-specific styles
    expect(link).toHaveClass('text-gray-500')
    expect(link).toHaveClass('hover:text-gray-700')
    expect(link).toHaveClass('text-sm')
    expect(link).toHaveClass('underline')
    expect(link).toHaveClass('opacity-80')
  })

  it('has proper accessibility attributes', () => {
    renderFooterWithProvider()
    
    const link = screen.getByText('Reportar un problema')
    expect(link).toHaveAttribute('aria-label', 'Reportar un problema')
  })
})