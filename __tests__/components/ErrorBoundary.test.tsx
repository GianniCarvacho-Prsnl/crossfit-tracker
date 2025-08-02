import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, withErrorBoundary } from '@/components/error/ErrorBoundary'

// Mock console.error to avoid noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
    expect(screen.getByText(/Ha ocurrido un error inesperado/)).toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument()
  })

  it('should reset error state when retry is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    // Error should be displayed
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
    expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument()
    
    // Click retry button to reset error state
    fireEvent.click(screen.getByText('Intentar de nuevo'))
    
    // After retry, the error boundary should attempt to render children again
    // Since our test component still throws, it should show the error again
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
  })

  it('should allow page reload', () => {
    // Mock window.location.reload
    const mockReload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    })
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    fireEvent.click(screen.getByText('Recargar página'))
    expect(mockReload).toHaveBeenCalled()
  })

  it('should show error details in development', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Detalles del error (desarrollo)')).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('should not show error details in production', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.queryByText('Detalles del error (desarrollo)')).not.toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })
})

describe('withErrorBoundary HOC', () => {
  it('should wrap component with ErrorBoundary', () => {
    const TestComponent = () => <div>Test component</div>
    const WrappedComponent = withErrorBoundary(TestComponent)
    
    render(<WrappedComponent />)
    
    expect(screen.getByText('Test component')).toBeInTheDocument()
  })

  it('should catch errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowError)
    
    render(<WrappedComponent shouldThrow={true} />)
    
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
  })

  it('should use custom fallback in HOC', () => {
    const customFallback = <div>HOC custom error</div>
    const WrappedComponent = withErrorBoundary(ThrowError, customFallback)
    
    render(<WrappedComponent shouldThrow={true} />)
    
    expect(screen.getByText('HOC custom error')).toBeInTheDocument()
  })
})