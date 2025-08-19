// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Supabase
const mockUser = { id: '123', email: 'test@example.com' }
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(() => Promise.resolve({ 
      data: { user: mockUser }, 
      error: null 
    })),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  },
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ 
          data: { id: '123', type: 'bug', title: 'Test', description: 'Test' }, 
          error: null 
        }))
      }))
    }))
  }))
}

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}))

// Export for test access
global.mockSupabaseClient = mockSupabaseClient
global.mockUser = mockUser

// Mock feedback service
jest.mock('@/services/feedbackService', () => ({
  submitFeedback: jest.fn(() => Promise.resolve({ 
    success: true, 
    data: { id: '123' } 
  }))
}))