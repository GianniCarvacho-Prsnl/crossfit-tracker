# Documento de Diseño - Menú de Configuración de Usuario

## Visión General

El menú de configuración de usuario transformará la experiencia actual de navegación al centralizar todas las opciones de configuración bajo un menú desplegable moderno y accesible desde el área de perfil del usuario. Este diseño elimina la opción "Admin" de la navegación principal y la integra junto con nuevas funcionalidades en un sistema de configuración cohesivo y organizado.

## Arquitectura

### Estructura de Componentes

```
components/
├── settings/
│   ├── UserSettingsMenu.tsx          # Menú principal desplegable
│   ├── UserSettingsModal.tsx         # Modal para configuraciones detalladas
│   ├── sections/
│   │   ├── ProfileSection.tsx        # Gestión de perfil (foto, nombre)
│   │   ├── PersonalDataSection.tsx   # Datos físicos (peso, altura, etc.)
│   │   ├── ExerciseManagementSection.tsx # Gestión de ejercicios (migrado de admin)
│   │   ├── AppPreferencesSection.tsx # Preferencias de aplicación
│   │   ├── SecuritySection.tsx       # Seguridad y privacidad
│   │   └── TrainingSection.tsx       # Configuración de entrenamiento
│   └── shared/
│       ├── SettingsCard.tsx          # Tarjeta contenedora para secciones
│       ├── SettingsToggle.tsx        # Toggle switch para configuraciones
│       └── SettingsButton.tsx        # Botones específicos para configuraciones
```

### Integración con Navegación Existente

La navegación actual (`components/navigation/Navigation.tsx`) será modificada para:

1. **Reemplazar el indicador de usuario actual** con un botón de perfil más prominente
2. **Eliminar la opción "Admin"** de la navegación principal
3. **Agregar el menú desplegable de configuración** que se activa al hacer clic en el área de perfil
4. **Mantener la funcionalidad de logout** dentro del menú de configuración

## Componentes y Interfaces

### 1. UserSettingsMenu (Componente Principal)

**Responsabilidades:**
- Renderizar el botón de perfil en la navegación
- Manejar el estado de apertura/cierre del menú desplegable
- Coordinar la navegación entre diferentes secciones de configuración

**Props Interface:**
```typescript
interface UserSettingsMenuProps {
  user: User
  onClose?: () => void
}
```

**Estados:**
- `isOpen: boolean` - Control de visibilidad del menú
- `activeSection: SettingsSection | null` - Sección actualmente activa
- `userProfile: UserProfile` - Datos del perfil del usuario

### 2. UserSettingsModal

**Responsabilidades:**
- Renderizar el modal/overlay para configuraciones detalladas
- Manejar la navegación entre secciones
- Proporcionar una interfaz consistente para todas las secciones

**Props Interface:**
```typescript
interface UserSettingsModalProps {
  isOpen: boolean
  activeSection: SettingsSection
  onSectionChange: (section: SettingsSection) => void
  onClose: () => void
  user: User
}
```

### 3. Secciones de Configuración

#### ProfileSection
- **Funcionalidad:** Gestión de foto de perfil y nombre de usuario
- **Componentes:** Upload de imagen, input de texto, preview de cambios
- **Validaciones:** Tamaño de imagen, formato, longitud de nombre

#### PersonalDataSection
- **Funcionalidad:** Gestión de datos físicos y demográficos
- **Campos:** Peso actual, estatura, género, nivel de experiencia, fecha de nacimiento
- **Características:** Conversión automática de unidades, validación de rangos

#### ExerciseManagementSection
- **Funcionalidad:** Migración completa de `ExerciseManager.tsx`
- **Características:** Mantener toda la funcionalidad existente
- **Integración:** Usar el mismo hook `useExercises` y servicios

#### AppPreferencesSection
- **Funcionalidad:** Configuraciones de aplicación
- **Opciones:** Unidades de medida, tema, idioma, notificaciones
- **Persistencia:** LocalStorage + base de datos para preferencias del usuario

#### SecuritySection
- **Funcionalidad:** Seguridad y privacidad
- **Características:** Cambio de contraseña, exportación de datos, configuración de privacidad
- **Seguridad:** Validación de contraseña actual, confirmación de cambios críticos

#### TrainingSection
- **Funcionalidad:** Configuración específica de entrenamiento
- **Características:** Metas por ejercicio, recordatorios, preferencias de cálculo
- **Integración:** Conexión con sistema de notificaciones y cálculos de 1RM

## Modelos de Datos

### UserProfile (Nuevo)
```typescript
interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  profile_photo_url: string | null
  weight_kg: number | null
  height_cm: number | null
  gender: 'male' | 'female' | 'other' | null
  experience_level: 'beginner' | 'intermediate' | 'advanced' | null
  birth_date: string | null
  created_at: string
  updated_at: string
}
```

### UserPreferences (Nuevo)
```typescript
interface UserPreferences {
  id: string
  user_id: string
  preferred_units: 'metric' | 'imperial'
  theme: 'light' | 'dark' | 'system'
  language: 'es' | 'en'
  notifications_enabled: boolean
  workout_reminders: boolean
  preferred_1rm_formula: 'epley' | 'brzycki' | 'lombardi'
  created_at: string
  updated_at: string
}
```

### ExerciseGoals (Nuevo)
```typescript
interface ExerciseGoals {
  id: string
  user_id: string
  exercise_id: number
  target_1rm_lbs: number | null
  target_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
```

## Flujo de Interacción

### Flujo Principal de Navegación

1. **Usuario hace clic en área de perfil** → Se abre menú desplegable con opciones principales
2. **Usuario selecciona una sección** → Se abre modal con la sección específica
3. **Usuario navega entre secciones** → Modal se actualiza sin cerrarse
4. **Usuario guarda cambios** → Confirmación visual y persistencia de datos
5. **Usuario cierra configuración** → Regresa a la aplicación principal

### Flujo de Gestión de Ejercicios (Migrado)

1. **Usuario accede a "Administrar Ejercicios"** desde el menú de configuración
2. **Sistema carga** la funcionalidad existente de `ExerciseManager`
3. **Usuario realiza cambios** usando la interfaz familiar
4. **Al completar** regresa al menú de configuración principal

### Flujo de Configuración de Perfil

1. **Usuario selecciona "Perfil"** → Modal muestra sección de perfil
2. **Usuario sube foto** → Preview inmediato, validación de formato/tamaño
3. **Usuario edita nombre** → Validación en tiempo real
4. **Usuario guarda** → Actualización inmediata en navegación

## Manejo de Errores

### Estrategias por Sección

- **ProfileSection:** Validación de imagen (formato, tamaño), validación de nombre
- **PersonalDataSection:** Validación de rangos numéricos, conversión de unidades
- **ExerciseManagementSection:** Mantener manejo de errores existente
- **AppPreferencesSection:** Fallback a valores por defecto, validación de preferencias
- **SecuritySection:** Validación de contraseña, confirmación de cambios críticos
- **TrainingSection:** Validación de metas, fechas válidas

### Componente de Error Unificado
Usar `ErrorDisplay` existente con variantes específicas para configuraciones:
- `variant="settings"` - Estilo adaptado para modales de configuración
- Mensajes de error contextuales por sección
- Opciones de retry específicas por tipo de error

## Estrategia de Testing

### Pruebas Unitarias
- **Cada sección de configuración** como componente independiente
- **Hooks personalizados** para gestión de preferencias y perfil
- **Validaciones** de formularios y datos
- **Integración** con servicios de Supabase

### Pruebas de Integración
- **Flujo completo** de configuración de perfil
- **Migración** de funcionalidad de administración de ejercicios
- **Persistencia** de preferencias entre sesiones
- **Navegación** entre secciones sin pérdida de datos

### Pruebas E2E
- **Flujo de usuario completo** desde navegación hasta guardado
- **Responsividad** en dispositivos móviles
- **Accesibilidad** con navegación por teclado
- **Compatibilidad** con diferentes navegadores

## Consideraciones de Rendimiento

### Optimizaciones
- **Lazy loading** de secciones de configuración no críticas
- **Memoización** de componentes de configuración
- **Debounce** en inputs de configuración con validación
- **Caching** de preferencias del usuario

### Gestión de Estado
- **Estado local** para cambios temporales en formularios
- **Persistencia inmediata** para cambios críticos (tema, unidades)
- **Sincronización** con Supabase para datos de perfil
- **Optimistic updates** para mejor UX

## Migración y Compatibilidad

### Plan de Migración
1. **Fase 1:** Crear estructura de componentes de configuración
2. **Fase 2:** Migrar funcionalidad de administración de ejercicios
3. **Fase 3:** Implementar nuevas secciones de configuración
4. **Fase 4:** Actualizar navegación y eliminar ruta `/admin`
5. **Fase 5:** Testing y refinamiento de UX

### Compatibilidad con Datos Existentes
- **Ejercicios existentes** se mantienen sin cambios
- **Registros de entrenamiento** no se ven afectados
- **Autenticación** permanece igual
- **Nuevas tablas** para perfil y preferencias con valores por defecto

## Accesibilidad

### Consideraciones WCAG
- **Navegación por teclado** completa en todos los menús
- **Lectores de pantalla** con labels apropiados
- **Contraste** adecuado en todos los elementos
- **Focus management** en modales y menús desplegables

### Características Específicas
- **Escape key** para cerrar menús y modales
- **Tab navigation** lógica entre secciones
- **ARIA labels** descriptivos para todas las acciones
- **Screen reader** announcements para cambios de estado