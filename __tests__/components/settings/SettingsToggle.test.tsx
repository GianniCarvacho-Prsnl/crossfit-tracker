import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsToggle from '@/components/settings/shared/SettingsToggle'

describe('SettingsToggle', () => {
  it('renders with label and calls onChange when clicked', () => {
    const mockOnChange = jest.fn()
    
    render(
      <SettingsToggle
        label="Test Toggle"
        checked={false}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('Test Toggle')).toBeInTheDocument()
    
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    
    fireEvent.click(toggle)
    expect(mockOnChange).toHaveBeenCalledWith(true)
  })

  it('renders with description', () => {
    const mockOnChange = jest.fn()
    
    render(
      <SettingsToggle
        label="Test Toggle"
        description="Test Description"
        checked={true}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('Test Description')).toBeInTheDocument()
    
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('is disabled when disabled prop is true', () => {
    const mockOnChange = jest.fn()
    
    render(
      <SettingsToggle
        label="Test Toggle"
        checked={false}
        onChange={mockOnChange}
        disabled={true}
      />
    )

    const toggle = screen.getByRole('switch')
    expect(toggle).toBeDisabled()
    
    fireEvent.click(toggle)
    expect(mockOnChange).not.toHaveBeenCalled()
  })
})