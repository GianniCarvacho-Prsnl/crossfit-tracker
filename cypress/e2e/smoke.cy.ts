describe('Smoke Test', () => {
  it('should load the application', () => {
    cy.visit('/')
    
    // Should redirect to login for unauthenticated users
    cy.url().should('include', '/login')
    
    // Should show login form
    cy.contains('Iniciar Sesión').should('be.visible')
    cy.get('[data-testid="email-input"]').should('be.visible')
    cy.get('[data-testid="password-input"]').should('be.visible')
    cy.get('[data-testid="login-button"]').should('be.visible')
  })

  it('should have proper page title and meta tags', () => {
    cy.visit('/')
    
    cy.title().should('contain', 'CrossFit Tracker')
    cy.get('meta[name="description"]').should('exist')
    cy.get('meta[name="viewport"]').should('exist')
  })

  it('should be responsive', () => {
    // Test mobile viewport
    cy.viewport(375, 667)
    cy.visit('/')
    cy.get('[data-testid="login-form"]').should('be.visible')
    
    // Test tablet viewport
    cy.viewport(768, 1024)
    cy.get('[data-testid="login-form"]').should('be.visible')
    
    // Test desktop viewport
    cy.viewport(1200, 800)
    cy.get('[data-testid="login-form"]').should('be.visible')
  })
})