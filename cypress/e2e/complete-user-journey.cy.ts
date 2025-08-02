describe('Complete User Journey', () => {
  const testEmail = Cypress.env('TEST_EMAIL')
  const testPassword = Cypress.env('TEST_PASSWORD')

  beforeEach(() => {
    // Clear any existing session
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should complete full user workflow: login -> register workout -> view records -> logout', () => {
    // Step 1: Login
    cy.visit('/')
    cy.url().should('include', '/login')
    
    cy.get('[data-testid="email-input"]').type(testEmail)
    cy.get('[data-testid="password-input"]').type(testPassword)
    cy.get('[data-testid="login-button"]').click()
    
    // Should be on dashboard
    cy.url().should('not.include', '/login')
    cy.get('[data-testid="dashboard"]').should('be.visible')
    
    // Step 2: Navigate to register workout
    cy.get('[data-testid="register-workout-link"]').click()
    cy.url().should('include', '/register')
    
    // Step 3: Register a workout
    cy.selectExercise('Clean')
    cy.fillWeight(105)
    cy.fillReps(1)
    cy.get('[data-testid="unit-select"]').select('lbs')
    cy.submitWorkout()
    
    cy.contains('Registro guardado exitosamente').should('be.visible')
    
    // Step 4: Register another workout with calculation
    cy.selectExercise('Deadlift')
    cy.fillWeight(90)
    cy.fillReps(5)
    cy.submitWorkout()
    
    cy.contains('Registro guardado exitosamente').should('be.visible')
    cy.contains('1RM calculado').should('be.visible')
    
    // Step 5: Navigate to records
    cy.get('[data-testid="view-records-link"]').click()
    cy.url().should('include', '/records')
    
    // Step 6: Verify records are displayed
    cy.waitForLoading()
    cy.get('[data-testid="records-list"]').should('be.visible')
    cy.get('[data-testid="record-item"]').should('have.length.at.least', 2)
    
    // Step 7: Test filtering
    cy.get('[data-testid="exercise-filter"]').select('Clean')
    cy.get('[data-testid="record-item"]').should('contain', 'Clean')
    
    // Step 8: Test sorting
    cy.get('[data-testid="exercise-filter"]').select('Todos')
    cy.get('[data-testid="sort-by-weight"]').click()
    
    // Step 9: Navigate back to dashboard
    cy.get('[data-testid="back-to-dashboard"]').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Step 10: Check dashboard shows recent records
    cy.get('[data-testid="recent-records"]').should('be.visible')
    
    // Step 11: Test navigation menu
    cy.get('[data-testid="menu-toggle"]').click()
    cy.get('[data-testid="nav-menu"]').should('be.visible')
    
    // Step 12: Logout
    cy.logout()
    cy.url().should('include', '/login')
  })

  it('should handle mobile navigation properly', () => {
    // Set mobile viewport
    cy.viewport(375, 667)
    
    cy.login(testEmail, testPassword)
    
    // Test mobile menu
    cy.get('[data-testid="menu-toggle"]').should('be.visible')
    cy.get('[data-testid="menu-toggle"]').click()
    
    cy.get('[data-testid="nav-menu"]').should('be.visible')
    cy.get('[data-testid="nav-register"]').should('be.visible')
    cy.get('[data-testid="nav-records"]').should('be.visible')
    cy.get('[data-testid="nav-conversions"]').should('be.visible')
    cy.get('[data-testid="nav-percentages"]').should('be.visible')
    
    // Navigate using mobile menu
    cy.get('[data-testid="nav-register"]').click()
    cy.url().should('include', '/register')
    
    // Form should be mobile-friendly
    cy.get('[data-testid="workout-form"]').should('be.visible')
    cy.get('[data-testid="exercise-select"]').should('have.css', 'min-height', '44px')
  })

  it('should handle offline/network error scenarios', () => {
    cy.login(testEmail, testPassword)
    
    // Simulate network failure during workout registration
    cy.visit('/register')
    cy.intercept('POST', '**/workout_records', { forceNetworkError: true }).as('createWorkoutError')
    
    cy.selectExercise('Snatch')
    cy.fillWeight(75)
    cy.fillReps(1)
    cy.submitWorkout()
    
    // Should show error message
    cy.contains('Error al guardar el registro').should('be.visible')
    
    // Restore network and retry
    cy.intercept('POST', '**/workout_records', { statusCode: 201, body: { id: 'new-record' } }).as('createWorkoutSuccess')
    
    cy.get('[data-testid="retry-button"]').click()
    cy.contains('Registro guardado exitosamente').should('be.visible')
  })

  it('should validate all form inputs properly', () => {
    cy.login(testEmail, testPassword)
    cy.visit('/register')
    
    // Test empty form validation
    cy.submitWorkout()
    cy.contains('Selecciona un ejercicio').should('be.visible')
    cy.contains('El peso debe ser mayor a 0').should('be.visible')
    cy.contains('Las repeticiones deben ser mayor a 0').should('be.visible')
    
    // Test invalid weight
    cy.selectExercise('Clean')
    cy.fillWeight(-10)
    cy.fillReps(1)
    cy.submitWorkout()
    cy.contains('El peso debe ser mayor a 0').should('be.visible')
    
    // Test invalid reps
    cy.fillWeight(100)
    cy.fillReps(0)
    cy.submitWorkout()
    cy.contains('Las repeticiones deben ser mayor a 0').should('be.visible')
    
    // Test valid form
    cy.fillReps(1)
    cy.submitWorkout()
    cy.contains('Registro guardado exitosamente').should('be.visible')
  })

  it('should display mockup pages correctly', () => {
    cy.login(testEmail, testPassword)
    
    // Test conversions mockup
    cy.visit('/conversions')
    cy.contains('Conversiones de Peso').should('be.visible')
    cy.contains('Esta funcionalidad estará disponible próximamente').should('be.visible')
    cy.get('[data-testid="conversion-mockup"]').should('be.visible')
    
    // Test percentages mockup
    cy.visit('/percentages')
    cy.contains('Porcentajes de RM').should('be.visible')
    cy.contains('Esta funcionalidad estará disponible próximamente').should('be.visible')
    cy.get('[data-testid="percentage-mockup"]').should('be.visible')
  })

  it('should maintain responsive design across different screen sizes', () => {
    cy.login(testEmail, testPassword)
    
    // Test mobile
    cy.viewport(375, 667)
    cy.visit('/register')
    cy.get('[data-testid="workout-form"]').should('be.visible')
    
    // Test tablet
    cy.viewport(768, 1024)
    cy.get('[data-testid="workout-form"]').should('be.visible')
    
    // Test desktop
    cy.viewport(1200, 800)
    cy.get('[data-testid="workout-form"]').should('be.visible')
    
    // Navigation should adapt
    cy.get('[data-testid="navigation"]').should('be.visible')
  })
})