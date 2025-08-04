import { render, screen, fireEvent } from '@testing-library/react'
import ExerciseSelector from '@/components/percentages/ExerciseSelector'
import { ExercisePR } from '@/utils/rmPercentages'

const mockPRs: ExercisePR[] = [
  { exercise: 'Clean', oneRM: 200, date: '2024-01-01' },
  { exercise: 'Snatch', oneRM: 150, date: '2024-01-02' },
  { exercise: 'Deadlift', oneRM: 300, date: '2024-01-03' }
]

const mockOnExerciseSelect = jest.fn()

describe('ExerciseSelector', () => {
  beforeEach(() => {
    mockOnExerciseSelect.mockClear()
  })

  test('renders loading state', () => {
    render(
      <ExerciseSelector
        prs={[]}
        selectedExercise={null}
        onExerciseSelect={mockOnExerciseSelect}
        loading={true}
      />
    )

    expect(screen.getByText('Selecciona un Ejercicio')).toBeInTheDocument()
    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  test('renders no records message when prs is empty', () => {
    render(
      <ExerciseSelector
        prs={[]}
        selectedExercise={null}
        onExerciseSelect={mockOnExerciseSelect}
        loading={false}
      />
    )

    expect(screen.getByText('No hay registros disponibles')).toBeInTheDocument()
    expect(screen.getByText(/Necesitas registrar al menos un peso/)).toBeInTheDocument()
  })

  test('renders exercise buttons with PRs', () => {
    render(
      <ExerciseSelector
        prs={mockPRs}
        selectedExercise={null}
        onExerciseSelect={mockOnExerciseSelect}
        loading={false}
      />
    )

    expect(screen.getByText('Clean')).toBeInTheDocument()
    expect(screen.getByText('PR: 200.0 lbs')).toBeInTheDocument()
    
    expect(screen.getByText('Snatch')).toBeInTheDocument()
    expect(screen.getByText('PR: 150.0 lbs')).toBeInTheDocument()
    
    expect(screen.getByText('Deadlift')).toBeInTheDocument()
    expect(screen.getByText('PR: 300.0 lbs')).toBeInTheDocument()
  })

  test('shows disabled state for exercises without PRs', () => {
    render(
      <ExerciseSelector
        prs={mockPRs}
        selectedExercise={null}
        onExerciseSelect={mockOnExerciseSelect}
        loading={false}
      />
    )

    // Front Squat and Back Squat should be disabled (not in mockPRs)
    const frontSquatButton = screen.getByText('Front Squat').closest('button')
    const backSquatButton = screen.getByText('Back Squat').closest('button')
    
    expect(frontSquatButton).toBeDisabled()
    expect(backSquatButton).toBeDisabled()
    
    expect(screen.getAllByText('Sin registros')).toHaveLength(2)
  })

  test('calls onExerciseSelect when clicking enabled exercise', () => {
    render(
      <ExerciseSelector
        prs={mockPRs}
        selectedExercise={null}
        onExerciseSelect={mockOnExerciseSelect}
        loading={false}
      />
    )

    const cleanButton = screen.getByText('Clean').closest('button')
    fireEvent.click(cleanButton!)

    expect(mockOnExerciseSelect).toHaveBeenCalledWith('Clean')
  })

  test('does not call onExerciseSelect when clicking disabled exercise', () => {
    render(
      <ExerciseSelector
        prs={mockPRs}
        selectedExercise={null}
        onExerciseSelect={mockOnExerciseSelect}
        loading={false}
      />
    )

    const frontSquatButton = screen.getByText('Front Squat').closest('button')
    fireEvent.click(frontSquatButton!)

    expect(mockOnExerciseSelect).not.toHaveBeenCalled()
  })

  test('shows selected exercise state', () => {
    render(
      <ExerciseSelector
        prs={mockPRs}
        selectedExercise="Clean"
        onExerciseSelect={mockOnExerciseSelect}
        loading={false}
      />
    )

    expect(screen.getByText('Seleccionado')).toBeInTheDocument()
    expect(screen.getByText('PR actual: 200.0 lbs')).toBeInTheDocument()
  })
})