import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

describe('ConfirmDialog', () => {
  const mockOnConfirm = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    mockOnConfirm.mockClear()
    mockOnCancel.mockClear()
  })

  afterEach(() => {
    // Reset body overflow style
    document.body.style.overflow = 'unset'
  })

  it('renders when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Test Title')
    expect(screen.getByTestId('dialog-message')).toHaveTextContent('Test Message')
  })

  it('does not render when isOpen is false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.click(screen.getByTestId('confirm-button'))
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.click(screen.getByTestId('cancel-button'))
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when backdrop is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.click(screen.getByTestId('dialog-backdrop'))
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Escape key is pressed', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('renders custom button text', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        confirmText="Delete"
        cancelText="Keep"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByTestId('confirm-button')).toHaveTextContent('Delete')
    expect(screen.getByTestId('cancel-button')).toHaveTextContent('Keep')
  })

  it('applies danger variant styles by default', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByTestId('dialog-icon')).toHaveTextContent('⚠️')
    expect(screen.getByTestId('confirm-button')).toHaveClass('bg-red-600')
  })

  it('applies warning variant styles', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        variant="warning"
      />
    )

    expect(screen.getByTestId('dialog-icon')).toHaveTextContent('⚡')
    expect(screen.getByTestId('confirm-button')).toHaveClass('bg-yellow-600')
  })

  it('applies info variant styles', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        variant="info"
      />
    )

    expect(screen.getByTestId('dialog-icon')).toHaveTextContent('ℹ️')
    expect(screen.getByTestId('confirm-button')).toHaveClass('bg-blue-600')
  })

  it('prevents body scroll when open', async () => {
    const { rerender } = render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <ConfirmDialog
        isOpen={false}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('unset')
    })
  })
})
