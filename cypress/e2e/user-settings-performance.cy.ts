describe('User Settings Performance & Animations', () => {
  const testEmail = Cypress.env('TEST_EMAIL')
  const testPassword = Cypress.env('TEST_PASSWORD')

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.login(testEmail, testPassword)
  })

  it('should have optimized animations for mobile devices', () => {
    cy.viewport(375, 667)
    
    // Test menu opening animation
    const startTime = performance.now()
    cy.get('[data-testid="user-profile-button"]').click()
    
    cy.get('[data-testid="user-settings-menu"]').should('be.visible').then(() => {
      const animationTime = performance.now() - startTime
      expect(animationTime).to.be.lessThan(300) // Should animate within 300ms
    })
    
    // Check animation properties
    cy.get('[data-testid="user-settings-menu"]').should('have.css', 'transition-duration')
    cy.get('[data-testid="user-settings-menu"]').should('have.css', 'transform')
    
    // Test modal opening animation
    const modalStartTime = performance.now()
    cy.get('[data-testid="settings-profile"]').click()
    
    cy.get('[data-testid="user-settings-modal"]').should('be.visible').then(() => {
      const modalAnimationTime = performance.now() - modalStartTime
      expect(modalAnimationTime).to.be.lessThan(400) // Should animate within 400ms
    })
    
    // Check modal animation uses GPU acceleration
    cy.get('[data-testid="user-settings-modal"]').should('have.css', 'transform')
    cy.get('[data-testid="user-settings-modal"]').should('have.css', 'will-change', 'transform')
  })

  it('should respect reduced motion preferences', () => {
    // Mock reduced motion preference
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
    
    cy.reload()
    cy.login(testEmail, testPassword)
    
    // Animations should be disabled or minimal
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="user-settings-menu"]').should('have.css', 'transition-duration', '0s')
    
    cy.get('[data-testid="settings-profile"]').click()
    cy.get('[data-testid="user-settings-modal"]').should('have.css', 'transition-duration', '0s')
  })

  it('should maintain 60fps during animations', () => {
    cy.viewport(375, 667)
    
    // Monitor frame rate during menu animation
    let frameCount = 0
    let startTime = 0
    
    cy.window().then((win) => {
      const originalRAF = win.requestAnimationFrame
      win.requestAnimationFrame = (callback) => {
        if (startTime === 0) startTime = performance.now()
        frameCount++
        return originalRAF(callback)
      }
    })
    
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="user-settings-menu"]').should('be.visible')
    
    cy.wait(500).then(() => {
      const duration = performance.now() - startTime
      const fps = (frameCount / duration) * 1000
      expect(fps).to.be.greaterThan(55) // Should maintain near 60fps
    })
  })

  it('should have smooth section transitions', () => {
    cy.viewport(375, 667)
    
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    // Test section navigation smoothness
    const sections = [
      'nav-personal-data',
      'nav-app-preferences',
      'nav-exercise-management',
      'nav-security',
      'nav-training'
    ]
    
    sections.forEach((section, index) => {
      const startTime = performance.now()
      cy.get(`[data-testid="${section}"]`).click()
      
      // Check transition completes quickly
      cy.get(`[data-testid="${section.replace('nav-', '')}-section"]`).should('be.visible').then(() => {
        const transitionTime = performance.now() - startTime
        expect(transitionTime).to.be.lessThan(250) // Should transition within 250ms
      })
      
      // Check no layout shifts during transition
      cy.get('[data-testid="user-settings-modal"]').should('have.css', 'width').then((width) => {
        cy.wait(100) // Wait for transition to complete
        cy.get('[data-testid="user-settings-modal"]').should('have.css', 'width', width)
      })
    })
  })

  it('should optimize touch interactions', () => {
    cy.viewport(375, 667)
    
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-app-preferences"]').click()
    
    // Test toggle animations are touch-optimized
    cy.get('[data-testid="theme-toggle"]').should('have.css', 'transition-duration')
    
    const toggleStartTime = performance.now()
    cy.get('[data-testid="theme-toggle"]').click()
    
    // Toggle should respond immediately
    cy.get('[data-testid="theme-toggle"]').should('have.attr', 'aria-checked', 'true').then(() => {
      const responseTime = performance.now() - toggleStartTime
      expect(responseTime).to.be.lessThan(100) // Should respond within 100ms
    })
    
    // Visual feedback should be immediate
    cy.get('body').should('have.class', 'dark')
  })

  it('should handle rapid interactions gracefully', () => {
    cy.viewport(375, 667)
    
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    // Rapidly switch between sections
    const sections = ['nav-personal-data', 'nav-app-preferences', 'nav-training', 'nav-security']
    
    sections.forEach(section => {
      cy.get(`[data-testid="${section}"]`).click({ force: true })
      cy.wait(50) // Minimal wait to simulate rapid clicking
    })
    
    // Should end up on the last clicked section
    cy.get('[data-testid="security-section"]').should('be.visible')
    
    // No animation artifacts should remain
    cy.get('[data-testid="user-settings-modal"]').should('not.have.class', 'transitioning')
  })

  it('should optimize memory usage during animations', () => {
    cy.viewport(375, 667)
    
    // Monitor memory usage (simplified check)
    cy.window().then((win) => {
      const initialMemory = (win.performance as any).memory?.usedJSHeapSize || 0
      
      // Perform multiple animation cycles
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="user-profile-button"]').click()
        cy.get('[data-testid="user-settings-menu"]').should('be.visible')
        cy.get('[data-testid="settings-profile"]').click()
        cy.get('[data-testid="user-settings-modal"]').should('be.visible')
        cy.get('[data-testid="close-modal-button"]').click()
        cy.get('[data-testid="user-settings-modal"]').should('not.exist')
        cy.get('body').click() // Close menu
        cy.get('[data-testid="user-settings-menu"]').should('not.exist')
      }
      
      // Check memory hasn't grown excessively
      cy.window().then((win) => {
        const finalMemory = (win.performance as any).memory?.usedJSHeapSize || 0
        if (initialMemory > 0 && finalMemory > 0) {
          const memoryGrowth = finalMemory - initialMemory
          expect(memoryGrowth).to.be.lessThan(5000000) // Less than 5MB growth
        }
      })
    })
  })

  it('should handle low-end device performance', () => {
    // Simulate slower device by throttling
    cy.viewport(375, 667)
    
    // Add artificial delay to simulate slower device
    cy.window().then((win) => {
      const originalRAF = win.requestAnimationFrame
      win.requestAnimationFrame = (callback) => {
        return originalRAF(() => {
          setTimeout(callback, 5) // Add 5ms delay to simulate slower device
        })
      }
    })
    
    // Test that animations still work acceptably
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="user-settings-menu"]').should('be.visible')
    
    // Should still be responsive despite throttling
    cy.get('[data-testid="settings-profile"]').click()
    cy.get('[data-testid="user-settings-modal"]').should('be.visible')
    
    // Navigation should still work smoothly
    cy.get('[data-testid="nav-personal-data"]').click()
    cy.get('[data-testid="personal-data-section"]').should('be.visible')
  })

  it('should optimize CSS animations for mobile', () => {
    cy.viewport(375, 667)
    
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    // Check that animations use transform and opacity (GPU accelerated)
    cy.get('[data-testid="user-settings-modal"]').should('have.css', 'transform')
    cy.get('[data-testid="user-settings-modal"]').should('have.css', 'will-change')
    
    // Check that expensive properties are not animated
    cy.get('[data-testid="user-settings-modal"]').should('not.have.css', 'transition-property', 'width')
    cy.get('[data-testid="user-settings-modal"]').should('not.have.css', 'transition-property', 'height')
    cy.get('[data-testid="user-settings-modal"]').should('not.have.css', 'transition-property', 'left')
    cy.get('[data-testid="user-settings-modal"]').should('not.have.css', 'transition-property', 'top')
    
    // Test section transitions use efficient properties
    cy.get('[data-testid="nav-personal-data"]').click()
    cy.get('[data-testid="personal-data-section"]').should('have.css', 'transform')
  })

  it('should handle orientation changes during animations', () => {
    // Start in portrait
    cy.viewport(375, 667)
    
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    // Change to landscape during modal animation
    cy.viewport(667, 375)
    
    // Modal should still be visible and properly positioned
    cy.get('[data-testid="user-settings-modal"]').should('be.visible')
    cy.get('[data-testid="profile-section"]').should('be.visible')
    
    // Test section navigation in landscape
    cy.get('[data-testid="nav-personal-data"]').click()
    cy.get('[data-testid="personal-data-section"]').should('be.visible')
    
    // Change back to portrait
    cy.viewport(375, 667)
    
    // Should adapt without issues
    cy.get('[data-testid="personal-data-section"]').should('be.visible')
  })

  it('should provide visual feedback for all interactions', () => {
    cy.viewport(375, 667)
    
    // Test button press feedback
    cy.get('[data-testid="user-profile-button"]').should('have.css', 'transition')
    
    // Simulate touch start/end
    cy.get('[data-testid="user-profile-button"]').trigger('touchstart')
    cy.get('[data-testid="user-profile-button"]').should('have.css', 'transform').and('not.equal', 'none')
    
    cy.get('[data-testid="user-profile-button"]').trigger('touchend')
    cy.get('[data-testid="user-profile-button"]').click()
    
    // Test menu item hover/focus states
    cy.get('[data-testid="settings-profile"]').trigger('mouseover')
    cy.get('[data-testid="settings-profile"]').should('have.css', 'background-color').and('not.equal', 'rgba(0, 0, 0, 0)')
    
    cy.get('[data-testid="settings-profile"]').focus()
    cy.get('[data-testid="settings-profile"]').should('have.css', 'outline-width').and('not.equal', '0px')
  })
})