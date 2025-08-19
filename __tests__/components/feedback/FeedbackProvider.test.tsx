import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { FeedbackProvider, useFeedback } from '@/components/feedback/FeedbackProvider'

describe('FeedbackProvider', () => {
  it('renders children correctly', () => {
    render(
      <FeedbackProvider>
        <div data-testid="test-child">Test Child</div>
      </FeedbackProvider>
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('provides initial context values', () => {
    const TestComponent = () => {
      const { isModalOpen, openModal, closeModal } = useFeedback()
      return (
        <div>
          <span data-testid="modal-state">{isModalOpen.toString()}</span>
          <button data-testid="open-button" onClick={openModal}>
            Open
          </button>
          <button data-testid="close-button" onClick={closeModal}>
            Close
          </button>
        </div>
      )
    }

    render(
      <FeedbackProvider>
        <TestComponent />
      </FeedbackProvider>
    )

    expect(screen.getByTestId('modal-state')).toHaveTextContent('false')
    expect(screen.getByTestId('open-button')).toBeInTheDocument()
    expect(screen.getByTestId('close-button')).toBeInTheDocument()
  })

  it('opens modal when openModal is called', () => {
    const TestComponent = () => {
      const { isModalOpen, openModal } = useFeedback()
      return (
        <div>
          <span data-testid="modal-state">{isModalOpen.toString()}</span>
          <button data-testid="open-button" onClick={openModal}>
            Open
          </button>
        </div>
      )
    }

    render(
      <FeedbackProvider>
        <TestComponent />
      </FeedbackProvider>
    )

    expect(screen.getByTestId('modal-state')).toHaveTextContent('false')

    act(() => {
      screen.getByTestId('open-button').click()
    })

    expect(screen.getByTestId('modal-state')).toHaveTextContent('true')
  })

  it('closes modal when closeModal is called', () => {
    const TestComponent = () => {
      const { isModalOpen, openModal, closeModal } = useFeedback()
      return (
        <div>
          <span data-testid="modal-state">{isModalOpen.toString()}</span>
          <button data-testid="open-button" onClick={openModal}>
            Open
          </button>
          <button data-testid="close-button" onClick={closeModal}>
            Close
          </button>
        </div>
      )
    }

    render(
      <FeedbackProvider>
        <TestComponent />
      </FeedbackProvider>
    )

    // First open the modal
    act(() => {
      screen.getByTestId('open-button').click()
    })
    expect(screen.getByTestId('modal-state')).toHaveTextContent('true')

    // Then close it
    act(() => {
      screen.getByTestId('close-button').click()
    })
    expect(screen.getByTestId('modal-state')).toHaveTextContent('false')
  })

  it('handles multiple open/close cycles correctly', () => {
    const TestComponent = () => {
      const { isModalOpen, openModal, closeModal } = useFeedback()
      return (
        <div>
          <span data-testid="modal-state">{isModalOpen.toString()}</span>
          <button data-testid="open-button" onClick={openModal}>
            Open
          </button>
          <button data-testid="close-button" onClick={closeModal}>
            Close
          </button>
        </div>
      )
    }

    render(
      <FeedbackProvider>
        <TestComponent />
      </FeedbackProvider>
    )

    // Initial state
    expect(screen.getByTestId('modal-state')).toHaveTextContent('false')

    // Open -> Close -> Open -> Close cycle
    act(() => {
      screen.getByTestId('open-button').click()
    })
    expect(screen.getByTestId('modal-state')).toHaveTextContent('true')

    act(() => {
      screen.getByTestId('close-button').click()
    })
    expect(screen.getByTestId('modal-state')).toHaveTextContent('false')

    act(() => {
      screen.getByTestId('open-button').click()
    })
    expect(screen.getByTestId('modal-state')).toHaveTextContent('true')

    act(() => {
      screen.getByTestId('close-button').click()
    })
    expect(screen.getByTestId('modal-state')).toHaveTextContent('false')
  })
})

describe('useFeedback hook', () => {
  it('throws error when used outside FeedbackProvider', () => {
    const TestComponent = () => {
      useFeedback()
      return <div>Test</div>
    }

    // Suppress console.error for this test since we expect an error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useFeedback must be used within a FeedbackProvider')

    consoleSpy.mockRestore()
  })

  it('returns correct context values when used within provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeedbackProvider>{children}</FeedbackProvider>
    )

    const { result } = renderHook(() => useFeedback(), { wrapper })

    expect(result.current.isModalOpen).toBe(false)
    expect(typeof result.current.openModal).toBe('function')
    expect(typeof result.current.closeModal).toBe('function')
  })

  it('updates modal state correctly through hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeedbackProvider>{children}</FeedbackProvider>
    )

    const { result } = renderHook(() => useFeedback(), { wrapper })

    // Initial state
    expect(result.current.isModalOpen).toBe(false)

    // Open modal
    act(() => {
      result.current.openModal()
    })
    expect(result.current.isModalOpen).toBe(true)

    // Close modal
    act(() => {
      result.current.closeModal()
    })
    expect(result.current.isModalOpen).toBe(false)
  })
})