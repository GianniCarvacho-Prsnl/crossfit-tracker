# E2E Testing with Cypress

This directory contains end-to-end tests for the CrossFit Tracker application using Cypress.

## Test Structure

### Test Files

- `auth.cy.ts` - Authentication flow tests (login, logout, session management)
- `workout-registration.cy.ts` - Workout registration form and validation tests
- `records-management.cy.ts` - Records filtering, sorting, and display tests
- `complete-user-journey.cy.ts` - Full user workflow integration tests

### Support Files

- `support/commands.ts` - Custom Cypress commands for common actions
- `support/e2e.ts` - Global configuration and setup
- `fixtures/workout_records.json` - Test data for mocking API responses

## Running Tests

### Prerequisites

1. Ensure the application is running locally:
   ```bash
   npm run dev
   ```

2. Set up test environment variables in `cypress.config.ts` or as environment variables:
   ```bash
   export CYPRESS_TEST_EMAIL="test@crossfittracker.com"
   export CYPRESS_TEST_PASSWORD="testpassword123"
   ```

### Running Tests Locally

```bash
# Run tests in headless mode
npm run test:e2e

# Open Cypress Test Runner (interactive mode)
npm run test:e2e:open
```

### Test Configuration

The tests are configured to:
- Run on mobile viewport (375x667) by default
- Use a test database/environment
- Include custom commands for common actions
- Handle loading states and network errors
- Test responsive design across different screen sizes

## Custom Commands

The following custom commands are available in tests:

- `cy.login(email, password)` - Login with credentials
- `cy.logout()` - Logout current user
- `cy.selectExercise(exercise)` - Select exercise from dropdown
- `cy.fillWeight(weight)` - Fill weight input field
- `cy.fillReps(reps)` - Fill repetitions input field
- `cy.submitWorkout()` - Submit workout form
- `cy.waitForLoading()` - Wait for loading states to complete

## Test Data Requirements

### Test User Setup

For the tests to run successfully, you need a test user in your Supabase database:

```sql
-- Create test user (this should be done through Supabase Auth)
-- Email: test@crossfittracker.com
-- Password: testpassword123
```

### Database State

Tests assume:
- Clean database state before each test suite
- Ability to create/read workout records
- Proper RLS policies configured
- All 5 exercises available in the exercises table

## Test Coverage

The E2E tests cover:

### Authentication (auth.cy.ts)
- ✅ Redirect unauthenticated users to login
- ✅ Login form validation
- ✅ Invalid credentials handling
- ✅ Successful login flow
- ✅ Logout functionality
- ✅ Session persistence across page refreshes
- ✅ Registration page access

### Workout Registration (workout-registration.cy.ts)
- ✅ Navigation to registration page
- ✅ Form field validation
- ✅ Direct 1RM registration (1 rep)
- ✅ Calculated 1RM registration (multiple reps)
- ✅ Unit conversion (kg to lbs)
- ✅ Loading states during submission
- ✅ Network error handling
- ✅ Multiple workout registrations
- ✅ Navigation back to dashboard

### Records Management (records-management.cy.ts)
- ✅ Navigation to records page
- ✅ Records list display structure
- ✅ Exercise filtering
- ✅ Date sorting
- ✅ Weight sorting
- ✅ Dual unit display (lbs/kg)
- ✅ Record type indicators (direct/calculated)
- ✅ Combined filtering and sorting
- ✅ Empty state handling
- ✅ Loading state handling
- ✅ Network error handling and retry

### Complete User Journey (complete-user-journey.cy.ts)
- ✅ Full workflow: login → register → view → logout
- ✅ Mobile navigation
- ✅ Offline/network error scenarios
- ✅ Form validation edge cases
- ✅ Mockup pages display
- ✅ Responsive design across screen sizes

## Debugging Tests

### Common Issues

1. **Test user doesn't exist**: Ensure test user is created in Supabase Auth
2. **Database permissions**: Verify RLS policies allow test user operations
3. **Network timeouts**: Increase timeout values in cypress.config.ts
4. **Element not found**: Check data-testid attributes in components

### Debug Mode

Run tests with debug information:
```bash
DEBUG=cypress:* npm run test:e2e
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots in `cypress/screenshots/`
- Videos in `cypress/videos/` (if enabled)

## CI/CD Integration

Tests run automatically in GitHub Actions on:
- Push to main/develop branches
- Pull requests to main branch

See `.github/workflows/e2e-tests.yml` for CI configuration.

## Best Practices

1. **Data-testid attributes**: Use `data-testid` for reliable element selection
2. **Wait for loading**: Always wait for loading states to complete
3. **Network mocking**: Mock API responses for consistent test results
4. **Mobile-first**: Test mobile viewport as primary use case
5. **Error scenarios**: Test both success and failure paths
6. **Clean state**: Ensure tests don't depend on previous test state

## Maintenance

### Adding New Tests

1. Create test file in `cypress/e2e/`
2. Use existing custom commands when possible
3. Add new custom commands to `support/commands.ts` if needed
4. Update this README with new test coverage

### Updating Test Data

1. Modify `fixtures/workout_records.json` for mock data
2. Update test user credentials in environment variables
3. Ensure database schema changes are reflected in tests