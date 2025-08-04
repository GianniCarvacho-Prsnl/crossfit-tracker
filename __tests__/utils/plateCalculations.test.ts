import {
  OLYMPIC_BAR_WEIGHT,
  AVAILABLE_PLATES,
  convertKgToLbs,
  convertLbsToKg,
  calculatePlatesNeeded,
  generateWeightConversions,
  calculateTargetWeight,
  formatPlateConfiguration,
  calculateTotalWeightFromPlates,
  validatePlateConfiguration,
  type PlateConfiguration,
  type WeightConversion,
  type PlateCalculation
} from '../../utils/plateCalculations';

describe('plateCalculations', () => {
  describe('convertKgToLbs', () => {
    test('should convert kg to lbs correctly', () => {
      expect(convertKgToLbs(100)).toBeCloseTo(220.462, 2);
      expect(convertKgToLbs(50)).toBeCloseTo(110.231, 2);
      expect(convertKgToLbs(0)).toBe(0);
    });
  });

  describe('convertLbsToKg', () => {
    test('should convert lbs to kg correctly', () => {
      expect(convertLbsToKg(220.462)).toBeCloseTo(100, 2);
      expect(convertLbsToKg(110.231)).toBeCloseTo(50, 2);
      expect(convertLbsToKg(0)).toBe(0);
    });
  });

  describe('calculatePlatesNeeded', () => {
    test('should return empty array for 0 weight', () => {
      const result = calculatePlatesNeeded(0);
      expect(result).toEqual([]);
    });

    test('should calculate plates for simple weights', () => {
      const result = calculatePlatesNeeded(45);
      expect(result).toEqual([{ plateWeight: 45, quantity: 1 }]);
    });

    test('should calculate plates for complex combinations', () => {
      const result = calculatePlatesNeeded(135); // 3x45
      expect(result).toEqual([{ plateWeight: 45, quantity: 3 }]);
    });

    test('should use optimal combination with multiple plate sizes', () => {
      const result = calculatePlatesNeeded(67.5); // 1x45 + 1x15 + 1x5 + 1x2.5
      expect(result).toEqual([
        { plateWeight: 45, quantity: 1 },
        { plateWeight: 15, quantity: 1 },
        { plateWeight: 5, quantity: 1 },
        { plateWeight: 2.5, quantity: 1 }
      ]);
    });

    test('should handle weights that require multiple of same plate', () => {
      const result = calculatePlatesNeeded(90); // 2x45
      expect(result).toEqual([{ plateWeight: 45, quantity: 2 }]);
    });
  });

  describe('generateWeightConversions', () => {
    test('should generate conversions with correct structure', () => {
      const conversions = generateWeightConversions();
      
      // Should have entries from 0 to 145 lbs per side (30 entries total)
      expect(conversions).toHaveLength(30);
      
      // First entry should be just the bar
      expect(conversions[0]).toEqual({
        weightPerSide: 0,
        totalWeightLbs: 45,
        totalWeightKg: expect.any(Number),
        plates: []
      });
      
      // Last entry should be 145 lbs per side
      expect(conversions[29].weightPerSide).toBe(145);
      expect(conversions[29].totalWeightLbs).toBe(335); // 45 + (145 * 2)
    });

    test('should have increments of 5 lbs per side', () => {
      const conversions = generateWeightConversions();
      
      for (let i = 0; i < conversions.length; i++) {
        expect(conversions[i].weightPerSide).toBe(i * 5);
      }
    });

    test('should have correct kg conversions', () => {
      const conversions = generateWeightConversions();
      
      // Test a few specific conversions
      const barOnly = conversions[0];
      expect(barOnly.totalWeightKg).toBeCloseTo(20.4, 1);
      
      const oneFortyFive = conversions.find(c => c.weightPerSide === 45);
      expect(oneFortyFive?.totalWeightKg).toBeCloseTo(61.2, 1);
    });
  });

  describe('calculateTargetWeight', () => {
    test('should handle weight below bar weight', () => {
      const result = calculateTargetWeight(30, 'lbs');
      expect(result.isValid).toBe(false);
      expect(result.totalWeight).toBe(OLYMPIC_BAR_WEIGHT);
      expect(result.plates).toEqual([]);
      expect(result.difference).toBe(-15); // 30 - 45
    });

    test('should calculate exact weight matches', () => {
      const result = calculateTargetWeight(135, 'lbs'); // 45 + (45 * 2)
      expect(result.isValid).toBe(true);
      expect(result.totalWeight).toBe(135);
      expect(result.plates).toEqual([{ plateWeight: 45, quantity: 1 }]);
      expect(result.difference).toBe(0);
    });

    test('should handle kg input', () => {
      const result = calculateTargetWeight(100, 'kg'); // ~220 lbs
      expect(result.isValid).toBe(false); // 220.462 lbs is not exactly achievable
      expect(result.totalWeight).toBeCloseTo(220, 0); // Closest achievable weight
    });

    test('should handle weights that cannot be exactly matched', () => {
      const result = calculateTargetWeight(100, 'lbs'); // Cannot be exactly matched
      expect(result.totalWeight).toBeCloseTo(100, 0); // 45 + (27.5 * 2) = 100
      expect(result.difference).toBeCloseTo(0, 1);
    });
  });

  describe('formatPlateConfiguration', () => {
    test('should format empty plates as "Sin discos (solo barra)"', () => {
      const result = formatPlateConfiguration([]);
      expect(result).toBe('Sin discos (solo barra)');
    });

    test('should format single plate type', () => {
      const plates: PlateConfiguration[] = [{ plateWeight: 45, quantity: 2 }];
      const result = formatPlateConfiguration(plates);
      expect(result).toBe('2×45 lbs');
    });

    test('should format multiple plate types', () => {
      const plates: PlateConfiguration[] = [
        { plateWeight: 45, quantity: 1 },
        { plateWeight: 25, quantity: 1 },
        { plateWeight: 5, quantity: 2 }
      ];
      const result = formatPlateConfiguration(plates);
      expect(result).toBe('1×45 lbs + 1×25 lbs + 2×5 lbs');
    });
  });

  describe('calculateTotalWeightFromPlates', () => {
    test('should calculate total weight with no plates', () => {
      const result = calculateTotalWeightFromPlates([]);
      expect(result).toBe(OLYMPIC_BAR_WEIGHT);
    });

    test('should calculate total weight with plates', () => {
      const plates: PlateConfiguration[] = [
        { plateWeight: 45, quantity: 1 },
        { plateWeight: 25, quantity: 1 }
      ];
      const result = calculateTotalWeightFromPlates(plates);
      expect(result).toBe(185); // 45 + (45 + 25) * 2
    });
  });

  describe('validatePlateConfiguration', () => {
    test('should validate correct plate configurations', () => {
      const validPlates: PlateConfiguration[] = [
        { plateWeight: 45, quantity: 2 },
        { plateWeight: 25, quantity: 1 }
      ];
      expect(validatePlateConfiguration(validPlates)).toBe(true);
    });

    test('should reject invalid plate weights', () => {
      const invalidPlates: PlateConfiguration[] = [
        { plateWeight: 50, quantity: 1 } // 50 lbs plate doesn't exist
      ];
      expect(validatePlateConfiguration(invalidPlates)).toBe(false);
    });

    test('should reject zero or negative quantities', () => {
      const invalidPlates: PlateConfiguration[] = [
        { plateWeight: 45, quantity: 0 }
      ];
      expect(validatePlateConfiguration(invalidPlates)).toBe(false);
    });

    test('should validate empty configuration', () => {
      expect(validatePlateConfiguration([])).toBe(true);
    });
  });
});