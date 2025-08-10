describe('User Settings Complete Flow', () => {
  const testEmail = Cypress.env('TEST_EMAIL')
  const testPassword = Cypress.env('TEST_PASSWORD')

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.login(testEmail, testPassword)
  })

  it('should complete full user settings workflow', () => {
    // Step 1: Access user settings menu
    cy.get('[data-testid="user-profile-button"]').should('be.visible')
    cy.get('[data-testid="user-profile-button"]').click()
    
    // Verify menu opens
    cy.get('[data-testid="user-settings-menu"]').should('be.visible')
    cy.get('[data-testid="settings-profile"]').should('be.visible')
    cy.get('[data-testid="settings-personal-data"]').should('be.visible')
    cy.get('[data-testid="settings-app-preferences"]').should('be.visible')
    cy.get('[data-testid="settings-exercise-management"]').should('be.visible')
    cy.get('[data-testid="settings-security"]').should('be.visible')
    cy.get('[data-testid="settings-training"]').should('be.visible')

    // Step 2: Test Profile Section
    cy.get('[data-testid="settings-profile"]').click()
    cy.get('[data-testid="user-settings-modal"]').should('be.visible')
    cy.get('[data-testid="profile-section"]').should('be.visible')
    
    // Update display name
    cy.get('[data-testid="display-name-input"]').clear().type('Test User Updated')
    cy.get('[data-testid="save-profile-button"]').click()
    cy.contains('Perfil actualizado exitosamente').should('be.visible')

    // Step 3: Test Personal Data Section
    cy.get('[data-testid="nav-personal-data"]').click()
    cy.get('[data-testid="personal-data-section"]').should('be.visible')
    
    // Update weight and height
    cy.get('[data-testid="weight-input"]').clear().type('75')
    cy.get('[data-testid="height-input"]').clear().type('175')
    cy.get('[data-testid="gender-select"]').select('male')
    cy.get('[data-testid="experience-select"]').select('intermediate')
    cy.get('[data-testid="save-personal-data-button"]').click()
    cy.contains('Datos personales actualizados').should('be.visible')

    // Step 4: Test App Preferences Section
    cy.get('[data-testid="nav-app-preferences"]').click()
    cy.get('[data-testid="app-preferences-section"]').should('be.visible')
    
    // Change units
    cy.get('[data-testid="units-toggle"]').click()
    cy.contains('Unidades cambiadas a imperial').should('be.visible')
    
    // Change theme
    cy.get('[data-testid="theme-toggle"]').click()
    cy.get('body').should('have.class', 'dark')
    
    // Change language
    cy.get('[data-testid="language-select"]').select('en')
    cy.contains('Language updated').should('be.visible')

    // Step 5: Test Exercise Management Section
    cy.get('[data-testid="nav-exercise-management"]').click()
    cy.get('[data-testid="exercise-management-section"]').should('be.visible')
    
    // Add new exercise
    cy.get('[data-testid="add-exercise-button"]').click()
    cy.get('[data-testid="exercise-name-input"]').type('Test Exercise')
    cy.get('[data-testid="save-exercise-button"]').click()
    cy.contains('Ejercicio agregado exitosamente').should('be.visible')
    
    // Verify exercise appears in list
    cy.get('[data-testid="exercise-list"]').should('contain', 'Test Exercise')

    // Step 6: Test Training Section
    cy.get('[data-testid="nav-training"]').click()
    cy.get('[data-testid="training-section"]').should('be.visible')
    
    // Set exercise goal
    cy.get('[data-testid="exercise-goal-select"]').select('Clean')
    cy.get('[data-testid="target-weight-input"]').type('120')
    cy.get('[data-testid="target-date-input"]').type('2024-12-31')
    cy.get('[data-testid="save-goal-button"]').click()
    cy.contains('Meta establecida exitosamente').should('be.visible')

    // Step 7: Test Security Section
    cy.get('[data-testid="nav-security"]').click()
    cy.get('[data-testid="security-section"]').should('be.visible')
    
    // Test data export
    cy.get('[data-testid="export-data-button"]').click()
    cy.contains('Exportando datos').should('be.visible')
    cy.contains('Datos exportados exitosamente').should('be.visible', { timeout: 10000 })

    // Step 8: Close modal and verify changes persist
    cy.get('[data-testid="close-modal-button"]').click()
    cy.get('[data-testid="user-settings-modal"]').should('not.exist')
    
    // Verify display name updated in navigation
    cy.get('[data-testid="user-profile-button"]').should('contain', 'Test User Updated')
    
    // Verify theme persisted
    cy.get('body').should('have.class', 'dark')
  })

  it('should handle mobile user settings flow', () => {
    cy.viewport(375, 667)
    
    // Access settings on mobile
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="user-settings-menu"]').should('be.visible')
    
    // Test mobile modal
    cy.get('[data-testid="settings-profile"]').click()
    cy.get('[data-testid="user-settings-modal"]').should('be.visible')
    cy.get('[data-testid="user-settings-modal"]').should('have.css', 'width').and('match', /100%|375px/)
    
    // Test mobile navigation
    cy.get('[data-testid="mobile-section-nav"]').should('be.visible')
    cy.get('[data-testid="nav-personal-data"]').click()
    cy.get('[data-testid="personal-data-section"]').should('be.visible')
    
    // Test touch-friendly inputs
    cy.get('[data-testid="weight-input"]').should('have.css', 'min-height').and('match', /44px|48px/)
    cy.get('[data-testid="height-input"]').should('have.css', 'min-height').and('match', /44px|48px/)
  })

  it('should handle keyboard navigation', () => {
    // Open settings with keyboard
    cy.get('[data-testid="user-profile-button"]').focus().type('{enter}')
    cy.get('[data-testid="user-settings-menu"]').should('be.visible')
    
    // Navigate with Tab
    cy.get('[data-testid="settings-profile"]').focus().type('{enter}')
    cy.get('[data-testid="user-settings-modal"]').should('be.visible')
    
    // Test Escape key closes modal
    cy.get('body').type('{esc}')
    cy.get('[data-testid="user-settings-modal"]').should('not.exist')
    
    // Test Tab navigation within modal
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    cy.get('[data-testid="display-name-input"]').focus()
    cy.get('[data-testid="display-name-input"]').tab()
    cy.focused().should('have.attr', 'data-testid', 'save-profile-button')
  })

  it('should handle error scenarios gracefully', () => {
    // Simulate network error during profile update
    cy.intercept('PUT', '**/user_profiles/*', { forceNetworkError: true }).as('profileUpdateError')
    
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    cy.get('[data-testid="display-name-input"]').clear().type('Error Test')
    cy.get('[data-testid="save-profile-button"]').click()
    
    cy.contains('Error al actualizar perfil').should('be.visible')
    cy.get('[data-testid="retry-button"]').should('be.visible')
    
    // Test retry functionality
    cy.intercept('PUT', '**/user_profiles/*', { statusCode: 200, body: { success: true } }).as('profileUpdateSuccess')
    cy.get('[data-testid="retry-button"]').click()
    cy.contains('Perfil actualizado exitosamente').should('be.visible')
  })

  it('should validate form inputs properly', () => {
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-personal-data"]').click()
    
    // Test invalid weight
    cy.get('[data-testid="weight-input"]').clear().type('-10')
    cy.get('[data-testid="save-personal-data-button"]').click()
    cy.contains('El peso debe ser un valor positivo').should('be.visible')
    
    // Test invalid height
    cy.get('[data-testid="weight-input"]').clear().type('75')
    cy.get('[data-testid="height-input"]').clear().type('0')
    cy.get('[data-testid="save-personal-data-button"]').click()
    cy.contains('La altura debe ser mayor a 0').should('be.visible')
    
    // Test valid inputs
    cy.get('[data-testid="height-input"]').clear().type('175')
    cy.get('[data-testid="save-personal-data-button"]').click()
    cy.contains('Datos personales actualizados').should('be.visible')
  })

  it('should maintain data consistency across sections', () => {
    // Set weight in personal data
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-personal-data"]').click()
    cy.get('[data-testid="weight-input"]').clear().type('80')
    cy.get('[data-testid="save-personal-data-button"]').click()
    
    // Change units in app preferences
    cy.get('[data-testid="nav-app-preferences"]').click()
    cy.get('[data-testid="units-toggle"]').click()
    
    // Go back to personal data and verify conversion
    cy.get('[data-testid="nav-personal-data"]').click()
    cy.get('[data-testid="weight-input"]').should('have.value', '176') // 80kg ≈ 176lbs
    cy.get('[data-testid="weight-unit-display"]').should('contain', 'lbs')
  })

  it('should handle concurrent user sessions', () => {
    // Open settings in first session
    cy.get('[data-testid="user-profile-button"]').click()
    cy.get('[data-testid="settings-profile"]').click()
    
    // Simulate another session updating the same data
    cy.window().then((win) => {
      // Simulate real-time update from another session
      win.dispatchEvent(new CustomEvent('supabase-realtime-update', {
        detail: { table: 'user_profiles', eventType: 'UPDATE' }
      }))
    })
    
    // Should show notification about external changes
    cy.contains('Datos actualizados por otra sesión').should('be.visible')
    cy.get('[data-testid="refresh-data-button"]').should('be.visible')
  })
})