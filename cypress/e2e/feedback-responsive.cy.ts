describe('Feedback Responsive E2E', () => {
  const viewports = [
    { name: 'iPhone X', width: 375, height: 812 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 }
  ]

  viewports.forEach(({ name, width, height }) => {
    describe(`${name} (${width}x${height})`, () => {
      beforeEach(() => {
        cy.viewport(width, height)
        cy.visit('/')
        cy.get('main', { timeout: 10000 }).should('be.visible')
      })

      it('displays feedback triggers appropriately', () => {
        if (width < 640) {
          // Mobile: Menu trigger should be in mobile menu
          cy.get('button[aria-label*="menú"]').should('be.visible').click()
          cy.get('button[aria-label*="feedback"]').should('be.visible')
        } else {
          // Tablet/Desktop: Menu trigger should be in navigation
          cy.get('button[aria-label*="feedback"]').should('be.visible')
        }

        // Footer trigger should always be visible
        cy.scrollTo('bottom')
        cy.get('button[aria-label*="problema"]').should('be.visible')
      })

      it('modal displays correctly for viewport size', () => {
        // Open modal
        if (width < 640) {
          cy.get('button[aria-label*="menú"]').click()
        }
        cy.get('button[aria-label*="feedback"]').click()

        // Verify modal is visible and properly sized
        cy.get('[role="dialog"]').should('be.visible')
        cy.contains('Feedback').should('be.visible')

        // Verify form elements are visible and functional
        cy.get('#feedback-title').should('be.visible')
        cy.get('#feedback-type').should('be.visible')
        cy.get('#feedback-description').should('be.visible')
        cy.get('button[type="submit"]').should('be.visible').and('be.disabled')
      })

      it('form elements are appropriately sized', () => {
        // Open modal
        if (width < 640) {
          cy.get('[data-testid="mobile-menu-button"]').click()
        }
        cy.get('[data-testid="feedback-menu-trigger"]').click()

        // Check form element sizes
        cy.get('[data-testid="feedback-title"]')
          .should('be.visible')
          .and('have.css', 'min-height')

        cy.get('[data-testid="feedback-description"]')
          .should('be.visible')
          .and('have.css', 'min-height')

        // Check button sizes (especially important for mobile)
        cy.get('[data-testid="feedback-submit"]')
          .should('be.visible')
          .and('have.css', 'min-height')

        cy.get('[data-testid="feedback-cancel"]')
          .should('be.visible')
          .and('have.css', 'min-height')

        if (width < 640) {
          // Mobile: Check touch target sizes (minimum 44px)
          cy.get('[data-testid="feedback-submit"]')
            .should('have.css', 'min-height')
            .and('match', /[4-9][0-9]px/) // Should be at least 44px

          cy.get('[data-testid="feedback-cancel"]')
            .should('have.css', 'min-height')
            .and('match', /[4-9][0-9]px/) // Should be at least 44px
        }
      })

      it('handles touch/click interactions appropriately', () => {
        // Open modal
        if (width < 640) {
          cy.get('[data-testid="mobile-menu-button"]').click()
        }
        cy.get('[data-testid="feedback-menu-trigger"]').click()

        // Test form interactions
        cy.get('[data-testid="feedback-title"]')
          .should('be.visible')
          .click()
          .type('Responsive test title')
          .should('have.value', 'Responsive test title')

        cy.get('[data-testid="feedback-type"]')
          .should('be.visible')
          .select('bug')
          .should('have.value', 'bug')

        cy.get('[data-testid="feedback-description"]')
          .should('be.visible')
          .click()
          .type('Testing responsive behavior on different screen sizes')
          .should('contain.value', 'Testing responsive behavior')

        // Test modal close
        cy.get('[data-testid="feedback-cancel"]').click()
        cy.get('[role="dialog"]').should('not.exist')
      })
    })
  })

  describe('Orientation Changes', () => {
    it('handles portrait to landscape on mobile', () => {
      // Start in portrait
      cy.viewport(375, 812)
      cy.visit('/')
      cy.get('[data-testid="main-content"]').should('be.visible')

      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Fill some form data
      cy.get('[data-testid="feedback-title"]').type('Orientation test')

      // Change to landscape
      cy.viewport(812, 375)

      // Modal should still be visible and functional
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('[data-testid="feedback-title"]').should('have.value', 'Orientation test')

      // Should be able to continue interacting
      cy.get('[data-testid="feedback-description"]')
        .type('Testing orientation change')
        .should('contain.value', 'Testing orientation change')
    })

    it('handles landscape to portrait on mobile', () => {
      // Start in landscape
      cy.viewport(812, 375)
      cy.visit('/')
      cy.get('[data-testid="main-content"]').should('be.visible')

      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Fill form
      cy.get('[data-testid="feedback-title"]').type('Landscape test')
      cy.get('[data-testid="feedback-type"]').select('improvement')

      // Change to portrait
      cy.viewport(375, 812)

      // Modal should adapt and remain functional
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('[data-testid="feedback-title"]').should('have.value', 'Landscape test')
      cy.get('[data-testid="feedback-type"]').should('have.value', 'improvement')

      // Form should still be usable
      cy.get('[data-testid="feedback-description"]')
        .type('Completed in portrait mode')
        .should('contain.value', 'Completed in portrait mode')
    })
  })

  describe('Cross-Device Consistency', () => {
    it('maintains consistent functionality across all viewports', () => {
      viewports.forEach(({ name, width, height }) => {
        cy.viewport(width, height)
        cy.visit('/')
        cy.get('[data-testid="main-content"]').should('be.visible')

        // Open modal (method varies by viewport)
        if (width < 640) {
          cy.get('[data-testid="mobile-menu-button"]').click()
        }
        cy.get('[data-testid="feedback-menu-trigger"]').click()

        // Verify core functionality works
        cy.get('[role="dialog"]').should('be.visible')
        cy.get('[data-testid="feedback-title"]')
          .type(`${name} test`)
          .should('have.value', `${name} test`)

        cy.get('[data-testid="feedback-type"]')
          .select('feature')
          .should('have.value', 'feature')

        cy.get('[data-testid="feedback-description"]')
          .type(`Testing on ${name} viewport`)
          .should('contain.value', `Testing on ${name} viewport`)

        // Verify submit is disabled (Phase 1)
        cy.get('[data-testid="feedback-submit"]').should('be.disabled')

        // Close modal
        cy.get('[data-testid="feedback-cancel"]').click()
        cy.get('[role="dialog"]').should('not.exist')
      })
    })
  })

  describe('Performance on Different Viewports', () => {
    it('modal opens quickly on all viewport sizes', () => {
      viewports.forEach(({ name, width, height }) => {
        cy.viewport(width, height)
        cy.visit('/')
        cy.get('[data-testid="main-content"]').should('be.visible')

        // Measure modal open time
        const startTime = Date.now()
        
        if (width < 640) {
          cy.get('[data-testid="mobile-menu-button"]').click()
        }
        cy.get('[data-testid="feedback-menu-trigger"]').click()

        cy.get('[role="dialog"]').should('be.visible').then(() => {
          const endTime = Date.now()
          const openTime = endTime - startTime
          
          // Modal should open within reasonable time (< 1000ms)
          expect(openTime).to.be.lessThan(1000)
        })

        // Close modal
        cy.get('[data-testid="feedback-cancel"]').click()
        cy.get('[role="dialog"]').should('not.exist')
      })
    })
  })

  describe('Scroll Behavior', () => {
    it('handles scrolling with modal open on mobile', () => {
      cy.viewport(375, 812)
      cy.visit('/')
      cy.get('[data-testid="main-content"]').should('be.visible')

      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Try to scroll (should be prevented when modal is open)
      cy.get('body').should('have.css', 'overflow', 'hidden')

      // Close modal
      cy.get('[data-testid="feedback-cancel"]').click()
      cy.get('[role="dialog"]').should('not.exist')

      // Scrolling should be restored
      cy.get('body').should('not.have.css', 'overflow', 'hidden')
    })
  })
})