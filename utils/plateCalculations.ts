/**
 * Utilidades para cálculo de discos y conversiones de peso
 * Maneja la lógica de combinaciones de discos para barras olímpicas
 */

// Constantes
export const OLYMPIC_BAR_WEIGHT = 45; // lbs
export const AVAILABLE_PLATES = [45, 35, 25, 15, 10, 5, 2.5]; // lbs por disco

// Interfaces
export interface PlateConfiguration {
  plateWeight: number;  // Peso del disco individual
  quantity: number;     // Cantidad de discos (por lado)
}

export interface WeightConversion {
  weightPerSide: number;      // Peso por lado en lbs
  totalWeightLbs: number;     // Peso total en lbs (incluye barra)
  totalWeightKg: number;      // Peso total en kg
  plates: PlateConfiguration[]; // Configuración de discos necesarios
}

export interface PlateCalculation {
  isValid: boolean;           // Si el peso es alcanzable con discos disponibles
  totalWeight: number;        // Peso total real alcanzado
  plates: PlateConfiguration[]; // Discos necesarios por lado
  difference: number;         // Diferencia con peso objetivo
}

/**
 * Convierte kilogramos a libras
 */
export const convertKgToLbs = (kg: number): number => {
  return kg * 2.20462;
};

/**
 * Convierte libras a kilogramos
 */
export const convertLbsToKg = (lbs: number): number => {
  return lbs / 2.20462;
};

/**
 * Calcula la combinación óptima de discos necesarios para un peso específico por lado
 * Usa algoritmo greedy para encontrar la combinación con menos discos
 */
export const calculatePlatesNeeded = (weightPerSide: number): PlateConfiguration[] => {
  const plates: PlateConfiguration[] = [];
  let remainingWeight = weightPerSide;
  
  // Algoritmo greedy: usar discos más pesados primero
  for (const plateWeight of AVAILABLE_PLATES) {
    const quantity = Math.floor(remainingWeight / plateWeight);
    if (quantity > 0) {
      plates.push({ plateWeight, quantity });
      remainingWeight = Math.round((remainingWeight - plateWeight * quantity) * 10) / 10; // Redondear para evitar errores de punto flotante
    }
  }
  
  return plates;
};

/**
 * Genera la tabla completa de conversiones desde 0 hasta 145 lbs por lado
 * con incrementos de 5 lbs
 */
export const generateWeightConversions = (): WeightConversion[] => {
  const conversions: WeightConversion[] = [];
  
  // Generar tabla desde 0 hasta 145 lbs por lado, incrementos de 5 lbs
  for (let weightPerSide = 0; weightPerSide <= 145; weightPerSide += 5) {
    const totalWeightLbs = OLYMPIC_BAR_WEIGHT + (weightPerSide * 2);
    const totalWeightKg = convertLbsToKg(totalWeightLbs);
    const plates = calculatePlatesNeeded(weightPerSide);
    
    conversions.push({
      weightPerSide,
      totalWeightLbs,
      totalWeightKg: Math.round(totalWeightKg * 10) / 10, // Redondear a 1 decimal
      plates
    });
  }
  
  return conversions;
};

/**
 * Calcula qué discos se necesitan para alcanzar un peso objetivo específico
 * Maneja casos donde el peso exacto no es posible
 */
export const calculateTargetWeight = (targetWeight: number, unit: 'lbs' | 'kg'): PlateCalculation => {
  // Convertir a lbs si es necesario
  const targetLbs = unit === 'kg' ? convertKgToLbs(targetWeight) : targetWeight;
  
  // Calcular peso por lado (restando barra)
  const weightPerSide = (targetLbs - OLYMPIC_BAR_WEIGHT) / 2;
  
  // Validar que el peso sea alcanzable
  if (weightPerSide < 0) {
    return {
      isValid: false,
      totalWeight: OLYMPIC_BAR_WEIGHT,
      plates: [],
      difference: targetLbs - OLYMPIC_BAR_WEIGHT
    };
  }
  
  // Calcular combinación de discos
  const plates = calculatePlatesNeeded(weightPerSide);
  
  // Calcular peso real alcanzado
  const actualWeightPerSide = plates.reduce((sum, plate) => 
    sum + (plate.plateWeight * plate.quantity), 0
  );
  const actualTotalWeight = OLYMPIC_BAR_WEIGHT + (actualWeightPerSide * 2);
  
  return {
    isValid: Math.abs(actualTotalWeight - targetLbs) < 0.1,
    totalWeight: actualTotalWeight,
    plates,
    difference: Math.round((targetLbs - actualTotalWeight) * 10) / 10
  };
};

/**
 * Formatea la configuración de discos para mostrar al usuario
 * Ejemplo: "2x45 + 1x25 + 1x5"
 */
export const formatPlateConfiguration = (plates: PlateConfiguration[]): string => {
  if (plates.length === 0) return 'Sin discos (solo barra)';
  
  return plates
    .map(plate => `${plate.quantity}×${plate.plateWeight} lbs`)
    .join(' + ');
};

/**
 * Calcula el peso total de una configuración de discos
 */
export const calculateTotalWeightFromPlates = (plates: PlateConfiguration[]): number => {
  const weightPerSide = plates.reduce((sum, plate) => 
    sum + (plate.plateWeight * plate.quantity), 0
  );
  return OLYMPIC_BAR_WEIGHT + (weightPerSide * 2);
};

/**
 * Valida si una configuración de discos es válida
 * (todos los pesos de discos existen en AVAILABLE_PLATES)
 */
export const validatePlateConfiguration = (plates: PlateConfiguration[]): boolean => {
  return plates.every(plate => 
    AVAILABLE_PLATES.includes(plate.plateWeight) && 
    plate.quantity > 0
  );
};