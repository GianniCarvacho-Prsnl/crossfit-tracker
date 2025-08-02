describe('Authentication Flow', () => {
  const testEmail = Cypress.env('TEST_EMAIL')
  const testPassword = Cypress.env('TEST_PASSWORD')

  beforeEach(() => {
    // Clear any existing session
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
    cy.contains('Iniciar Sesión').should('be.visible')
  })

  it('should show login form with required fields', () => {
    cy.visit('/login')
    
    // Check form elements exist
    cy.get('[data-testid="email-input"]').should('be.visible')
    cy.get('[data-testid="password-input"]').should('be.visible')
    cy.get('[data-testid="login-button"]').should('be.visible')
    
    // Check form validation
    cy.get('[data-testid="login-button"]').click()
    cy.contains('Email es requerido').should('be.visible')
  })

  it('should handle invalid login credentials', () => {
    cy.visit('/login')
    
    cy.get('[data-testid="email-input"]').type('invalid@email.com')
    cy.get('[data-testid="password-input"]').type('wrongpassword')
    cy.get('[data-testid="login-button"]').click()
    
    // Should show error message
    cy.contains('Credenciales inválidas').should('be.visible')
    cy.url().should('include', '/login')
  })

  it('should successfully login with valid credentials', () => {
    // Note: This test requires a test user to exist in Supabase
    // In a real scenario, you'd set up test data or use a test database
    cy.visit('/login')
    
    cy.get('[data-testid="email-input"]').type(testEmail)
    cy.get('[data-testid="password-input"]').type(testPassword)
    cy.get('[data-testid="login-button"]').click()
    
    // Should redirect to dashboard
    cy.url().should('not.include', '/login')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Should show authenticated content
    cy.get('[data-testid="dashboard"]').should('be.visible')
    cy.get('[data-testid="logout-button"]').should('be.visible')
  })

  it('should successfully logout', () => {
    // Login first
    cy.login(testEmail, testPassword)
    
    // Then logout
    cy.logout()
    
    // Should redirect to login
    cy.url().should('include', '/login')
    cy.get('[data-testid="login-button"]').should('be.visible')
  })

  it('should maintain session across page refreshes', () => {
    cy.login(testEmail, testPassword)
    
    // Refresh the page
    cy.reload()
    
    // Should still be authenticated
    cy.url().should('not.include', '/login')
    cy.get('[data-testid="dashboard"]').should('be.visible')
  })

  it('should show registration option', () => {
    cy.visit('/login')
    
    // Check if there's a link to registration
    cy.contains('Crear cuenta').should('be.visible')
    cy.contains('Crear cuenta').click()
    
    cy.url().should('include', '/register')
    cy.get('[data-testid="register-form"]').should('be.visible')
  })
})