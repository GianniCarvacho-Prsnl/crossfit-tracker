describe('User Settings Accessibility', () => {
  const testEmail = Cypress.env('TEST_EMAIL')
  const testPassword = Cypress.env('TEST_PASSWORD')

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.login(testEmail, testPassword)
    cy.injectAxe() // Inject axe-core for accessibility testing
  })

  it('should meet WCAG 2.1 AA standards for user settings menu', () => {
    // Test main navigation accessibility
    cy.get('[data-testid="user-profile-button"]').should('have.attr', 'aria-label')
    cy.get('[data-testid="user-profile-button"]').should('have.attr', 'role', 'button')
    
    // Open settings menu
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="user-settings-menu"]').should('have.attr', 'role', 'menu')
    
    // Check menu items have proper ARIA attributes
    cy.get('[data-testid="settings-profile"]').should('have.attr', 'role', 'menuitem')
    cy.get('[data-testid="settings-profile"]').should('have.attr', 'aria-label')
    
    // Run axe accessibility check on menu
    cy.checkA11y('[data-testid="user-settings-menu"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true }
      }
    })
  })

  it('should have proper keyboard navigation throughout settings', () => {
    // Test keyboard access to settings
    cy.get('[data-testid="user-profile-button"]').focus()
    cy.focused().should('have.attr', 'data-testid', 'user-profile-button')
    
    // Open with Enter key
    cy.focused().type('{enter}')
    cy.get('[data-testid="user-settings-menu"]').should('be.visible')
    
    // Navigate menu with arrow keys
    cy.get('body').type('{downarrow}')
    cy.focused().should('have.attr', 'data-testid', 'settings-profile')
    
    cy.get('body').type('{downarrow}')
    cy.focused().should('have.attr', 'data-testid', 'settings-personal-data')
    
    // Open modal with Enter
    cy.get('body').type('{uparrow}') // Back to profile
    cy.focused().type('{enter}')
    cy.get('[data-testid="user-settings-modal"]').should('be.visible')
    
    // Test Tab navigation within modal
    cy.get('[data-testid="display-name-input"]').focus()
    cy.focused().should('have.attr', 'data-testid', 'display-name-input')
    
    cy.focused().tab()
    cy.focused().should('have.attr', 'data-testid', 'save-profile-button')
    
    // Test Escape key closes modal
    cy.get('body').type('{esc}')
    cy.get('[data-testid="user-settings-modal"]').should('not.exist')
    
    // Focus should return to trigger element
    cy.focused().should('have.attr', 'data-testid', 'user-profile-button')
  })

  it('should have proper ARIA labels and descriptions', () => {
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    // Check form labels
    cy.get('[data-testid="display-name-input"]').should('have.attr', 'aria-label')
    cy.get('[data-testid="display-name-input"]').should('have.attr', 'aria-describedby')
    
    // Check section navigation
    cy.get('[data-testid="nav-personal-data"]').should('have.attr', 'aria-label')
    cy.get('[data-testid="nav-personal-data"]').click()
    
    // Check form field associations
    cy.get('[data-testid="weight-input"]').should('have.attr', 'aria-label')
    cy.get('[data-testid="height-input"]').should('have.attr', 'aria-label')
    cy.get('[data-testid="gender-select"]').should('have.attr', 'aria-label')
    
    // Check error messages have proper ARIA
    cy.get('[data-testid="weight-input"]').clear().type('-10')
    cy.get('[data-testid="save-personal-data-button"]').click()
    
    cy.get('[data-testid="weight-error"]').should('have.attr', 'role', 'alert')
    cy.get('[data-testid="weight-input"]').should('have.attr', 'aria-invalid', 'true')
    cy.get('[data-testid="weight-input"]').should('have.attr', 'aria-describedby').and('contain', 'weight-error')
  })

  it('should announce state changes to screen readers', () => {
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-app-preferences"]').click()
    
    // Test theme toggle announcement
    cy.get('[data-testid="theme-toggle"]').should('have.attr', 'aria-label')
    cy.get('[data-testid="theme-toggle"]').click()
    
    // Should have live region for announcements
    cy.get('[data-testid="sr-announcements"]').should('have.attr', 'aria-live', 'polite')
    cy.get('[data-testid="sr-announcements"]').should('contain', 'Tema cambiado a modo oscuro')
    
    // Test units toggle announcement
    cy.get('[data-testid="units-toggle"]').click()
    cy.get('[data-testid="sr-announcements"]').should('contain', 'Unidades cambiadas a imperial')
    
    // Test language change announcement
    cy.get('[data-testid="language-select"]').select('en')
    cy.get('[data-testid="sr-announcements"]').should('contain', 'Language changed to English')
  })

  it('should have proper focus management in modals', () => {
    // Open modal
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    // Focus should be trapped in modal
    cy.get('[data-testid="display-name-input"]').focus()
    
    // Tab through all focusable elements
    const focusableElements = [
      'display-name-input',
      'profile-photo-upload',
      'save-profile-button',
      'nav-personal-data',
      'nav-app-preferences',
      'nav-exercise-management',
      'nav-security',
      'nav-training',
      'close-modal-button'
    ]
    
    focusableElements.forEach((element, index) => {
      if (index > 0) cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', element)
    })
    
    // Tab from last element should go to first
    cy.focused().tab()
    cy.focused().should('have.attr', 'data-testid', 'display-name-input')
    
    // Shift+Tab should go backwards
    cy.focused().tab({ shift: true })
    cy.focused().should('have.attr', 'data-testid', 'close-modal-button')
  })

  it('should have sufficient color contrast', () => {
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    // Check color contrast for all interactive elements
    cy.checkA11y('[data-testid="user-settings-modal"]', {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
    
    // Test dark mode contrast
    cy.get('[data-testid="nav-app-preferences"]').click()
    cy.get('[data-testid="theme-toggle"]').click()
    
    // Wait for theme change
    cy.get('body').should('have.class', 'dark')
    
    // Check contrast in dark mode
    cy.checkA11y('[data-testid="user-settings-modal"]', {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
  })

  it('should support screen reader navigation patterns', () => {
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-exercise-management"]').click()
    
    // Check heading structure
    cy.get('[data-testid="exercise-management-section"] h2').should('exist')
    cy.get('[data-testid="exercise-management-section"] h2').should('have.attr', 'id')
    
    // Check list structure
    cy.get('[data-testid="exercise-list"]').should('have.attr', 'role', 'list')
    cy.get('[data-testid="exercise-item"]').first().should('have.attr', 'role', 'listitem')
    
    // Check form structure
    cy.get('[data-testid="add-exercise-button"]').click()
    cy.get('[data-testid="exercise-form"]').should('have.attr', 'role', 'form')
    cy.get('[data-testid="exercise-form"]').should('have.attr', 'aria-labelledby')
    
    // Check button descriptions
    cy.get('[data-testid="save-exercise-button"]').should('have.attr', 'aria-describedby')
    cy.get('[data-testid="cancel-exercise-button"]').should('have.attr', 'aria-describedby')
  })

  it('should handle high contrast mode', () => {
    // Simulate high contrast mode
    cy.get('body').invoke('addClass', 'high-contrast')
    
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    // Verify elements are still visible and usable
    cy.get('[data-testid="display-name-input"]').should('be.visible')
    cy.get('[data-testid="save-profile-button"]').should('be.visible')
    
    // Check that focus indicators are visible
    cy.get('[data-testid="display-name-input"]').focus()
    cy.get('[data-testid="display-name-input"]').should('have.css', 'outline-width').and('not.equal', '0px')
    
    // Test navigation visibility
    cy.get('[data-testid="nav-personal-data"]').should('be.visible')
    cy.get('[data-testid="nav-app-preferences"]').should('be.visible')
  })

  it('should support reduced motion preferences', () => {
    // Simulate reduced motion preference
    cy.window().then((win) => {
      Object.defineProperty(win, 'matchMedia', {
        writable: true,
        value: cy.stub().returns({
          matches: true,
          media: '(prefers-reduced-motion: reduce)',
          onchange: null,
          addListener: cy.stub(),
          removeListener: cy.stub(),
          addEventListener: cy.stub(),
          removeEventListener: cy.stub(),
          dispatchEvent: cy.stub(),
        }),
      })
    })
    
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    // Verify animations are disabled or reduced
    cy.get('[data-testid="user-settings-modal"]').should('have.css', 'transition-duration', '0s')
    
    // Test section navigation without animations
    cy.get('[data-testid="nav-personal-data"]').click()
    cy.get('[data-testid="personal-data-section"]').should('be.visible')
    cy.get('[data-testid="personal-data-section"]').should('have.css', 'transition-duration', '0s')
  })

  it('should work with voice control software', () => {
    // Test that all interactive elements have accessible names
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    // Check that elements can be targeted by voice commands
    cy.get('[data-testid="display-name-input"]').should('have.attr', 'aria-label').and('not.be.empty')
    cy.get('[data-testid="save-profile-button"]').should('have.attr', 'aria-label').and('not.be.empty')
    
    // Check section navigation
    cy.get('[data-testid="nav-personal-data"]').should('have.attr', 'aria-label').and('not.be.empty')
    cy.get('[data-testid="nav-app-preferences"]').should('have.attr', 'aria-label').and('not.be.empty')
    
    // Test that form controls have unique, descriptive names
    cy.get('[data-testid="nav-personal-data"]').click()
    cy.get('[data-testid="weight-input"]').should('have.attr', 'aria-label').and('contain', 'peso')
    cy.get('[data-testid="height-input"]').should('have.attr', 'aria-label').and('contain', 'altura')
    cy.get('[data-testid="gender-select"]').should('have.attr', 'aria-label').and('contain', 'género')
  })

  it('should provide comprehensive error handling for accessibility', () => {
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-personal-data"]').click()
    
    // Test multiple validation errors
    cy.get('[data-testid="weight-input"]').clear().type('-10')
    cy.get('[data-testid="height-input"]').clear().type('0')
    cy.get('[data-testid="save-personal-data-button"]').click()
    
    // Check error summary for screen readers
    cy.get('[data-testid="error-summary"]').should('exist')
    cy.get('[data-testid="error-summary"]').should('have.attr', 'role', 'alert')
    cy.get('[data-testid="error-summary"]').should('have.attr', 'aria-live', 'assertive')
    
    // Check individual field errors
    cy.get('[data-testid="weight-error"]').should('have.attr', 'role', 'alert')
    cy.get('[data-testid="height-error"]').should('have.attr', 'role', 'alert')
    
    // Check that focus moves to first error field
    cy.focused().should('have.attr', 'data-testid', 'weight-input')
    
    // Test error recovery
    cy.get('[data-testid="weight-input"]').clear().type('75')
    cy.get('[data-testid="height-input"]').clear().type('175')
    cy.get('[data-testid="save-personal-data-button"]').click()
    
    // Success message should be announced
    cy.get('[data-testid="sr-announcements"]').should('contain', 'Datos personales actualizados exitosamente')
  })
})