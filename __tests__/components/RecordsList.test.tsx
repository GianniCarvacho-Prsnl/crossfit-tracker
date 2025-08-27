import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import RecordsList from '@/components/lists/RecordsList'
import { workoutRecordService } from '@/utils/services/workoutRecords'
import { createClient } from '@/utils/supabase/client'
import { AppError, ErrorType } from '@/utils/errorHandling'

// Mock the dependencies
jest.mock('@/utils/services/workoutRecords')
jest.mock('@/utils/supabase/client')

const mockWorkoutRecordService = workoutRecordService as jest.Mocked<typeof workoutRecordService>
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn()
  }
}

const mockRecords = [
  {
    id: '1',
    user_id: 'user1',
    exercise: { id: 1, name: 'Clean' },
    weight_lbs: 200,
    repetitions: 1,
    calculated_1rm: 200,
    is_calculated: false,
    original_unit: 'lbs',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    user_id: 'user1',
    exercise: { id: 2, name: 'Snatch' },
    weight_lbs: 150,
    repetitions: 3,
    calculated_1rm: 159.975,
    is_calculated: true,
    original_unit: 'lbs',
    created_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-14T10:00:00Z'
  }
]

describe('RecordsList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null
    })
  })

  it('renders loading state initially', () => {
    mockWorkoutRecordService.getWorkoutRecords.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<RecordsList />)
    
    expect(screen.getByText('Cargando registros...')).toBeInTheDocument()
  })

  it('renders records successfully', async () => {
    mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
      success: true,
      data: mockRecords as any
    })

    render(<RecordsList />)

    await waitFor(() => {
      expect(screen.getByText('Clean')).toBeInTheDocument()
      expect(screen.getByText('Snatch')).toBeInTheDocument()
    })

    // Check for record type indicators
    expect(screen.getByText('🎯 Directo')).toBeInTheDocument()
    expect(screen.getByText('📊 Calculado')).toBeInTheDocument()

    // Check for weight displays
    expect(screen.getByText('200.0 lbs')).toBeInTheDocument()
    expect(screen.getByText('160.0 lbs')).toBeInTheDocument()
  })

  it('filters records by exercise', async () => {
    mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
      success: true,
      data: mockRecords as any
    })

    render(<RecordsList />)

    await waitFor(() => {
      expect(screen.getByText('Clean')).toBeInTheDocument()
      expect(screen.getByText('Snatch')).toBeInTheDocument()
    })

    // Filter by Clean
    const exerciseFilter = screen.getByLabelText('Filtrar por ejercicio')
    fireEvent.change(exerciseFilter, { target: { value: 'Clean' } })

    await waitFor(() => {
      expect(screen.getByText('Clean')).toBeInTheDocument()
      expect(screen.queryByText('Snatch')).not.toBeInTheDocument()
    })
  })

  it('sorts records by date and weight', async () => {
    mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
      success: true,
      data: mockRecords as any
    })

    render(<RecordsList />)

    await waitFor(() => {
      expect(screen.getByText('Clean')).toBeInTheDocument()
    })

    // Test sorting buttons exist
    expect(screen.getByText(/Fecha/)).toBeInTheDocument()
    expect(screen.getByText(/Peso/)).toBeInTheDocument()

    // Click weight sort button
    const weightSortButton = screen.getByText(/Peso/)
    fireEvent.click(weightSortButton)

    // Should still show both records but potentially in different order
    await waitFor(() => {
      expect(screen.getByText('Clean')).toBeInTheDocument()
      expect(screen.getByText('Snatch')).toBeInTheDocument()
    })
  })

  it('handles error state', async () => {
    mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
      success: false,
      error: new AppError('Database connection failed', ErrorType.DATABASE, 'Connection error')
    })

    render(<RecordsList />)

    await waitFor(() => {
      expect(screen.getByText('Error al cargar registros')).toBeInTheDocument()
      expect(screen.getByText('Database connection failed')).toBeInTheDocument()
    })

    // Check retry button exists
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('shows empty state when no records', async () => {
    mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
      success: true,
      data: [] as any
    })

    render(<RecordsList />)

    await waitFor(() => {
      expect(screen.getByText('No hay registros')).toBeInTheDocument()
      expect(screen.getByText('Comienza registrando tu primer entrenamiento')).toBeInTheDocument()
    })
  })

  it('shows both weight units', async () => {
    mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
      success: true,
      data: [mockRecords[0]] as any
    })

    render(<RecordsList />)

    await waitFor(() => {
      // Should show both lbs and kg
      expect(screen.getByText('200.0 lbs')).toBeInTheDocument()
      expect(screen.getByText('90.7 kg')).toBeInTheDocument()
    })
  })

  describe('Delete functionality', () => {
    it('shows delete button for each record', async () => {
      mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
        success: true,
        data: mockRecords as any
      })

      render(<RecordsList />)

      await waitFor(() => {
        const deleteButtons = screen.getAllByTestId('delete-record-button')
        expect(deleteButtons).toHaveLength(2)
      })
    })

    it('opens confirmation dialog when delete button is clicked', async () => {
      mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
        success: true,
        data: mockRecords as any
      })

      render(<RecordsList />)

      await waitFor(() => {
        const deleteButtons = screen.getAllByTestId('delete-record-button')
        fireEvent.click(deleteButtons[0])
      })

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      expect(screen.getByText('Eliminar Registro')).toBeInTheDocument()
      expect(screen.getByText(/¿Estás seguro de que quieres eliminar el registro de Clean?/)).toBeInTheDocument()
    })

    it('closes dialog when cancel is clicked', async () => {
      mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
        success: true,
        data: mockRecords as any
      })

      render(<RecordsList />)

      await waitFor(() => {
        const deleteButtons = screen.getAllByTestId('delete-record-button')
        fireEvent.click(deleteButtons[0])
      })

      fireEvent.click(screen.getByTestId('cancel-button'))

      await waitFor(() => {
        expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
      })
    })

    it('successfully deletes record when confirmed', async () => {
      mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
        success: true,
        data: mockRecords as any
      })
      mockWorkoutRecordService.deleteWorkoutRecord.mockResolvedValue({
        success: true
      })
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user1' } },
        error: null
      } as any)

      render(<RecordsList />)

      await waitFor(() => {
        const deleteButtons = screen.getAllByTestId('delete-record-button')
        fireEvent.click(deleteButtons[0])
      })

      fireEvent.click(screen.getByTestId('confirm-button'))

      await waitFor(() => {
        expect(mockWorkoutRecordService.deleteWorkoutRecord).toHaveBeenCalledWith('1', 'user1')
      })

      // Dialog should close after successful deletion
      await waitFor(() => {
        expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
      })

      // Record should be removed from the list
      await waitFor(() => {
        expect(screen.queryByText('Clean')).not.toBeInTheDocument()
      })
    })

    it('shows error when deletion fails', async () => {
      mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
        success: true,
        data: mockRecords as any
      })
      mockWorkoutRecordService.deleteWorkoutRecord.mockResolvedValue({
        success: false,
        error: new AppError('Error al eliminar el registro', ErrorType.DATABASE, 'Database error')
      })
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user1' } },
        error: null
      } as any)

      render(<RecordsList />)

      await waitFor(() => {
        const deleteButtons = screen.getAllByTestId('delete-record-button')
        fireEvent.click(deleteButtons[0])
      })

      fireEvent.click(screen.getByTestId('confirm-button'))

      await waitFor(() => {
        expect(screen.getByText('Error al eliminar el registro')).toBeInTheDocument()
      })

      // Dialog should still be open after failed deletion
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
    })

    it('handles authentication error during deletion', async () => {
      mockWorkoutRecordService.getWorkoutRecords.mockResolvedValue({
        success: true,
        data: mockRecords as any
      })
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      } as any)

      render(<RecordsList />)

      await waitFor(() => {
        const deleteButtons = screen.getAllByTestId('delete-record-button')
        fireEvent.click(deleteButtons[0])
      })

      fireEvent.click(screen.getByTestId('confirm-button'))

      await waitFor(() => {
        expect(screen.getByText(/Error al eliminar el registro/)).toBeInTheDocument()
      })
    })
  })
})