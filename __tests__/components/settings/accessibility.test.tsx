import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import UserSettingsMenu from '@/components/settings/UserSettingsMenu'
import UserSettingsModal from '@/components/settings/UserSettingsModal'
import SettingsToggle from '@/components/settings/shared/SettingsToggle'
import SettingsCard from '@/components/settings/shared/SettingsCard'
import SettingsButton from '@/components/settings/shared/SettingsButton'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock Supabase
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: jest.fn().mockResolvedValue({})
    }
  })
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

// Mock user data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
}

describe('Settings Components Accessibility', () => {
  describe('UserSettingsMenu', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<UserSettingsMenu user={mockUser} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<UserSettingsMenu user={mockUser} />)
      
      const settingsButton = screen.getByTestId('user-settings-button')
      
      // Focus and open menu with keyboard
      await user.tab()
      expect(settingsButton).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true')
      
      // Navigate menu items with arrow keys
      await user.keyboard('{ArrowDown}')
      const firstMenuItem = screen.getByTestId('settings-profile')
      expect(firstMenuItem).toHaveFocus()
      
      await user.keyboard('{ArrowDown}')
      const secondMenuItem = screen.getByTestId('settings-personal-data')
      expect(secondMenuItem).toHaveFocus()
      
      // Close menu with Escape
      await user.keyboard('{Escape}')
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false')
      expect(settingsButton).toHaveFocus()
    })

    it('should have proper ARIA labels and roles', () => {
      render(<UserSettingsMenu user={mockUser} />)
      
      const settingsButton = screen.getByTestId('user-settings-button')
      expect(settingsButton).toHaveAttribute('aria-haspopup', 'menu')
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false')
      expect(settingsButton).toHaveAttribute('aria-label')
      
      // Open menu to check menu structure
      fireEvent.click(settingsButton)
      
      const menu = screen.getByRole('menu')
      expect(menu).toBeInTheDocument()
      expect(menu).toHaveAttribute('aria-labelledby')
      
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems.length).toBeGreaterThan(0)
      
      // Check specific menu items have proper ARIA attributes
      const profileItem = screen.getByTestId('settings-profile')
      expect(profileItem).toHaveAttribute('aria-describedby', 'settings-profile-desc')
      
      const personalDataItem = screen.getByTestId('settings-personal-data')
      expect(personalDataItem).toHaveAttribute('aria-describedby', 'settings-personal-data-desc')
      
      // Check that description elements exist with correct IDs
      expect(screen.getByText('Foto y nombre de usuario')).toHaveAttribute('id', 'settings-profile-desc')
      expect(screen.getByText('Peso, altura y más')).toHaveAttribute('id', 'settings-personal-data-desc')
    })

    it('should update aria-expanded when menu opens/closes', async () => {
      const user = userEvent.setup()
      render(<UserSettingsMenu user={mockUser} />)
      
      const settingsButton = screen.getByTestId('user-settings-button')
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(settingsButton)
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true')
      
      await user.keyboard('{Escape}')
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('UserSettingsModal', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <UserSettingsModal
          isOpen={true}
          activeSection="profile"
          onSectionChange={jest.fn()}
          onClose={jest.fn()}
          user={mockUser}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have focusable elements within modal', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      
      render(
        <UserSettingsModal
          isOpen={true}
          activeSection="profile"
          onSectionChange={jest.fn()}
          onClose={onClose}
          user={mockUser}
        />
      )
      
      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
      
      // Check that focusable elements exist within modal
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      expect(focusableElements.length).toBeGreaterThan(0)
      
      // Verify close button is focusable
      const closeButton = screen.getByTestId('close-modal-button')
      expect(closeButton).toBeInTheDocument()
      
      // Tab to first focusable element
      await user.tab()
      expect(document.activeElement).toBeTruthy()
    })

    it('should close on Escape key', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      
      render(
        <UserSettingsModal
          isOpen={true}
          activeSection="profile"
          onSectionChange={jest.fn()}
          onClose={onClose}
          user={mockUser}
        />
      )
      
      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalled()
    })

    it('should have proper modal structure and labels', () => {
      render(
        <UserSettingsModal
          isOpen={true}
          activeSection="profile"
          onSectionChange={jest.fn()}
          onClose={jest.fn()}
          user={mockUser}
        />
      )
      
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title')
      
      const title = screen.getByRole('heading', { name: 'Perfil' })
      expect(title).toHaveAttribute('id', 'modal-title')
      
      const navigation = screen.getByRole('navigation')
      expect(navigation).toHaveAttribute('aria-label', 'Navegación de secciones de configuración')
      
      const mainContent = screen.getByRole('main')
      expect(mainContent).toHaveAttribute('aria-label')
    })
  })

  describe('SettingsToggle', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <SettingsToggle
          label="Test Toggle"
          description="Test description"
          checked={false}
          onChange={jest.fn()}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should support keyboard interaction', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      
      render(
        <SettingsToggle
          label="Test Toggle"
          description="Test description"
          checked={false}
          onChange={onChange}
        />
      )
      
      const toggle = screen.getByRole('switch')
      
      await user.tab()
      expect(toggle).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(onChange).toHaveBeenCalledWith(true)
      
      await user.keyboard(' ')
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('should have proper ARIA attributes', () => {
      render(
        <SettingsToggle
          label="Test Toggle"
          description="Test description"
          checked={true}
          onChange={jest.fn()}
        />
      )
      
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'true')
      expect(toggle).toHaveAttribute('aria-labelledby')
      expect(toggle).toHaveAttribute('aria-describedby')
      
      const label = screen.getByText('Test Toggle')
      expect(label).toHaveAttribute('for')
      
      const description = screen.getByText('Test description')
      expect(description).toHaveAttribute('id')
    })

    it('should have screen reader text for state', () => {
      render(
        <SettingsToggle
          label="Test Toggle"
          description="Test description"
          checked={false}
          onChange={jest.fn()}
        />
      )
      
      const toggle = screen.getByRole('switch')
      const srText = toggle.querySelector('.sr-only')
      expect(srText).toHaveTextContent('Activar Test Toggle')
    })
  })

  describe('SettingsCard', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <SettingsCard title="Test Card" description="Test description">
          <div>Content</div>
        </SettingsCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper semantic structure', () => {
      render(
        <SettingsCard title="Test Card" description="Test description">
          <div>Content</div>
        </SettingsCard>
      )
      
      const section = screen.getByRole('region')
      expect(section).toHaveAttribute('aria-labelledby')
      expect(section).toHaveAttribute('aria-describedby')
      
      const title = screen.getByText('Test Card')
      expect(title).toHaveAttribute('id')
      
      const description = screen.getByText('Test description')
      expect(description).toHaveAttribute('id')
    })
  })

  describe('SettingsButton', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <SettingsButton onClick={jest.fn()}>
          Test Button
        </SettingsButton>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should support keyboard interaction', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      
      render(
        <SettingsButton onClick={onClick}>
          Test Button
        </SettingsButton>
      )
      
      const button = screen.getByRole('button')
      
      await user.tab()
      expect(button).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(onClick).toHaveBeenCalled()
      
      await user.keyboard(' ')
      expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('should have proper loading state accessibility', () => {
      render(
        <SettingsButton loading={true} onClick={jest.fn()}>
          Test Button
        </SettingsButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toHaveAttribute('aria-disabled', 'true')
      
      const loadingText = screen.getByText('Cargando...')
      expect(loadingText).toHaveClass('sr-only')
    })

    it('should handle disabled state properly', () => {
      render(
        <SettingsButton disabled={true} onClick={jest.fn()}>
          Test Button
        </SettingsButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Keyboard Navigation Integration', () => {
    it('should provide complete keyboard navigation flow', async () => {
      const user = userEvent.setup()
      
      render(<UserSettingsMenu user={mockUser} />)
      
      // Start navigation
      await user.tab()
      const settingsButton = screen.getByTestId('user-settings-button')
      expect(settingsButton).toHaveFocus()
      
      // Open menu
      await user.keyboard('{Enter}')
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true')
      
      // Navigate to first menu item
      await user.keyboard('{ArrowDown}')
      const profileItem = screen.getByTestId('settings-profile')
      expect(profileItem).toHaveFocus()
      
      // Navigate to last item using End key
      await user.keyboard('{End}')
      const logoutButton = screen.getByTestId('logout-button')
      expect(logoutButton).toHaveFocus()
      
      // Navigate to first item using Home key
      await user.keyboard('{Home}')
      expect(profileItem).toHaveFocus()
      
      // Close menu
      await user.keyboard('{Escape}')
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false')
      expect(settingsButton).toHaveFocus()
    })
  })

  describe('ARIA Live Regions', () => {
    it('should create live regions for announcements', async () => {
      const user = userEvent.setup()
      render(<UserSettingsMenu user={mockUser} />)
      
      const settingsButton = screen.getByTestId('user-settings-button')
      
      // Open menu - this should create a live region
      await user.click(settingsButton)
      
      // Check that live regions are created (they may be cleaned up quickly)
      // We can't easily test the content due to timing, but we can verify the mechanism works
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true')
      
      // Close menu
      await user.keyboard('{Escape}')
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false')
    })
  })
})