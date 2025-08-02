import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import WorkoutForm from '@/components/forms/WorkoutForm'
import { WorkoutFormData } from '@/types/workout'

// Mock de las funciones de utilidad
jest.mock('@/utils/calculations', () => ({
  calculateOneRM: jest.fn((weight: number, reps: number) => {
    if (reps === 1) return weight
    return (weight * 0.0333 * reps) + weight
  }),
  isCalculatedRM: jest.fn((reps: number) => reps > 1)
}))

jest.mock('@/utils/conversions', () => ({
  convertToLbs: jest.fn((weight: number, unit: string) => {
    if (unit === 'kg') return weight * 2.20462
    return weight
  })
}))

describe('WorkoutForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza todos los campos del formulario', () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByLabelText('Ejercicio')).toBeInTheDocument()
    expect(screen.getByLabelText('Peso')).toBeInTheDocument()
    expect(screen.getByLabelText('Repeticiones')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /registrar peso/i })).toBeInTheDocument()
  })

  it('muestra todos los ejercicios en el selector', () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} />)
    
    const exerciseSelect = screen.getByLabelText('Ejercicio')
    const exercises = ['Clean', 'Snatch', 'Deadlift', 'Front Squat', 'Back Squat']
    
    exercises.forEach(exercise => {
      expect(screen.getByRole('option', { name: exercise })).toBeInTheDocument()
    })
  })

  it('permite seleccionar unidades de peso', () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} />)
    
    const unitSelect = screen.getByDisplayValue('lbs')
    expect(unitSelect).toBeInTheDocument()
    
    fireEvent.change(unitSelect, { target: { value: 'kg' } })
    expect(unitSelect).toHaveValue('kg')
  })

  it('calcula y muestra 1RM automáticamente', async () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} />)
    
    const weightInput = screen.getByLabelText('Peso')
    const repsInput = screen.getByLabelText('Repeticiones')
    
    fireEvent.change(weightInput, { target: { value: '100' } })
    fireEvent.change(repsInput, { target: { value: '5' } })
    
    await waitFor(() => {
      expect(screen.getByText(/1RM Calculado/i)).toBeInTheDocument()
      expect(screen.getByText(/116.7/)).toBeInTheDocument()
    })
  })

  it('muestra 1RM directo para 1 repetición', async () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} />)
    
    const weightInput = screen.getByLabelText('Peso')
    const repsInput = screen.getByLabelText('Repeticiones')
    
    fireEvent.change(weightInput, { target: { value: '100' } })
    fireEvent.change(repsInput, { target: { value: '1' } })
    
    await waitFor(() => {
      expect(screen.getByText(/1RM Directo/i)).toBeInTheDocument()
      expect(screen.getByText(/100.0/)).toBeInTheDocument()
    })
  })

  it('valida campos requeridos', async () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} />)
    
    // First set a valid weight to enable the button
    const weightInput = screen.getByLabelText('Peso')
    fireEvent.change(weightInput, { target: { value: '100' } })
    
    // Wait for 1RM calculation to appear
    await waitFor(() => {
      expect(screen.getByText(/1RM/)).toBeInTheDocument()
    })
    
    // Now set invalid weight
    fireEvent.change(weightInput, { target: { value: '0' } })
    
    const submitButton = screen.getByRole('button', { name: /registrar peso/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('El peso debe ser mayor a 0')).toBeInTheDocument()
    })
  })

  it('no muestra 1RM para más de 20 repeticiones', async () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} />)
    
    const weightInput = screen.getByLabelText('Peso')
    const repsInput = screen.getByLabelText('Repeticiones')
    
    fireEvent.change(weightInput, { target: { value: '100' } })
    fireEvent.change(repsInput, { target: { value: '25' } })
    
    // No debería mostrar el cálculo de 1RM
    expect(screen.queryByText(/1RM/)).not.toBeInTheDocument()
  })

  it('llama onSubmit con datos correctos', async () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} />)
    
    const exerciseSelect = screen.getByLabelText('Ejercicio')
    const weightInput = screen.getByLabelText('Peso')
    const repsInput = screen.getByLabelText('Repeticiones')
    const unitSelect = screen.getByDisplayValue('lbs')
    
    fireEvent.change(exerciseSelect, { target: { value: 'Deadlift' } })
    fireEvent.change(weightInput, { target: { value: '150' } })
    fireEvent.change(repsInput, { target: { value: '3' } })
    fireEvent.change(unitSelect, { target: { value: 'kg' } })
    
    const submitButton = screen.getByRole('button', { name: /registrar peso/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        exercise: 'Deadlift',
        weight: 150,
        repetitions: 3,
        unit: 'kg'
      })
    })
  })

  it('resetea el formulario después de envío exitoso', async () => {
    const mockOnSubmitSuccess = jest.fn().mockResolvedValue(undefined)
    render(<WorkoutForm onSubmit={mockOnSubmitSuccess} />)
    
    const weightInput = screen.getByLabelText('Peso')
    const repsInput = screen.getByLabelText('Repeticiones')
    
    fireEvent.change(weightInput, { target: { value: '100' } })
    fireEvent.change(repsInput, { target: { value: '5' } })
    
    const submitButton = screen.getByRole('button', { name: /registrar peso/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmitSuccess).toHaveBeenCalled()
    })
    
    // Verificar que el formulario se resetea
    await waitFor(() => {
      expect(weightInput.value).toBe('')
      expect(repsInput).toHaveValue(1)
    })
  })

  it('deshabilita el botón durante carga', () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} loading={true} />)
    
    const submitButton = screen.getByRole('button', { name: /guardando/i })
    expect(submitButton).toBeDisabled()
  })
})