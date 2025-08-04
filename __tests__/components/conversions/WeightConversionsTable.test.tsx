import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeightConversionsTable from '../../../components/conversions/WeightConversionsTable';

// Mock the plateCalculations module
jest.mock('../../../utils/plateCalculations', () => ({
  generateWeightConversions: () => [
    {
      weightPerSide: 0,
      totalWeightLbs: 45,
      totalWeightKg: 20.4,
      plates: []
    },
    {
      weightPerSide: 5,
      totalWeightLbs: 55,
      totalWeightKg: 24.9,
      plates: [{ plateWeight: 5, quantity: 1 }]
    },
    {
      weightPerSide: 45,
      totalWeightLbs: 135,
      totalWeightKg: 61.2,
      plates: [{ plateWeight: 45, quantity: 1 }]
    }
  ],
  formatPlateConfiguration: (plates: any[]) => {
    if (plates.length === 0) return 'Solo barra';
    return plates.map(p => `${p.quantity}x${p.plateWeight}`).join(' + ');
  }
}));

describe('WeightConversionsTable', () => {
  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = '';
  });

  test('renders table with conversions', () => {
    render(<WeightConversionsTable />);
    
    // Check if table headers are present
    expect(screen.getByText('Por Lado')).toBeInTheDocument();
    expect(screen.getByText('Total (lbs)')).toBeInTheDocument();
    expect(screen.getByText('Total (kg)')).toBeInTheDocument();
    expect(screen.getByText('Discos Necesarios')).toBeInTheDocument();
    
    // Check if data rows are present
    expect(screen.getByText('0 lbs')).toBeInTheDocument();
    expect(screen.getAllByText('45 lbs')).toHaveLength(2); // One in "Por Lado" column, one in "Total" column
    expect(screen.getByText('20.4 kg')).toBeInTheDocument();
  });

  test('filters conversions based on search term', async () => {
    render(<WeightConversionsTable />);
    
    const searchInput = screen.getByPlaceholderText('Buscar peso, kg o discos...');
    
    // Search for "45"
    fireEvent.change(searchInput, { target: { value: '45' } });
    
    await waitFor(() => {
      // Should show rows containing "45"
      expect(screen.getAllByText('45 lbs')).toHaveLength(2); // One in "Por Lado", one in "Total"
      expect(screen.getByText('135 lbs')).toBeInTheDocument();
      // The "0 lbs" row should still be visible because its total weight is "45 lbs"
      expect(screen.getByText('0 lbs')).toBeInTheDocument();
    });
  });

  test('sorts conversions by weight', () => {
    render(<WeightConversionsTable />);
    
    const weightHeader = screen.getByText('Total (lbs)').closest('th');
    
    // Click to sort by weight (should toggle from asc to desc)
    fireEvent.click(weightHeader!);
    
    // Check if sort icon changed to desc
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  test('sorts conversions by kg', () => {
    render(<WeightConversionsTable />);
    
    const kgHeader = screen.getByText('Total (kg)').closest('th');
    
    // Click to sort by kg
    fireEvent.click(kgHeader!);
    
    // Check if sort icon is present
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  test('shows conversion count in footer', () => {
    render(<WeightConversionsTable />);
    
    expect(screen.getByText('Mostrando 3 de 3 conversiones')).toBeInTheDocument();
  });

  test('displays plate visualization correctly', () => {
    render(<WeightConversionsTable />);
    
    // Check for "Solo barra" text for 0 weight
    expect(screen.getByText('Solo barra')).toBeInTheDocument();
    
    // Check for plate configuration badges
    expect(screen.getByText('1×5')).toBeInTheDocument();
    expect(screen.getByText('1×45')).toBeInTheDocument();
  });

  test('opens conversion details modal when row is clicked', async () => {
    render(<WeightConversionsTable />);
    
    // Click on a table row
    const firstRow = screen.getByText('0 lbs').closest('tr');
    fireEvent.click(firstRow!);
    
    await waitFor(() => {
      // Check if modal is opened
      expect(screen.getByText('Detalles de Conversión')).toBeInTheDocument();
    });
  });

  test('applies custom className', () => {
    const { container } = render(<WeightConversionsTable className="custom-class" />);
    
    // The custom class should be applied to the main container div
    expect(container.firstChild).toHaveClass('custom-class');
  });
});