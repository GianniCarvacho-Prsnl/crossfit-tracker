describe('Feedback Complete Flow E2E', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for page to load
    cy.get('main', { timeout: 10000 }).should('be.visible')
  })

  describe('Menu Trigger Flow', () => {
    it('completes full flow from menu trigger to modal close', () => {
      // Step 1: Open navigation menu (if mobile)
      cy.viewport('iphone-x')
      cy.get('button[aria-label*="menú"]').should('be.visible').click()
      
      // Step 2: Click feedback option in menu
      cy.get('button[aria-label*="feedback"]')
        .should('be.visible')
        .click()

      // Step 3: Verify modal opens
      cy.get('[role="dialog"]').should('be.visible')
      cy.contains('Feedback').should('be.visible')

      // Step 4: Interact with form
      cy.get('#feedback-title')
        .should('be.visible')
        .type('E2E Test Feedback Title')

      cy.get('#feedback-type')
        .should('be.visible')
        .select('bug')

      cy.get('#feedback-description')
        .should('be.visible')
        .type('This is a comprehensive E2E test for the feedback modal functionality.')

      // Step 5: Verify form values
      cy.get('#feedback-title').should('have.value', 'E2E Test Feedback Title')
      cy.get('#feedback-type').should('have.value', 'bug')
      cy.get('#feedback-description').should('contain.value', 'This is a comprehensive E2E test')

      // Step 6: Verify submit button is disabled (Phase 1)
      cy.get('button[type="submit"]').should('be.disabled')
      cy.contains('Esta es una versión de vista previa').should('be.visible')

      // Step 7: Close modal with cancel button
      cy.get('button').contains('Cancelar')
        .should('be.visible')
        .click()

      // Step 8: Verify modal closes
      cy.get('[role="dialog"]').should('not.exist')
    })

    it('closes modal with ESC key', () => {
      // Open modal
      cy.viewport('iphone-x')
      cy.get('button[aria-label*="menú"]').click()
      cy.get('button[aria-label*="feedback"]').click()
      
      // Verify modal is open
      cy.get('[role="dialog"]').should('be.visible')

      // Fill some form data
      cy.get('#feedback-title').type('ESC Test')

      // Close with ESC key
      cy.get('body').type('{esc}')

      // Verify modal closes
      cy.get('[role="dialog"]').should('not.exist')
    })

    it('closes modal by clicking outside', () => {
      // Open modal
      cy.viewport('iphone-x')
      cy.get('button[aria-label*="menú"]').click()
      cy.get('button[aria-label*="feedback"]').click()
      
      // Verify modal is open
      cy.get('[role="dialog"]').should('be.visible')

      // Click on overlay (outside modal)
      cy.get('[role="dialog"]').click({ force: true })

      // Verify modal closes
      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('Footer Trigger Flow', () => {
    it('completes full flow from footer trigger to modal close', () => {
      // Step 1: Scroll to footer
      cy.scrollTo('bottom')
      
      // Step 2: Click footer feedback link
      cy.get('button[aria-label*="problema"]')
        .should('be.visible')
        .click()

      // Step 3: Verify modal opens
      cy.get('[role="dialog"]').should('be.visible')
      cy.contains('Feedback').should('be.visible')

      // Step 4: Fill form
      cy.get('#feedback-title').type('Footer E2E Test')
      cy.get('#feedback-type').select('improvement')
      cy.get('#feedback-description').type('Testing footer trigger functionality')

      // Step 5: Close with X button
      cy.get('button[aria-label*="Cerrar"]')
        .should('be.visible')
        .click()

      // Step 6: Verify modal closes
      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('Both Triggers Open Same Modal', () => {
    it('validates both triggers open identical modal', () => {
      // Test menu trigger first
      cy.viewport('iphone-x')
      cy.get('button[aria-label*="menú"]').click()
      cy.get('button[aria-label*="feedback"]').click()
      
      // Verify modal content
      cy.get('[role="dialog"]').should('be.visible')
      cy.contains('Feedback').should('be.visible')
      cy.get('#feedback-title').should('be.visible')
      cy.get('#feedback-type').should('be.visible')
      cy.get('#feedback-description').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible').and('be.disabled')
      cy.get('button').contains('Cancelar').should('be.visible')

      // Close modal
      cy.get('button').contains('Cancelar').click()
      cy.get('[role="dialog"]').should('not.exist')

      // Test footer trigger
      cy.scrollTo('bottom')
      cy.get('button[aria-label*="problema"]').click()
      
      // Verify same modal content
      cy.get('[role="dialog"]').should('be.visible')
      cy.contains('Feedback').should('be.visible')
      cy.get('#feedback-title').should('be.visible')
      cy.get('#feedback-type').should('be.visible')
      cy.get('#feedback-description').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible').and('be.disabled')
      cy.get('button').contains('Cancelar').should('be.visible')
    })
  })

  describe('Form Validation', () => {
    beforeEach(() => {
      // Open modal
      cy.viewport('iphone-x')
      cy.get('button[aria-label*="menú"]').click()
      cy.get('button[aria-label*="feedback"]').click()
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('shows validation errors for empty required fields', () => {
      // Try to submit without filling required fields
      cy.get('button[type="submit"]').should('be.disabled')

      // Fill title (required field)
      cy.get('#feedback-title').type('Test Title')
      
      // Submit should still be disabled (Phase 1 limitation)
      cy.get('button[type="submit"]').should('be.disabled')
      
      // Verify placeholder message
      cy.contains('Esta es una versión de vista previa').should('be.visible')
    })

    it('validates character limits', () => {
      // Test title character limit (100 chars)
      const longTitle = 'a'.repeat(101)
      cy.get('#feedback-title').type(longTitle)
      
      // Should show validation error or truncate
      cy.get('#feedback-title').should(($input) => {
        expect($input.val()?.toString().length).to.be.at.most(100)
      })

      // Test description character limit (500 chars)
      const longDescription = 'b'.repeat(501)
      cy.get('#feedback-description').type(longDescription)
      
      cy.get('#feedback-description').should(($textarea) => {
        expect($textarea.val()?.toString().length).to.be.at.most(500)
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      // Open modal
      cy.viewport('iphone-x')
      cy.get('button[aria-label*="menú"]').click()
      cy.get('button[aria-label*="feedback"]').click()
      
      // Check ARIA attributes
      cy.get('[role="dialog"]')
        .should('have.attr', 'aria-labelledby')
        .should('have.attr', 'aria-modal', 'true')

      // Check form labels exist
      cy.get('#feedback-title').should('have.attr', 'aria-required', 'true')
      cy.get('#feedback-type').should('be.visible')
      cy.get('#feedback-description').should('be.visible')
    })
  })

  describe('Multiple Modal Prevention', () => {
    it('prevents multiple modals from opening', () => {
      // Open modal with menu trigger
      cy.viewport('iphone-x')
      cy.get('button[aria-label*="menú"]').click()
      cy.get('button[aria-label*="feedback"]').click()
      
      cy.get('[role="dialog"]').should('be.visible')

      // Try to open another modal with footer trigger
      cy.scrollTo('bottom')
      cy.get('button[aria-label*="problema"]').click()

      // Should still have only one modal
      cy.get('[role="dialog"]').should('have.length', 1)
    })
  })
})