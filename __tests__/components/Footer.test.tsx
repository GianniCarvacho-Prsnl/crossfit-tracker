import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Footer from '../../components/Footer'
import { FeedbackProvider } from '../../components/feedback/FeedbackProvider'

// Mock FeedbackTrigger since we're testing Footer functionality
jest.mock('../../components/feedback/FeedbackTrigger', () => {
  return function MockFeedbackTrigger({ 
    variant, 
    children, 
    className 
  }: { 
    variant: string
    children: React.ReactNode
    className?: string 
  }) {
    return (
      <button 
        data-testid="feedback-trigger"
        data-variant={variant}
        className={className}
        onClick={() => {}}
      >
        {children}
      </button>
    )
  }
})

describe('Footer', () => {
  const renderFooter = (props = {}) => {
    return render(
      <FeedbackProvider>
        <Footer {...props} />
      </FeedbackProvider>
    )
  }

  it('renders footer with correct structure', () => {
    renderFooter()
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('sticky', 'bottom-0', 'bg-white', 'border-t', 'border-gray-200')
  })

  it('displays "Reportar un problema" link', () => {
    renderFooter()
    
    const link = screen.getByText('Reportar un problema')
    expect(link).toBeInTheDocument()
  })

  it('integrates FeedbackTrigger with footer variant', () => {
    renderFooter()
    
    const trigger = screen.getByTestId('feedback-trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('data-variant', 'footer')
  })

  it('applies custom className when provided', () => {
    const customClass = 'custom-footer-class'
    renderFooter({ className: customClass })
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass(customClass)
  })

  it('has proper semantic structure', () => {
    renderFooter()
    
    const footer = screen.getByRole('contentinfo')
    expect(footer.tagName).toBe('FOOTER')
  })

  it('centers the feedback link', () => {
    renderFooter()
    
    const footer = screen.getByRole('contentinfo')
    const container = footer.querySelector('div')
    expect(container).toHaveClass('flex', 'justify-center')
  })

  it('does not interfere with main content layout', () => {
    renderFooter()
    
    const footer = screen.getByRole('contentinfo')
    // Footer should be sticky at bottom, not affecting main content flow
    expect(footer).toHaveClass('sticky', 'bottom-0')
    expect(footer).not.toHaveClass('fixed') // Avoid fixed positioning that could interfere
  })
})