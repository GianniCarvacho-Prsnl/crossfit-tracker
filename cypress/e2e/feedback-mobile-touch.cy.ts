describe('Feedback Mobile Touch Interactions', () => {
  beforeEach(() => {
    // Set mobile viewport
    cy.viewport('iphone-x')
    cy.visit('/')
    cy.get('[data-testid="main-content"]', { timeout: 10000 }).should('be.visible')
  })

  describe('Touch Target Accessibility', () => {
    it('all interactive elements meet minimum touch target size', () => {
      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Check touch target sizes (minimum 44px)
      const touchTargets = [
        '[data-testid="feedback-close"]',
        '[data-testid="feedback-submit"]',
        '[data-testid="feedback-cancel"]',
        '[data-testid="feedback-title"]',
        '[data-testid="feedback-type"]',
        '[data-testid="feedback-description"]'
      ]

      touchTargets.forEach(selector => {
        cy.get(selector).then($el => {
          const rect = $el[0].getBoundingClientRect()
          expect(rect.height).to.be.at.least(44)
          // For inputs, check that they have adequate padding/height
          if (selector.includes('title') || selector.includes('description')) {
            expect(rect.height).to.be.at.least(44)
          }
        })
      })
    })

    it('touch targets have adequate spacing', () => {
      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Check spacing between submit and cancel buttons
      cy.get('[data-testid="feedback-submit"]').then($submit => {
        cy.get('[data-testid="feedback-cancel"]').then($cancel => {
          const submitRect = $submit[0].getBoundingClientRect()
          const cancelRect = $cancel[0].getBoundingClientRect()
          
          // Buttons should have at least 8px spacing
          const spacing = Math.abs(submitRect.right - cancelRect.left) || 
                         Math.abs(cancelRect.right - submitRect.left)
          expect(spacing).to.be.at.least(8)
        })
      })
    })
  })

  describe('Touch Gestures', () => {
    it('supports tap gestures on all interactive elements', () => {
      // Test menu trigger tap
      cy.get('[data-testid="mobile-menu-button"]')
        .trigger('touchstart')
        .trigger('touchend')
        .click()

      cy.get('[data-testid="feedback-menu-trigger"]')
        .trigger('touchstart')
        .trigger('touchend')
        .click()

      cy.get('[role="dialog"]').should('be.visible')

      // Test form element taps
      cy.get('[data-testid="feedback-title"]')
        .trigger('touchstart')
        .trigger('touchend')
        .click()
        .type('Touch test title')

      cy.get('[data-testid="feedback-type"]')
        .trigger('touchstart')
        .trigger('touchend')
        .select('bug')

      cy.get('[data-testid="feedback-description"]')
        .trigger('touchstart')
        .trigger('touchend')
        .click()
        .type('Testing touch interactions')

      // Test button taps
      cy.get('[data-testid="feedback-cancel"]')
        .trigger('touchstart')
        .trigger('touchend')
        .click()

      cy.get('[role="dialog"]').should('not.exist')
    })

    it('handles touch and hold gestures', () => {
      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Test touch and hold on text input (should show context menu or selection)
      cy.get('[data-testid="feedback-title"]')
        .type('Touch and hold test')
        .trigger('touchstart')
        .wait(500) // Hold for 500ms
        .trigger('touchend')

      // Element should still be functional
      cy.get('[data-testid="feedback-title"]')
        .should('have.value', 'Touch and hold test')
        .clear()
        .type('Updated after hold')
        .should('have.value', 'Updated after hold')
    })

    it('prevents accidental touches outside modal', () => {
      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Try to touch elements behind modal (should be blocked)
      cy.get('body').should('have.css', 'overflow', 'hidden')

      // Touch on overlay should close modal
      cy.get('[data-testid="feedback-overlay"]')
        .trigger('touchstart')
        .trigger('touchend')
        .click({ force: true })

      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('Swipe Gestures', () => {
    it('does not close modal on vertical swipes', () => {
      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Try vertical swipe on modal content
      cy.get('[data-testid="feedback-modal"]')
        .trigger('touchstart', { touches: [{ clientX: 200, clientY: 300 }] })
        .trigger('touchmove', { touches: [{ clientX: 200, clientY: 200 }] })
        .trigger('touchend')

      // Modal should remain open
      cy.get('[role="dialog"]').should('be.visible')

      // Try downward swipe
      cy.get('[data-testid="feedback-modal"]')
        .trigger('touchstart', { touches: [{ clientX: 200, clientY: 200 }] })
        .trigger('touchmove', { touches: [{ clientX: 200, clientY: 400 }] })
        .trigger('touchend')

      // Modal should still be open
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('allows scrolling within textarea on touch devices', () => {
      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Fill textarea with long content
      const longText = 'This is a very long text that should cause the textarea to scroll. '.repeat(10)
      cy.get('[data-testid="feedback-description"]')
        .type(longText)

      // Try to scroll within textarea
      cy.get('[data-testid="feedback-description"]')
        .trigger('touchstart', { touches: [{ clientX: 200, clientY: 400 }] })
        .trigger('touchmove', { touches: [{ clientX: 200, clientY: 350 }] })
        .trigger('touchend')

      // Textarea should still contain the text
      cy.get('[data-testid="feedback-description"]')
        .should('contain.value', 'This is a very long text')
    })
  })

  describe('Virtual Keyboard Handling', () => {
    it('adjusts modal position when virtual keyboard appears', () => {
      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Focus on input field (simulates virtual keyboard)
      cy.get('[data-testid="feedback-title"]').click().focus()

      // Modal should still be visible and accessible
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('[data-testid="feedback-title"]').should('be.focused')

      // Should be able to type
      cy.get('[data-testid="feedback-title"]')
        .type('Virtual keyboard test')
        .should('have.value', 'Virtual keyboard test')

      // Focus on textarea
      cy.get('[data-testid="feedback-description"]').click().focus()
      cy.get('[data-testid="feedback-description"]').should('be.focused')

      // Should be able to type in textarea
      cy.get('[data-testid="feedback-description"]')
        .type('Testing with virtual keyboard open')
        .should('contain.value', 'Testing with virtual keyboard open')
    })

    it('maintains modal functionality when keyboard is dismissed', () => {
      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Focus input (keyboard appears)
      cy.get('[data-testid="feedback-title"]').click().type('Test input')

      // Blur input (keyboard dismisses)
      cy.get('[data-testid="feedback-title"]').blur()

      // Modal should still be fully functional
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('[data-testid="feedback-cancel"]').should('be.visible').click()
      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('Multi-touch Prevention', () => {
    it('prevents multiple simultaneous touches from causing issues', () => {
      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Simulate multiple touches
      cy.get('[data-testid="feedback-title"]')
        .trigger('touchstart', { 
          touches: [
            { clientX: 100, clientY: 200 },
            { clientX: 200, clientY: 200 }
          ] 
        })
        .trigger('touchend')
        .click()
        .type('Multi-touch test')

      // Should still work normally
      cy.get('[data-testid="feedback-title"]')
        .should('have.value', 'Multi-touch test')

      // Try multiple touches on different elements
      cy.get('[data-testid="feedback-submit"]')
        .trigger('touchstart')
      cy.get('[data-testid="feedback-cancel"]')
        .trigger('touchstart')
        .trigger('touchend')
        .click()

      // Should close normally
      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('Touch Feedback', () => {
    it('provides visual feedback for touch interactions', () => {
      // Open modal
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Check that buttons have active states
      cy.get('[data-testid="feedback-cancel"]')
        .trigger('touchstart')
        .should('have.class', 'active')
        .trigger('touchend')

      // Check that form elements show focus states
      cy.get('[data-testid="feedback-title"]')
        .click()
        .should('have.focus')
        .should('have.class', 'focus:ring-2')
    })

    it('handles rapid successive touches gracefully', () => {
      // Test rapid touches on menu trigger
      cy.get('[data-testid="mobile-menu-button"]').click()
      
      // Rapid touches on feedback trigger
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="feedback-menu-trigger"]')
          .trigger('touchstart')
          .trigger('touchend')
      }
      
      // Final click should open modal
      cy.get('[data-testid="feedback-menu-trigger"]').click()
      cy.get('[role="dialog"]').should('be.visible')

      // Should have only one modal
      cy.get('[role="dialog"]').should('have.length', 1)
    })
  })
})