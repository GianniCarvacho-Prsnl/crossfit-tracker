import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsButton from '@/components/settings/shared/SettingsButton'

describe('SettingsButton', () => {
  it('renders with default props', () => {
    const mockOnClick = jest.fn()
    
    render(
      <SettingsButton onClick={mockOnClick}>
        Test Button
      </SettingsButton>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Test Button')
    
    fireEvent.click(button)
    expect(mockOnClick).toHaveBeenCalled()
  })

  it('renders with different variants', () => {
    render(
      <div>
        <SettingsButton variant="primary">Primary</SettingsButton>
        <SettingsButton variant="secondary">Secondary</SettingsButton>
        <SettingsButton variant="danger">Danger</SettingsButton>
      </div>
    )

    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('Danger')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    const mockOnClick = jest.fn()
    
    render(
      <SettingsButton onClick={mockOnClick} disabled={true}>
        Disabled Button
      </SettingsButton>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('shows loading state', () => {
    render(
      <SettingsButton loading={true}>
        Loading Button
      </SettingsButton>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button.querySelector('svg')).toBeInTheDocument() // Loading spinner
  })
})