describe('Workout Registration Flow', () => {
  const testEmail = Cypress.env('TEST_EMAIL')
  const testPassword = Cypress.env('TEST_PASSWORD')

  beforeEach(() => {
    // Login before each test
    cy.login(testEmail, testPassword)
  })

  it('should navigate to workout registration page', () => {
    cy.visit('/')
    
    // Click on register workout link/button
    cy.get('[data-testid="register-workout-link"]').click()
    
    cy.url().should('include', '/register')
    cy.get('[data-testid="workout-form"]').should('be.visible')
  })

  it('should show workout form with all required fields', () => {
    cy.visit('/register')
    
    // Check all form elements exist
    cy.get('[data-testid="exercise-select"]').should('be.visible')
    cy.get('[data-testid="weight-input"]').should('be.visible')
    cy.get('[data-testid="reps-input"]').should('be.visible')
    cy.get('[data-testid="unit-select"]').should('be.visible')
    cy.get('[data-testid="submit-workout"]').should('be.visible')
    
    // Check exercise options
    cy.get('[data-testid="exercise-select"]').select('Clean')
    cy.get('[data-testid="exercise-select"]').should('have.value', 'Clean')
    
    // Check unit options
    cy.get('[data-testid="unit-select"]').select('lbs')
    cy.get('[data-testid="unit-select"]').should('have.value', 'lbs')
    cy.get('[data-testid="unit-select"]').select('kg')
    cy.get('[data-testid="unit-select"]').should('have.value', 'kg')
  })

  it('should validate form fields before submission', () => {
    cy.visit('/register')
    
    // Try to submit empty form
    cy.get('[data-testid="submit-workout"]').click()
    
    // Should show validation errors
    cy.contains('Selecciona un ejercicio').should('be.visible')
    cy.contains('El peso debe ser mayor a 0').should('be.visible')
    cy.contains('Las repeticiones deben ser mayor a 0').should('be.visible')
  })

  it('should register a direct 1RM workout (1 rep)', () => {
    cy.visit('/register')
    
    // Fill form for 1RM
    cy.selectExercise('Clean')
    cy.fillWeight(100)
    cy.fillReps(1)
    cy.get('[data-testid="unit-select"]').select('lbs')
    
    // Submit form
    cy.submitWorkout()
    
    // Should show success message
    cy.contains('Registro guardado exitosamente').should('be.visible')
    
    // Should clear form or redirect
    cy.get('[data-testid="weight-input"]').should('have.value', '')
  })

  it('should register a calculated 1RM workout (multiple reps)', () => {
    cy.visit('/register')
    
    // Fill form for calculated 1RM
    cy.selectExercise('Deadlift')
    cy.fillWeight(90)
    cy.fillReps(5)
    cy.get('[data-testid="unit-select"]').select('lbs')
    
    // Submit form
    cy.submitWorkout()
    
    // Should show success message
    cy.contains('Registro guardado exitosamente').should('be.visible')
    
    // Should show calculated 1RM info
    cy.contains('1RM calculado').should('be.visible')
  })

  it('should handle weight conversion from kg to lbs', () => {
    cy.visit('/register')
    
    // Fill form with kg
    cy.selectExercise('Snatch')
    cy.fillWeight(50)
    cy.fillReps(1)
    cy.get('[data-testid="unit-select"]').select('kg')
    
    // Submit form
    cy.submitWorkout()
    
    // Should show success message
    cy.contains('Registro guardado exitosamente').should('be.visible')
  })

  it('should show loading state during submission', () => {
    cy.visit('/register')
    
    // Fill form
    cy.selectExercise('Front Squat')
    cy.fillWeight(80)
    cy.fillReps(3)
    cy.get('[data-testid="unit-select"]').select('lbs')
    
    // Submit form
    cy.get('[data-testid="submit-workout"]').click()
    
    // Should show loading state
    cy.get('[data-testid="loading"]').should('be.visible')
    
    // Wait for completion
    cy.waitForLoading()
    cy.contains('Registro guardado exitosamente').should('be.visible')
  })

  it('should handle network errors gracefully', () => {
    // Intercept network request and force failure
    cy.intercept('POST', '**/workout_records', { forceNetworkError: true }).as('createWorkout')
    
    cy.visit('/register')
    
    // Fill and submit form
    cy.selectExercise('Back Squat')
    cy.fillWeight(120)
    cy.fillReps(2)
    cy.submitWorkout()
    
    // Should show error message
    cy.contains('Error al guardar el registro').should('be.visible')
  })

  it('should allow multiple workout registrations in sequence', () => {
    cy.visit('/register')
    
    // First workout
    cy.selectExercise('Clean')
    cy.fillWeight(95)
    cy.fillReps(1)
    cy.submitWorkout()
    cy.contains('Registro guardado exitosamente').should('be.visible')
    
    // Second workout
    cy.selectExercise('Snatch')
    cy.fillWeight(75)
    cy.fillReps(1)
    cy.submitWorkout()
    cy.contains('Registro guardado exitosamente').should('be.visible')
  })

  it('should navigate back to dashboard after registration', () => {
    cy.visit('/register')
    
    // Register workout
    cy.selectExercise('Deadlift')
    cy.fillWeight(150)
    cy.fillReps(1)
    cy.submitWorkout()
    
    // Navigate back to dashboard
    cy.get('[data-testid="back-to-dashboard"]').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})