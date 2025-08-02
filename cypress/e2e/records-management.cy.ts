describe('Records Management Flow', () => {
  const testEmail = Cypress.env('TEST_EMAIL')
  const testPassword = Cypress.env('TEST_PASSWORD')

  beforeEach(() => {
    // Login before each test
    cy.login(testEmail, testPassword)
  })

  it('should navigate to records page', () => {
    cy.visit('/')
    
    // Click on view records link
    cy.get('[data-testid="view-records-link"]').click()
    
    cy.url().should('include', '/records')
    cy.get('[data-testid="records-list"]').should('be.visible')
  })

  it('should display records list with proper structure', () => {
    cy.visit('/records')
    
    // Check if records list container exists
    cy.get('[data-testid="records-list"]').should('be.visible')
    
    // Check for filter and sort controls
    cy.get('[data-testid="exercise-filter"]').should('be.visible')
    cy.get('[data-testid="sort-controls"]').should('be.visible')
    
    // If records exist, check record structure
    cy.get('[data-testid="record-item"]').then(($records) => {
      if ($records.length > 0) {
        cy.get('[data-testid="record-item"]').first().within(() => {
          cy.get('[data-testid="record-exercise"]').should('be.visible')
          cy.get('[data-testid="record-weight"]').should('be.visible')
          cy.get('[data-testid="record-date"]').should('be.visible')
          cy.get('[data-testid="record-type"]').should('be.visible')
        })
      }
    })
  })

  it('should filter records by exercise', () => {
    cy.visit('/records')
    
    // Wait for records to load
    cy.waitForLoading()
    
    // Select Clean filter
    cy.get('[data-testid="exercise-filter"]').select('Clean')
    
    // All visible records should be Clean exercises
    cy.get('[data-testid="record-item"]').each(($record) => {
      cy.wrap($record).find('[data-testid="record-exercise"]').should('contain', 'Clean')
    })
    
    // Select Deadlift filter
    cy.get('[data-testid="exercise-filter"]').select('Deadlift')
    
    // All visible records should be Deadlift exercises
    cy.get('[data-testid="record-item"]').each(($record) => {
      cy.wrap($record).find('[data-testid="record-exercise"]').should('contain', 'Deadlift')
    })
    
    // Reset filter to show all
    cy.get('[data-testid="exercise-filter"]').select('Todos')
  })

  it('should sort records by date', () => {
    cy.visit('/records')
    cy.waitForLoading()
    
    // Click sort by date button
    cy.get('[data-testid="sort-by-date"]').click()
    
    // Check that records are sorted by date (most recent first)
    cy.get('[data-testid="record-date"]').then(($dates) => {
      const dates = Array.from($dates).map(el => new Date(el.textContent || ''))
      const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime())
      
      // Compare original with sorted
      dates.forEach((date, index) => {
        expect(date.getTime()).to.equal(sortedDates[index].getTime())
      })
    })
  })

  it('should sort records by weight', () => {
    cy.visit('/records')
    cy.waitForLoading()
    
    // Click sort by weight button
    cy.get('[data-testid="sort-by-weight"]').click()
    
    // Check that records are sorted by weight (highest first)
    cy.get('[data-testid="record-weight"]').then(($weights) => {
      const weights = Array.from($weights).map(el => {
        const text = el.textContent || ''
        return parseFloat(text.replace(/[^\d.]/g, ''))
      })
      
      const sortedWeights = [...weights].sort((a, b) => b - a)
      
      // Compare original with sorted
      weights.forEach((weight, index) => {
        expect(weight).to.equal(sortedWeights[index])
      })
    })
  })

  it('should show both weight units (lbs and kg)', () => {
    cy.visit('/records')
    cy.waitForLoading()
    
    // Check that records show both units
    cy.get('[data-testid="record-item"]').first().within(() => {
      cy.get('[data-testid="record-weight"]').should('contain', 'lbs')
      cy.get('[data-testid="record-weight"]').should('contain', 'kg')
    })
  })

  it('should indicate record type (direct vs calculated)', () => {
    cy.visit('/records')
    cy.waitForLoading()
    
    // Check that records show type indicator
    cy.get('[data-testid="record-item"]').each(($record) => {
      cy.wrap($record).find('[data-testid="record-type"]').should('exist')
      cy.wrap($record).find('[data-testid="record-type"]').should('contain.oneOf', ['1RM directo', '1RM calculado'])
    })
  })

  it('should combine filtering and sorting', () => {
    cy.visit('/records')
    cy.waitForLoading()
    
    // Filter by Clean
    cy.get('[data-testid="exercise-filter"]').select('Clean')
    
    // Sort by weight
    cy.get('[data-testid="sort-by-weight"]').click()
    
    // All records should be Clean and sorted by weight
    cy.get('[data-testid="record-item"]').each(($record) => {
      cy.wrap($record).find('[data-testid="record-exercise"]').should('contain', 'Clean')
    })
    
    // Check weight sorting within Clean records
    cy.get('[data-testid="record-weight"]').then(($weights) => {
      if ($weights.length > 1) {
        const weights = Array.from($weights).map(el => {
          const text = el.textContent || ''
          return parseFloat(text.replace(/[^\d.]/g, ''))
        })
        
        for (let i = 0; i < weights.length - 1; i++) {
          expect(weights[i]).to.be.at.least(weights[i + 1])
        }
      }
    })
  })

  it('should handle empty records state', () => {
    // Intercept API call to return empty results
    cy.intercept('GET', '**/workout_records*', { body: [] }).as('getRecords')
    
    cy.visit('/records')
    
    // Should show empty state message
    cy.contains('No hay registros').should('be.visible')
    cy.contains('Registra tu primer entrenamiento').should('be.visible')
  })

  it('should handle loading state', () => {
    // Intercept API call with delay
    cy.intercept('GET', '**/workout_records*', (req) => {
      req.reply((res) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(res), 1000)
        })
      })
    }).as('getRecords')
    
    cy.visit('/records')
    
    // Should show loading state
    cy.get('[data-testid="loading"]').should('be.visible')
    
    // Wait for loading to complete
    cy.wait('@getRecords')
    cy.waitForLoading()
  })

  it('should handle network errors when loading records', () => {
    // Intercept API call and force error
    cy.intercept('GET', '**/workout_records*', { forceNetworkError: true }).as('getRecords')
    
    cy.visit('/records')
    
    // Should show error message
    cy.contains('Error al cargar registros').should('be.visible')
    cy.get('[data-testid="retry-button"]').should('be.visible')
  })

  it('should allow retry after error', () => {
    // First intercept with error
    cy.intercept('GET', '**/workout_records*', { forceNetworkError: true }).as('getRecordsError')
    
    cy.visit('/records')
    cy.contains('Error al cargar registros').should('be.visible')
    
    // Then intercept with success
    cy.intercept('GET', '**/workout_records*', { fixture: 'workout_records.json' }).as('getRecordsSuccess')
    
    // Click retry
    cy.get('[data-testid="retry-button"]').click()
    
    // Should load successfully
    cy.wait('@getRecordsSuccess')
    cy.get('[data-testid="records-list"]').should('be.visible')
  })

  it('should navigate back to dashboard from records', () => {
    cy.visit('/records')
    
    // Click back to dashboard
    cy.get('[data-testid="back-to-dashboard"]').click()
    
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.get('[data-testid="dashboard"]').should('be.visible')
  })
})