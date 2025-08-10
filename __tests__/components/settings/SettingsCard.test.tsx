import React from 'react'
import { render, screen } from '@testing-library/react'
import SettingsCard from '@/components/settings/shared/SettingsCard'

describe('SettingsCard', () => {
  it('renders with title and description', () => {
    render(
      <SettingsCard title="Test Title" description="Test Description">
        <div>Test Content</div>
      </SettingsCard>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders without description', () => {
    render(
      <SettingsCard title="Test Title">
        <div>Test Content</div>
      </SettingsCard>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})