import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ErrorDisplay, { ErrorToast } from '@/components/ui/ErrorDisplay'
import { ErrorType, AppError } from '@/utils/errorHandling'

const mockNetworkError: AppError = {
  type: ErrorType.NETWORK,
  message: 'Network failed',
  retryable: true,
  userMessage: 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.'
}

const mockValidationError: AppError = {
  type: ErrorType.VALIDATION,
  message: 'Validation failed',
  retryable: false,
  userMessage: 'Los datos ingresados no son válidos.'
}

describe('ErrorDisplay', () => {
  it('should not render when error is null', () => {
    const { container } = render(<ErrorDisplay error={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render string errors', () => {
    render(<ErrorDisplay error="Simple error message" />)
    
    expect(screen.getByText('Simple error message')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('should render Error objects', () => {
    const error = new Error('Test error')
    render(<ErrorDisplay error={error} />)
    
    expect(screen.getByText(/Ha ocurrido un error inesperado/)).toBeInTheDocument()
  })

  it('should render AppError objects', () => {
    render(<ErrorDisplay error={mockNetworkError} />)
    
    expect(screen.getByText('Error de conexión')).toBeInTheDocument()
    expect(screen.getByText(mockNetworkError.userMessage)).toBeInTheDocument()
  })

  it('should show retry button for retryable errors', () => {
    const onRetry = jest.fn()
    render(<ErrorDisplay error={mockNetworkError} onRetry={onRetry} />)
    
    const retryButton = screen.getByText('Reintentar')
    expect(retryButton).toBeInTheDocument()
    
    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalled()
  })

  it('should not show retry button for non-retryable errors', () => {
    render(<ErrorDisplay error={mockValidationError} />)
    
    expect(screen.queryByText('Reintentar')).not.toBeInTheDocument()
  })

  it('should show dismiss button when onDismiss is provided', () => {
    const onDismiss = jest.fn()
    render(<ErrorDisplay error={mockNetworkError} onDismiss={onDismiss} />)
    
    const dismissButton = screen.getByText('Cerrar')
    expect(dismissButton).toBeInTheDocument()
    
    fireEvent.click(dismissButton)
    expect(onDismiss).toHaveBeenCalled()
  })

  it('should show X button for dismissing', () => {
    const onDismiss = jest.fn()
    render(<ErrorDisplay error={mockNetworkError} onDismiss={onDismiss} />)
    
    const xButton = screen.getByLabelText('Cerrar error')
    expect(xButton).toBeInTheDocument()
    
    fireEvent.click(xButton)
    expect(onDismiss).toHaveBeenCalled()
  })

  it('should render inline variant correctly', () => {
    render(<ErrorDisplay error={mockNetworkError} variant="inline" />)
    
    // Should still show the error message but in inline format
    expect(screen.getByText(mockNetworkError.userMessage)).toBeInTheDocument()
  })

  it('should render banner variant correctly', () => {
    render(<ErrorDisplay error={mockNetworkError} variant="banner" />)
    
    expect(screen.getByText('Error de conexión')).toBeInTheDocument()
    expect(screen.getByText(mockNetworkError.userMessage)).toBeInTheDocument()
  })

  it('should hide retry button when showRetry is false', () => {
    render(<ErrorDisplay error={mockNetworkError} showRetry={false} />)
    
    expect(screen.queryByText('Reintentar')).not.toBeInTheDocument()
  })
})

describe('ErrorToast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should render error toast', () => {
    const onDismiss = jest.fn()
    render(<ErrorToast error={mockNetworkError} onDismiss={onDismiss} />)
    
    expect(screen.getByText('Error de conexión')).toBeInTheDocument()
    expect(screen.getByText(mockNetworkError.userMessage)).toBeInTheDocument()
  })

  it('should auto-dismiss after duration', async () => {
    const onDismiss = jest.fn()
    render(
      <ErrorToast 
        error={mockNetworkError} 
        onDismiss={onDismiss} 
        duration={1000}
      />
    )
    
    expect(onDismiss).not.toHaveBeenCalled()
    
    // Fast-forward time
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalled()
    })
  })

  it('should not auto-dismiss when autoHide is false', () => {
    const onDismiss = jest.fn()
    render(
      <ErrorToast 
        error={mockNetworkError} 
        onDismiss={onDismiss} 
        autoHide={false}
      />
    )
    
    jest.advanceTimersByTime(5000)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('should allow manual dismissal', () => {
    const onDismiss = jest.fn()
    render(<ErrorToast error={mockNetworkError} onDismiss={onDismiss} />)
    
    const dismissButton = screen.getByLabelText('Cerrar error')
    fireEvent.click(dismissButton)
    
    expect(onDismiss).toHaveBeenCalled()
  })
})