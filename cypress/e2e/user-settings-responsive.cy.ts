describe('User Settings Responsive Design', () => {
  const testEmail = Cypress.env('TEST_EMAIL')
  const testPassword = Cypress.env('TEST_PASSWORD')

  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    { name: 'Desktop Small', width: 1280, height: 720 },
    { name: 'Desktop Large', width: 1920, height: 1080 }
  ]

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.login(testEmail, testPassword)
  })

  devices.forEach(device => {
    it(`should work correctly on ${device.name} (${device.width}x${device.height})`, () => {
      cy.viewport(device.width, device.height)
      
      // Test user profile button visibility and size
      cy.get('[data-testid="user-profile-button"]').should('be.visible')
      cy.get('[data-testid="user-profile-button"]').should('have.css', 'min-height').and('match', /44px|48px/)
      
      // Open settings menu
      cy.get('[data-testid="user-profile-button"]').click()
      cy.get('[data-testid="user-settings-menu"]').should('be.visible')
      
      // Verify menu items are touch-friendly
      cy.get('[data-testid="settings-profile"]').should('have.css', 'min-height').and('match', /44px|48px/)
      cy.get('[data-testid="settings-personal-data"]').should('have.css', 'min-height').and('match', /44px|48px/)
      
      // Open modal and test responsiveness
      cy.get('[data-testid="settings-profile"]').click()
      cy.get('[data-testid="user-settings-modal"]').should('be.visible')
      
      if (device.width < 768) {
        // Mobile: Modal should be full-screen or near full-screen
        cy.get('[data-testid="user-settings-modal"]').should('have.css', 'width').and('match', /100%|90%/)
        cy.get('[data-testid="mobile-section-nav"]').should('be.visible')
      } else {
        // Tablet/Desktop: Modal should be centered with max-width
        cy.get('[data-testid="user-settings-modal"]').should('have.css', 'max-width')
        cy.get('[data-testid="desktop-section-nav"]').should('be.visible')
      }
      
      // Test form inputs are appropriately sized
      cy.get('[data-testid="display-name-input"]').should('have.css', 'min-height').and('match', /44px|48px/)
      
      // Test navigation between sections
      cy.get('[data-testid="nav-personal-data"]').click()
      cy.get('[data-testid="personal-data-section"]').should('be.visible')
      
      // Verify form layout on this device
      cy.get('[data-testid="weight-input"]').should('be.visible')
      cy.get('[data-testid="height-input"]').should('be.visible')
      
      if (device.width < 640) {
        // Small mobile: Inputs should stack vertically
        cy.get('[data-testid="weight-height-container"]').should('have.css', 'flex-direction', 'column')
      } else {
        // Larger screens: Inputs can be side by side
        cy.get('[data-testid="weight-height-container"]').should('have.css', 'flex-direction').and('match', /row|column/)
      }
      
      // Test scrolling behavior
      cy.get('[data-testid="nav-training"]').click()
      cy.get('[data-testid="training-section"]').should('be.visible')
      cy.get('[data-testid="training-section"]').scrollIntoView()
      
      // Close modal
      cy.get('[data-testid="close-modal-button"]').click()
      cy.get('[data-testid="user-settings-modal"]').should('not.exist')
    })
  })

  it('should handle orientation changes on mobile devices', () => {
    // Test portrait mode
    cy.viewport(375, 667)
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    cy.get('[data-testid="user-settings-modal"]').should('be.visible')
    
    // Switch to landscape
    cy.viewport(667, 375)
    cy.get('[data-testid="user-settings-modal"]').should('be.visible')
    cy.get('[data-testid="profile-section"]').should('be.visible')
    
    // Verify modal adapts to landscape
    cy.get('[data-testid="user-settings-modal"]').should('have.css', 'height').and('match', /100%|90%/)
    
    // Test navigation still works
    cy.get('[data-testid="nav-personal-data"]').click()
    cy.get('[data-testid="personal-data-section"]').should('be.visible')
  })

  it('should handle touch gestures appropriately', () => {
    cy.viewport(375, 667)
    
    // Test tap targets are large enough
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="user-settings-menu"] [data-testid="settings-profile"]')
      .should('have.css', 'min-height').and('match', /44px|48px/)
    
    // Test swipe-like navigation (if implemented)
    cy.get('[data-testid="settings-profile"]').click()
    
    // Test touch scrolling in modal
    cy.get('[data-testid="user-settings-modal"]').within(() => {
      cy.get('[data-testid="nav-training"]').click()
      cy.get('[data-testid="training-section"]').should('be.visible')
      
      // Simulate scroll behavior
      cy.get('[data-testid="training-section"]').trigger('touchstart', { touches: [{ clientX: 100, clientY: 200 }] })
      cy.get('[data-testid="training-section"]').trigger('touchmove', { touches: [{ clientX: 100, clientY: 100 }] })
      cy.get('[data-testid="training-section"]').trigger('touchend')
    })
  })

  it('should maintain performance on low-end devices', () => {
    // Simulate slower device
    cy.viewport(375, 667)
    
    // Measure time to open settings
    const startTime = Date.now()
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="user-settings-menu"]').should('be.visible').then(() => {
      const menuOpenTime = Date.now() - startTime
      expect(menuOpenTime).to.be.lessThan(500) // Should open within 500ms
    })
    
    // Measure time to open modal
    const modalStartTime = Date.now()
    cy.get('[data-testid="settings-profile"]').click()
    cy.get('[data-testid="user-settings-modal"]').should('be.visible').then(() => {
      const modalOpenTime = Date.now() - modalStartTime
      expect(modalOpenTime).to.be.lessThan(800) // Should open within 800ms
    })
    
    // Test smooth navigation between sections
    cy.get('[data-testid="nav-personal-data"]').click()
    cy.get('[data-testid="personal-data-section"]').should('be.visible')
    
    cy.get('[data-testid="nav-app-preferences"]').click()
    cy.get('[data-testid="app-preferences-section"]').should('be.visible')
    
    // Verify no layout shifts during navigation
    cy.get('[data-testid="user-settings-modal"]').should('have.css', 'width').then((width) => {
      cy.get('[data-testid="nav-training"]').click()
      cy.get('[data-testid="user-settings-modal"]').should('have.css', 'width', width)
    })
  })

  it('should handle edge cases in responsive design', () => {
    // Test very narrow screens
    cy.viewport(320, 568)
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="user-settings-menu"]').should('be.visible')
    cy.get('[data-testid="settings-profile"]').click()
    
    // Modal should still be usable
    cy.get('[data-testid="user-settings-modal"]').should('be.visible')
    cy.get('[data-testid="display-name-input"]').should('be.visible')
    
    // Test very wide screens
    cy.viewport(2560, 1440)
    cy.get('[data-testid="user-settings-modal"]').should('be.visible')
    cy.get('[data-testid="user-settings-modal"]').should('have.css', 'max-width')
    
    // Modal should not be too wide
    cy.get('[data-testid="user-settings-modal"]').invoke('outerWidth').should('be.lessThan', 800)
  })

  it('should handle dynamic content changes responsively', () => {
    cy.viewport(375, 667)
    
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-exercise-management"]').click()
    
    // Add multiple exercises and verify list remains responsive
    for (let i = 1; i <= 5; i++) {
      cy.get('[data-testid="add-exercise-button"]').click()
      cy.get('[data-testid="exercise-name-input"]').type(`Test Exercise ${i}`)
      cy.get('[data-testid="save-exercise-button"]').click()
    }
    
    // Verify list is scrollable and items are properly sized
    cy.get('[data-testid="exercise-list"]').should('be.visible')
    cy.get('[data-testid="exercise-item"]').should('have.length', 5)
    cy.get('[data-testid="exercise-item"]').first().should('have.css', 'min-height').and('match', /44px|48px/)
    
    // Test horizontal scrolling if needed
    cy.get('[data-testid="exercise-list"]').scrollTo('bottom')
    cy.get('[data-testid="exercise-item"]').last().should('be.visible')
  })
})