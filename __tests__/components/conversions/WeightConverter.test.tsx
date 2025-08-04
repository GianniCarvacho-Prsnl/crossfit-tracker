import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeightConverter from '../../../components/conversions/WeightConverter';

// Mock the plateCalculations module
jest.mock('../../../utils/plateCalculations', () => ({
  convertKgToLbs: (kg: number) => kg * 2.20462,
  convertLbsToKg: (lbs: number) => lbs / 2.20462
}));

describe('WeightConverter', () => {
  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = '';
  });

  test('renders converter with inputs and labels', () => {
    render(<WeightConverter />);
    
    // Check if main elements are present
    expect(screen.getByText('Convertidor de Peso')).toBeInTheDocument();
    expect(screen.getByText('Conversión bidireccional entre libras y kilogramos')).toBeInTheDocument();
    
    // Check if input fields are present
    expect(screen.getByLabelText('Libras (lbs)')).toBeInTheDocument();
    expect(screen.getByLabelText('Kilogramos (kg)')).toBeInTheDocument();
    
    // Check if clear button is present
    expect(screen.getByText('Limpiar')).toBeInTheDocument();
  });

  test('converts lbs to kg when lbs input changes', async () => {
    render(<WeightConverter />);
    
    const lbsInput = screen.getByLabelText('Libras (lbs)');
    const kgInput = screen.getByLabelText('Kilogramos (kg)');
    
    // Enter 100 lbs
    fireEvent.change(lbsInput, { target: { value: '100' } });
    
    await waitFor(() => {
      expect(lbsInput).toHaveValue(100);
      expect(kgInput).toHaveValue(45.4); // 100 / 2.20462 ≈ 45.4
    });
  });

  test('converts kg to lbs when kg input changes', async () => {
    render(<WeightConverter />);
    
    const lbsInput = screen.getByLabelText('Libras (lbs)');
    const kgInput = screen.getByLabelText('Kilogramos (kg)');
    
    // Enter 50 kg
    fireEvent.change(kgInput, { target: { value: '50' } });
    
    await waitFor(() => {
      expect(kgInput).toHaveValue(50);
      expect(lbsInput).toHaveValue(110.2); // 50 * 2.20462 ≈ 110.2
    });
  });

  test('clears both inputs when clear button is clicked', async () => {
    render(<WeightConverter />);
    
    const lbsInput = screen.getByLabelText('Libras (lbs)');
    const kgInput = screen.getByLabelText('Kilogramos (kg)');
    const clearButton = screen.getByText('Limpiar');
    
    // Enter values
    fireEvent.change(lbsInput, { target: { value: '100' } });
    
    await waitFor(() => {
      expect(lbsInput).toHaveValue(100);
      expect(kgInput).toHaveValue(45.4);
    });
    
    // Click clear
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(lbsInput).toHaveValue(null);
      expect(kgInput).toHaveValue(null);
    });
  });

  test('shows result display when values are entered', async () => {
    render(<WeightConverter />);
    
    const lbsInput = screen.getByLabelText('Libras (lbs)');
    
    // Enter 100 lbs
    fireEvent.change(lbsInput, { target: { value: '100' } });
    
    await waitFor(() => {
      expect(screen.getByText(/100.0 lbs = 45.4 kg/)).toBeInTheDocument();
      expect(screen.getByText('Factor de conversión: 1 kg = 2.20462 lbs')).toBeInTheDocument();
    });
  });

  test('handles invalid input gracefully', async () => {
    render(<WeightConverter />);
    
    const lbsInput = screen.getByLabelText('Libras (lbs)');
    const kgInput = screen.getByLabelText('Kilogramos (kg)');
    
    // Enter invalid value
    fireEvent.change(lbsInput, { target: { value: 'invalid' } });
    
    await waitFor(() => {
      expect(kgInput).toHaveValue(null);
    });
    
    // Enter negative value
    fireEvent.change(lbsInput, { target: { value: '-10' } });
    
    await waitFor(() => {
      expect(kgInput).toHaveValue(null);
    });
  });

  test('displays preset weights correctly', () => {
    render(<WeightConverter />);
    
    // Check if preset weights section is present
    expect(screen.getByText('Pesos Comunes')).toBeInTheDocument();
    
    // Check for some preset weights
    expect(screen.getByText('45 lbs')).toBeInTheDocument();
    expect(screen.getByText('Solo barra')).toBeInTheDocument();
    expect(screen.getByText('135 lbs')).toBeInTheDocument();
    expect(screen.getByText('45 lbs por lado')).toBeInTheDocument();
  });

  test('applies preset weight when preset button is clicked', async () => {
    render(<WeightConverter />);
    
    const lbsInput = screen.getByLabelText('Libras (lbs)');
    const kgInput = screen.getByLabelText('Kilogramos (kg)');
    
    // Click on "Solo barra" preset (45 lbs)
    const presetButton = screen.getByText('Solo barra').closest('button');
    fireEvent.click(presetButton!);
    
    await waitFor(() => {
      expect(lbsInput).toHaveValue(45);
      expect(kgInput).toHaveValue(20.4);
    });
  });

  test('shows conversion factors in footer', () => {
    render(<WeightConverter />);
    
    expect(screen.getByText('1 libra (lb) =')).toBeInTheDocument();
    expect(screen.getByText('0.453592 kilogramos')).toBeInTheDocument();
    expect(screen.getByText('1 kilogramo (kg) =')).toBeInTheDocument();
    expect(screen.getByText('2.20462 libras')).toBeInTheDocument();
  });

  test('highlights active input field', async () => {
    render(<WeightConverter />);
    
    const lbsInput = screen.getByLabelText('Libras (lbs)');
    const kgInput = screen.getByLabelText('Kilogramos (kg)');
    
    // Enter value in lbs input
    fireEvent.change(lbsInput, { target: { value: '100' } });
    
    await waitFor(() => {
      expect(lbsInput).toHaveClass('border-blue-300', 'bg-blue-50');
      expect(kgInput).toHaveClass('border-gray-300');
    });
    
    // Enter value in kg input
    fireEvent.change(kgInput, { target: { value: '50' } });
    
    await waitFor(() => {
      expect(kgInput).toHaveClass('border-blue-300', 'bg-blue-50');
      expect(lbsInput).toHaveClass('border-gray-300');
    });
  });

  test('applies custom className', () => {
    const { container } = render(<WeightConverter className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});