# Documento de Diseño - CrossFit Tracker

## Visión General

CrossFit Tracker es una aplicación web progresiva (PWA) construida con Next.js y Supabase, optimizada para dispositivos móviles. La aplicación permite a los usuarios registrar y visualizar sus récords personales de levantamiento en ejercicios de CrossFit, con cálculos automáticos de 1RM usando la fórmula de Epley.

## Arquitectura

### Stack Tecnológico

**Frontend:**
- Next.js 14 con App Router
- React 18
- TypeScript
- Tailwind CSS para estilos responsivos
- PWA capabilities para uso móvil optimizado

**Backend:**
- Supabase (Base de datos PostgreSQL + Auth + API)
- Supabase Auth para autenticación
- Row Level Security (RLS) para seguridad de datos

**Herramientas de Desarrollo:**
- Supabase MCP para gestión de base de datos
- ESLint y Prettier para calidad de código

### Arquitectura de la Aplicación

```
┌─────────────────────────────────────────┐
│                Frontend                 │
│  ┌─────────────────────────────────────┐│
│  │           Next.js App               ││
│  │  ┌─────────────────────────────────┐││
│  │  │        Components               │││
│  │  │  - Auth                         │││
│  │  │  - WorkoutForm                  │││
│  │  │  - RecordsList                  │││
│  │  │  - ConversionMockup             │││
│  │  │  - PercentageMockup             │││
│  │  └─────────────────────────────────┘││
│  │  ┌─────────────────────────────────┐││
│  │  │         Utils                   │││
│  │  │  - supabaseClient               │││
│  │  │  - calculations                 │││
│  │  │  - conversions                  │││
│  │  └─────────────────────────────────┘││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
                    │
                    │ API Calls
                    ▼
┌─────────────────────────────────────────┐
│              Supabase                   │
│  ┌─────────────────────────────────────┐│
│  │           Auth                      ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │         PostgreSQL                  ││
│  │  - users                            ││
│  │  - workout_records                  ││
│  │  - exercises                        ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## Componentes e Interfaces

### Estructura de Páginas

```
app/
├── layout.tsx                 # Layout principal con navegación
├── page.tsx                   # Dashboard principal
├── login/
│   └── page.tsx              # Página de autenticación
├── register/
│   └── page.tsx              # Registro de nuevos pesos
├── records/
│   └── page.tsx              # Visualización de registros
├── conversions/
│   └── page.tsx              # Mockup de conversiones
├── percentages/
│   └── page.tsx              # Mockup de porcentajes
└── auth/
    └── confirm/
        └── route.ts          # Confirmación de email
```

### Componentes Principales

#### 1. AuthComponent
```typescript
interface AuthProps {
  onAuthChange: (user: User | null) => void;
}

// Maneja login/logout con Supabase Auth
// Redirige según estado de autenticación
```

#### 2. WorkoutForm
```typescript
interface WorkoutFormProps {
  onSubmit: (record: WorkoutRecord) => void;
}

interface WorkoutRecord {
  exercise: Exercise;
  weight: number;
  repetitions: number;
  unit: 'lbs' | 'kg';
  date: Date;
}

// Formulario para registrar nuevos pesos
// Calcula 1RM automáticamente
// Valida entrada de datos
```

#### 3. RecordsList
```typescript
interface RecordsListProps {
  records: WorkoutRecord[];
  onFilter: (exercise?: Exercise) => void;
  onSort: (field: 'date' | 'weight') => void;
}

// Lista filtrable y ordenable de registros
// Muestra indicadores de tipo de registro
// Conversión automática de unidades para visualización
```

#### 4. Navigation
```typescript
interface NavigationProps {
  currentPath: string;
  user: User | null;
}

// Navegación móvil optimizada
// Menú hamburguesa para pantallas pequeñas
// Indicador de usuario autenticado
```

#### 5. WeightConversions
```typescript
interface WeightConversionsProps {
  // No props necesarios, componente autónomo
}

interface PlateConfiguration {
  plateWeight: number;  // Peso del disco individual
  quantity: number;     // Cantidad de discos (por lado)
}

interface WeightConversion {
  weightPerSide: number;      // Peso por lado en lbs
  totalWeightLbs: number;     // Peso total en lbs (incluye barra)
  totalWeightKg: number;      // Peso total en kg
  plates: PlateConfiguration[]; // Configuración de discos necesarios
}

// Tabla de conversión completa con incrementos de 5 lbs
// Convertidor manual bidireccional (lbs ↔ kg)
// Calculadora de discos para peso objetivo
```

#### 6. PlateCalculator
```typescript
interface PlateCalculatorProps {
  targetWeight: number;
  unit: 'lbs' | 'kg';
}

interface PlateCalculation {
  isValid: boolean;           // Si el peso es alcanzable con discos disponibles
  totalWeight: number;        // Peso total real alcanzado
  plates: PlateConfiguration[]; // Discos necesarios por lado
  difference: number;         // Diferencia con peso objetivo
}

// Calcula combinación óptima de discos
// Maneja discos estándar: 45, 35, 25, 15, 10, 5, 2.5 lbs
// Muestra alternativas si peso exacto no es posible
```

### Interfaces de Datos

#### Exercise
```typescript
type Exercise = 'Clean' | 'Snatch' | 'Deadlift' | 'Front Squat' | 'Back Squat';
```

#### WorkoutRecord
```typescript
interface WorkoutRecord {
  id: string;
  user_id: string;
  exercise: Exercise;
  weight_lbs: number;           // Peso almacenado siempre en libras
  repetitions: number;
  calculated_1rm: number;       // 1RM calculado o directo
  is_calculated: boolean;       // true si fue calculado con fórmula
  original_unit: 'lbs' | 'kg';  // Unidad original de entrada
  created_at: Date;
  updated_at: Date;
}
```

## Modelos de Datos

### Esquema de Base de Datos

#### Tabla: exercises
```sql
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO exercises (name) VALUES 
  ('Clean'),
  ('Snatch'),
  ('Deadlift'),
  ('Front Squat'),
  ('Back Squat');
```

#### Tabla: workout_records
```sql
CREATE TABLE workout_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id),
  weight_lbs DECIMAL(6,2) NOT NULL,
  repetitions INTEGER NOT NULL CHECK (repetitions > 0),
  calculated_1rm DECIMAL(6,2) NOT NULL,
  is_calculated BOOLEAN NOT NULL DEFAULT false,
  original_unit VARCHAR(3) NOT NULL CHECK (original_unit IN ('lbs', 'kg')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_workout_records_user_id ON workout_records(user_id);
CREATE INDEX idx_workout_records_exercise_id ON workout_records(exercise_id);
CREATE INDEX idx_workout_records_created_at ON workout_records(created_at DESC);
```

#### Row Level Security (RLS)
```sql
-- Habilitar RLS
ALTER TABLE workout_records ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios registros
CREATE POLICY "Users can view own workout records" ON workout_records
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios registros
CREATE POLICY "Users can insert own workout records" ON workout_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios registros
CREATE POLICY "Users can update own workout records" ON workout_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios registros
CREATE POLICY "Users can delete own workout records" ON workout_records
  FOR DELETE USING (auth.uid() = user_id);
```

## Manejo de Errores

### Estrategia de Manejo de Errores

#### 1. Errores de Autenticación
```typescript
// Manejo de errores de login/signup
try {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
} catch (error) {
  setError('Credenciales inválidas. Intenta nuevamente.');
}
```

#### 2. Errores de Base de Datos
```typescript
// Manejo de errores de inserción/consulta
try {
  const { data, error } = await supabase
    .from('workout_records')
    .insert(record);
  if (error) throw error;
} catch (error) {
  setError('Error al guardar el registro. Verifica tu conexión.');
}
```

#### 3. Errores de Validación
```typescript
// Validación de formularios
const validateWorkoutForm = (data: WorkoutFormData) => {
  const errors: string[] = [];
  
  if (!data.exercise) errors.push('Selecciona un ejercicio');
  if (data.weight <= 0) errors.push('El peso debe ser mayor a 0');
  if (data.repetitions <= 0) errors.push('Las repeticiones deben ser mayor a 0');
  
  return errors;
};
```

#### 4. Estados de Carga y Error
```typescript
interface AppState {
  loading: boolean;
  error: string | null;
  data: WorkoutRecord[];
}

// Componente con manejo de estados
const RecordsPage = () => {
  const [state, setState] = useState<AppState>({
    loading: true,
    error: null,
    data: []
  });
  
  // Mostrar spinner durante carga
  // Mostrar mensaje de error si existe
  // Mostrar datos cuando estén disponibles
};
```

## Estrategia de Testing

### Tipos de Testing

#### 1. Unit Tests
```typescript
// Pruebas para funciones de cálculo
describe('calculateOneRM', () => {
  test('should return direct weight for 1 rep', () => {
    expect(calculateOneRM(100, 1)).toBe(100);
  });
  
  test('should calculate 1RM using Epley formula', () => {
    expect(calculateOneRM(100, 5)).toBeCloseTo(116.65);
  });
});

// Pruebas para conversiones de unidades
describe('convertWeight', () => {
  test('should convert kg to lbs', () => {
    expect(convertKgToLbs(100)).toBeCloseTo(220.462);
  });
});
```

#### 2. Integration Tests
```typescript
// Pruebas de integración con Supabase
describe('WorkoutRecords API', () => {
  test('should create workout record', async () => {
    const record = {
      exercise: 'Clean',
      weight: 100,
      repetitions: 1,
      unit: 'lbs'
    };
    
    const result = await createWorkoutRecord(record);
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
  });
});
```

#### 3. E2E Tests (Cypress)
```typescript
// Pruebas end-to-end para flujos principales
describe('Workout Registration Flow', () => {
  it('should register new workout record', () => {
    cy.login('user@example.com', 'password');
    cy.visit('/register');
    cy.selectExercise('Clean');
    cy.fillWeight(100);
    cy.fillReps(1);
    cy.submit();
    cy.should('contain', 'Registro guardado exitosamente');
  });
});
```

### Configuración de Testing

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
  ],
};
```

## Consideraciones de Diseño Móvil

### Responsive Design
- **Breakpoints**: Mobile-first approach con Tailwind CSS
- **Touch Targets**: Mínimo 44px para elementos interactivos
- **Typography**: Escalas legibles en pantallas pequeñas
- **Navigation**: Menú hamburguesa para navegación principal

### PWA Features
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // configuración de Next.js
});
```

### Optimizaciones de Performance
- **Code Splitting**: Lazy loading de componentes no críticos
- **Image Optimization**: Next.js Image component
- **Caching**: Service Worker para cache de recursos estáticos
- **Bundle Size**: Análisis y optimización del tamaño del bundle

## Funciones Utilitarias

### Cálculos
```typescript
// utils/calculations.ts
export const calculateOneRM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return (weight * 0.0333 * reps) + weight;
};

export const convertKgToLbs = (kg: number): number => {
  return kg * 2.20462;
};

export const convertLbsToKg = (lbs: number): number => {
  return lbs / 2.20462;
};
```

### Formateo
```typescript
// utils/formatting.ts
export const formatWeight = (weight: number, unit: 'lbs' | 'kg'): string => {
  return `${weight.toFixed(1)} ${unit}`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES');
};
```

### Conversiones y Cálculo de Discos
```typescript
// utils/plateCalculations.ts
export const OLYMPIC_BAR_WEIGHT = 45; // lbs
export const AVAILABLE_PLATES = [45, 35, 25, 15, 10, 5, 2.5]; // lbs por disco

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
      totalWeightKg,
      plates
    });
  }
  
  return conversions;
};

export const calculatePlatesNeeded = (weightPerSide: number): PlateConfiguration[] => {
  const plates: PlateConfiguration[] = [];
  let remainingWeight = weightPerSide;
  
  // Algoritmo greedy para encontrar combinación óptima
  for (const plateWeight of AVAILABLE_PLATES) {
    const quantity = Math.floor(remainingWeight / plateWeight);
    if (quantity > 0) {
      plates.push({ plateWeight, quantity });
      remainingWeight -= plateWeight * quantity;
    }
  }
  
  return plates;
};

export const calculateTargetWeight = (targetWeight: number, unit: 'lbs' | 'kg'): PlateCalculation => {
  // Convertir a lbs si es necesario
  const targetLbs = unit === 'kg' ? convertKgToLbs(targetWeight) : targetWeight;
  
  // Calcular peso por lado (restando barra)
  const weightPerSide = (targetLbs - OLYMPIC_BAR_WEIGHT) / 2;
  
  if (weightPerSide < 0) {
    return {
      isValid: false,
      totalWeight: OLYMPIC_BAR_WEIGHT,
      plates: [],
      difference: targetLbs - OLYMPIC_BAR_WEIGHT
    };
  }
  
  const plates = calculatePlatesNeeded(weightPerSide);
  const actualWeightPerSide = plates.reduce((sum, plate) => 
    sum + (plate.plateWeight * plate.quantity), 0
  );
  const actualTotalWeight = OLYMPIC_BAR_WEIGHT + (actualWeightPerSide * 2);
  
  return {
    isValid: Math.abs(actualTotalWeight - targetLbs) < 0.1,
    totalWeight: actualTotalWeight,
    plates,
    difference: actualTotalWeight - targetLbs
  };
};
```

Este diseño proporciona una base sólida para implementar todas las funcionalidades requeridas, con especial énfasis en la experiencia móvil y la integración con Supabase.