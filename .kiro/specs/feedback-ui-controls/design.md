# Documento de Diseño

## Visión General

Este diseño implementa controles visuales de feedback para CrossFit Tracker, proporcionando dos puntos de entrada (menú de navegación y footer) que abren un popup modal optimizado para móvil. El diseño sigue los patrones existentes de la aplicación y se enfoca en la usabilidad móvil como prioridad.

## Arquitectura

### Estructura de Componentes

```
components/
├── feedback/
│   ├── FeedbackModal.tsx          # Modal principal de feedback
│   ├── FeedbackTrigger.tsx        # Componente reutilizable para triggers
│   └── FeedbackProvider.tsx       # Context provider para estado global
├── navigation/
│   └── Navigation.tsx             # Modificado para incluir opción de feedback
└── layout/
    └── Footer.tsx                 # Nuevo componente de footer con enlace discreto
```

### Flujo de Interacción

1. **Trigger de Feedback**: Usuario hace clic en menú o footer
2. **Apertura de Modal**: Se abre popup modal con overlay
3. **Formulario**: Usuario ve formulario de feedback (no funcional)
4. **Cierre**: Usuario puede cerrar con botón X, Cancelar, o clic fuera del modal

## Componentes e Interfaces

### FeedbackProvider (Context)

```typescript
interface FeedbackContextType {
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
}
```

**Responsabilidades:**
- Gestionar estado global del modal de feedback
- Proporcionar funciones para abrir/cerrar modal
- Evitar múltiples modales abiertos simultáneamente

### FeedbackModal

```typescript
interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}
```

**Características:**
- Modal responsivo que ocupa 90% de la pantalla en móvil
- Overlay oscuro semi-transparente (bg-black/50)
- Animaciones de entrada/salida suaves
- Cierre con ESC, clic fuera, o botón cerrar
- Formulario con campos: tipo, título, descripción
- Botones de acción: Enviar (deshabilitado) y Cancelar

### FeedbackTrigger

```typescript
interface FeedbackTriggerProps {
  variant: 'menu' | 'footer'
  children: React.ReactNode
  className?: string
}
```

**Responsabilidades:**
- Componente reutilizable para diferentes triggers
- Maneja clic y apertura del modal
- Aplica estilos específicos según variante

### Footer

```typescript
interface FooterProps {
  className?: string
}
```

**Características:**
- Footer fijo en la parte inferior
- Enlace discreto "Reportar un problema"
- No interfiere con navegación existente
- Responsive y accesible

## Modelos de Datos

### Tipos de Feedback (Phase 1 - Solo Visual)

```typescript
type FeedbackType = 'bug' | 'improvement' | 'feature'

interface FeedbackFormData {
  type: FeedbackType
  title: string
  description: string
}
```

**Nota**: En Fase 1, estos datos no se envían a ningún backend, solo se muestran en el formulario.

## Manejo de Errores

### Fase 1 - Solo Validación Visual

- **Campos requeridos**: Título es obligatorio
- **Límites de caracteres**: Título máximo 100 caracteres, descripción máximo 500
- **Feedback visual**: Bordes rojos para campos inválidos
- **Mensajes de error**: Texto explicativo debajo de campos

### Estados de Error

```typescript
interface FormErrors {
  title?: string
  description?: string
  general?: string
}
```

## Estrategia de Testing

### Tests Unitarios
- **FeedbackProvider**: Verificar estado y funciones del context
- **FeedbackModal**: Renderizado, apertura/cierre, validación de formulario
- **FeedbackTrigger**: Interacción y apertura de modal
- **Footer**: Renderizado y enlace funcional

### Tests de Integración
- **Flujo completo**: Desde trigger hasta cierre de modal
- **Navegación**: Verificar que el menú incluye opción de feedback
- **Responsive**: Comportamiento en diferentes tamaños de pantalla

### Tests E2E
- **Accesibilidad**: Navegación con teclado, screen readers
- **Móvil**: Touch interactions, viewport móvil
- **Cross-browser**: Funcionamiento en diferentes navegadores

## Especificaciones de Diseño Visual

### Colores y Estilos

```css
/* Modal Overlay */
.feedback-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

/* Modal Container */
.feedback-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Footer Link */
.footer-link {
  color: #6b7280; /* gray-500 */
  font-size: 0.875rem; /* text-sm */
  text-decoration: underline;
  opacity: 0.8;
}
```

### Responsive Breakpoints

- **Mobile (< 640px)**: Modal ocupa 95% del ancho, padding reducido
- **Tablet (640px - 1024px)**: Modal ocupa 80% del ancho
- **Desktop (> 1024px)**: Modal máximo 500px de ancho, centrado

### Animaciones

```css
/* Modal Enter Animation */
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Modal Exit Animation */
@keyframes modalExit {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
}
```

## Integración con Sistema Existente

### Navegación
- Agregar elemento "Feedback" al array `navItems` en `Navigation.tsx`
- Usar ícono de mensaje/chat de Heroicons
- Mantener consistencia con estilos existentes

### Layout
- Integrar `Footer` en `layout.tsx` después del `<main>`
- Envolver aplicación con `FeedbackProvider`
- No afectar estructura existente

### Estilos
- Reutilizar clases existentes: `btn-primary`, `input-mobile`, `card-mobile`
- Seguir patrones de `text-responsive-*` y `min-h-touch`
- Mantener consistencia con `globals.css`

## Consideraciones de Accesibilidad

### Navegación por Teclado
- Modal se puede cerrar con ESC
- Focus trap dentro del modal cuando está abierto
- Tab order lógico en formulario

### Screen Readers
- Atributos ARIA apropiados (`role="dialog"`, `aria-labelledby`)
- Anuncios de apertura/cierre de modal
- Labels descriptivos en formulario

### Contraste y Visibilidad
- Cumplir WCAG 2.1 AA para contraste de colores
- Indicadores visuales claros para estados de error
- Tamaños de touch target mínimos (44px)

## Notas de Implementación

### Fase 1 - Solo Visual
- **No funcionalidad backend**: Botón "Enviar" muestra mensaje de "Próximamente"
- **Validación local**: Solo validación de campos requeridos
- **Estado temporal**: Datos del formulario se pierden al cerrar modal
- **Placeholder**: Mensaje visible indicando que es versión de vista previa

### Preparación para Fase 2
- Estructura de datos compatible con backend futuro
- Hooks preparados para integración con Supabase
- Manejo de errores extensible para errores de red
- Componentes modulares para fácil extensión