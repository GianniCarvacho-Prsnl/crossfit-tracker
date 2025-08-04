import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlateCalculator from '../../../components/conversions/PlateCalculator';

// Mock the utility functions
jest.mock('../../../utils/plateCalculations', () => ({
  calculateTargetWeight: jest.fn(),
  formatPlateConfiguration: jest.fn(),
  convertKgToLbs: jest.fn(),
  convertLbsToKg: jest.fn(),
  OLYMPIC_BAR_WEIGHT: 45,
  AVAILABLE_PLATES: [45, 35, 25, 15, 10, 5, 2.5],
}));

const mockCalculateTargetWeight = require('../../../utils/plateCalculations').calculateTargetWeight;
const mockFormatPlateConfiguration = require('../../../utils/plateCalculations').formatPlateConfiguration;
const mockConvertKgToLbs = require('../../../utils/plateCalculations').convertKgToLbs;
const mockConvertLbsToKg = require('../../../utils/plateCalculations').convertLbsToKg;

describe('PlateCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockConvertKgToLbs.mockImplementation((kg: number) => kg * 2.20462);
    mockConvertLbsToKg.mockImplementation((lbs: number) => lbs / 2.20462);
    mockFormatPlateConfiguration.mockImplementation((plates: any[]) =>
      plates.map(p => `${p.quantity}x${p.plateWeight}`).join(' + ')
    );
  });

  it('renders correctly with initial state', () => {
    render(<PlateCalculator />);

    expect(screen.getByText('Calculadora de Discos')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu peso objetivo y descubre qué discos necesitas')).toBeInTheDocument();
    expect(screen.getByLabelText('Peso Objetivo')).toBeInTheDocument();
    expect(screen.getAllByText('lbs')).toHaveLength(2); // One in input, one in button
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('shows preset target weights', () => {
    render(<PlateCalculator />);

    expect(screen.getByText('Pesos Objetivo Comunes')).toBeInTheDocument();
    expect(screen.getByText('135 lbs')).toBeInTheDocument();
    expect(screen.getByText('185 lbs')).toBeInTheDocument();
    expect(screen.getByText('225 lbs')).toBeInTheDocument();
    expect(screen.getByText('315 lbs')).toBeInTheDocument();
  });

  it('calculates plates when weight is entered', async () => {
    const mockResult = {
      isValid: true,
      totalWeight: 135,
      plates: [{ plateWeight: 45, quantity: 1 }],
      difference: 0
    };

    mockCalculateTargetWeight.mockReturnValue(mockResult);

    render(<PlateCalculator />);

    const input = screen.getByLabelText('Peso Objetivo');
    fireEvent.change(input, { target: { value: '135' } });

    await waitFor(() => {
      expect(mockCalculateTargetWeight).toHaveBeenCalledWith(135, 'lbs');
    });

    expect(screen.getByText('✓ Peso Exacto Alcanzable')).toBeInTheDocument();
  });

  it('handles unit conversion correctly', async () => {
    const mockResult = {
      isValid: true,
      totalWeight: 135,
      plates: [{ plateWeight: 45, quantity: 1 }],
      difference: 0
    };

    mockCalculateTargetWeight.mockReturnValue(mockResult);

    render(<PlateCalculator />);

    // Switch to kg
    const kgButton = screen.getByRole('button', { name: 'kg' });
    fireEvent.click(kgButton);

    const input = screen.getByLabelText('Peso Objetivo');
    fireEvent.change(input, { target: { value: '61.2' } });

    await waitFor(() => {
      expect(mockCalculateTargetWeight).toHaveBeenCalledWith(61.2, 'kg');
    });
  });

  it('shows warning for approximate weight', async () => {
    const mockResult = {
      isValid: false,
      totalWeight: 137.5,
      plates: [{ plateWeight: 45, quantity: 1 }, { plateWeight: 2.5, quantity: 1 }],
      difference: -2.5
    };

    mockCalculateTargetWeight.mockReturnValue(mockResult);

    render(<PlateCalculator />);

    const input = screen.getByLabelText('Peso Objetivo');
    fireEvent.change(input, { target: { value: '135' } });

    await waitFor(() => {
      expect(screen.getByText('⚠ Peso Aproximado')).toBeInTheDocument();
    });
  });

  it('shows error for weight below bar weight', async () => {
    const mockResult = {
      isValid: false,
      totalWeight: 45,
      plates: [],
      difference: -10
    };

    mockCalculateTargetWeight.mockReturnValue(mockResult);

    render(<PlateCalculator />);

    const input = screen.getByLabelText('Peso Objetivo');
    fireEvent.change(input, { target: { value: '35' } });

    await waitFor(() => {
      expect(screen.getByText('❌ Peso No Alcanzable')).toBeInTheDocument();
    });
  });

  it('toggles visualization when button is clicked', async () => {
    const mockResult = {
      isValid: true,
      totalWeight: 135,
      plates: [{ plateWeight: 45, quantity: 1 }],
      difference: 0
    };

    mockCalculateTargetWeight.mockReturnValue(mockResult);

    render(<PlateCalculator />);

    const input = screen.getByLabelText('Peso Objetivo');
    fireEvent.change(input, { target: { value: '135' } });

    await waitFor(() => {
      expect(screen.getByText('Ver Barra')).toBeInTheDocument();
    });

    const toggleButton = screen.getByText('Ver Barra');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Visualización de la Barra')).toBeInTheDocument();
    expect(screen.getByText('Ocultar Barra')).toBeInTheDocument();
  });

  it('clears input and results when clear button is clicked', async () => {
    const mockResult = {
      isValid: true,
      totalWeight: 135,
      plates: [{ plateWeight: 45, quantity: 1 }],
      difference: 0
    };

    mockCalculateTargetWeight.mockReturnValue(mockResult);

    render(<PlateCalculator />);

    const input = screen.getByLabelText('Peso Objetivo');
    fireEvent.change(input, { target: { value: '135' } });

    await waitFor(() => {
      expect(screen.getByText('✓ Peso Exacto Alcanzable')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Limpiar');
    fireEvent.click(clearButton);

    expect((input as HTMLInputElement).value).toBe('');
    expect(screen.queryByText('✓ Peso Exacto Alcanzable')).not.toBeInTheDocument();
  });

  it('handles preset button clicks correctly', async () => {
    const mockResult = {
      isValid: true,
      totalWeight: 135,
      plates: [{ plateWeight: 45, quantity: 1 }],
      difference: 0
    };

    mockCalculateTargetWeight.mockReturnValue(mockResult);

    render(<PlateCalculator />);

    const presetButton = screen.getByText('135 lbs');
    fireEvent.click(presetButton);

    const input = screen.getByLabelText('Peso Objetivo');
    expect((input as HTMLInputElement).value).toBe('135');

    await waitFor(() => {
      expect(mockCalculateTargetWeight).toHaveBeenCalledWith(135, 'lbs');
    });
  });

  it('shows correct preset values when unit is changed to kg', () => {
    render(<PlateCalculator />);

    const kgButton = screen.getByRole('button', { name: 'kg' });
    fireEvent.click(kgButton);

    expect(screen.getByText('61.2 kg')).toBeInTheDocument();
    expect(screen.getByText('83.9 kg')).toBeInTheDocument();
  });

  it('displays plate information in footer', () => {
    render(<PlateCalculator />);

    expect(screen.getByText(/Los cálculos incluyen la barra olímpica estándar de 45 lbs/)).toBeInTheDocument();
    expect(screen.getByText(/45, 35, 25, 15, 10, 5, 2.5 lbs/)).toBeInTheDocument();
  });
});