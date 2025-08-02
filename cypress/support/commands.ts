/// <reference types="cypress" />

// Custom commands for CrossFit Tracker E2E tests

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with email and password
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to select an exercise from dropdown
       * @example cy.selectExercise('Clean')
       */
      selectExercise(exercise: string): Chainable<void>
      
      /**
       * Custom command to fill weight input
       * @example cy.fillWeight(100)
       */
      fillWeight(weight: number): Chainable<void>
      
      /**
       * Custom command to fill repetitions input
       * @example cy.fillReps(5)
       */
      fillReps(reps: number): Chainable<void>
      
      /**
       * Custom command to submit workout form
       * @example cy.submitWorkout()
       */
      submitWorkout(): Chainable<void>
      
      /**
       * Custom command to wait for loading to complete
       * @example cy.waitForLoading()
       */
      waitForLoading(): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('not.include', '/login')
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/login')
})

// Select exercise command
Cypress.Commands.add('selectExercise', (exercise: string) => {
  cy.get('[data-testid="exercise-select"]').select(exercise)
})

// Fill weight command
Cypress.Commands.add('fillWeight', (weight: number) => {
  cy.get('[data-testid="weight-input"]').clear().type(weight.toString())
})

// Fill repetitions command
Cypress.Commands.add('fillReps', (reps: number) => {
  cy.get('[data-testid="reps-input"]').clear().type(reps.toString())
})

// Submit workout command
Cypress.Commands.add('submitWorkout', () => {
  cy.get('[data-testid="submit-workout"]').click()
})

// Wait for loading command
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading"]').should('not.exist')
})

export {}