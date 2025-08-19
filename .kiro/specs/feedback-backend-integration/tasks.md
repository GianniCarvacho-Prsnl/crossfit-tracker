# Plan de Implementación - Feedback Backend Integration (Fase 2)

## Tareas de Implementación

- [x] 1. Configurar base de datos en Supabase
  - Crear tabla `feedback` con campos básicos (id, user_id, type, title, description, created_at)
  - Configurar Row Level Security (RLS) policies para inserción segura
  - Crear índices para optimizar consultas por usuario y fecha
  - Verificar que las políticas permitan inserción solo del propio feedback del usuario
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Implementar FeedbackService para comunicación con Supabase
  - Crear archivo `services/feedbackService.ts` con función `submitFeedback`
  - Implementar validación de autenticación del usuario
  - Implementar validación de campos requeridos (descripción no vacía)
  - Implementar inserción de datos en tabla feedback con manejo de errores
  - Agregar logging básico para debugging sin información sensible
  - _Requisitos: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_

- [x] 3. Modificar FeedbackModal para integrar envío real
  - Agregar estados de envío (isSubmitting, submitStatus, submitMessage)
  - Implementar función handleSubmit que llame al FeedbackService
  - Modificar botón "Enviar" para mostrar estados dinámicos (Enviando.../¡Enviado!/Error)
  - Agregar spinner de loading y iconos de éxito/error en el botón
  - Implementar deshabilitación del formulario durante envío
  - _Requisitos: 1.3, 1.4, 4.1, 4.2, 4.3, 4.4_

- [x] 4. Implementar manejo de estados visuales y UX
  - Agregar mensaje de confirmación "¡Feedback enviado!" para casos exitosos
  - Implementar auto-cierre del modal después de 2 segundos en caso de éxito
  - Agregar mensajes de error específicos ("Error al enviar. Inténtalo de nuevo.")
  - Implementar preservación de datos del formulario en caso de error para reintento
  - Agregar validación visual para usuarios no autenticados con mensaje explicativo
  - _Requisitos: 1.5, 1.6, 2.5, 4.5, 4.6_

- [x] 5. Crear tests unitarios para FeedbackService
  - Escribir test para envío exitoso de feedback con usuario autenticado
  - Escribir test para manejo de usuario no autenticado
  - Escribir test para validación de campos requeridos (descripción vacía)
  - Escribir test para manejo de errores de base de datos
  - Configurar mocks de Supabase para testing aislado
  - _Requisitos: 5.1, 5.3, 5.4, 5.5_

- [x] 6. Crear tests de integración para FeedbackModal
  - Escribir test para flujo completo de envío exitoso con cambios de estado UI
  - Escribir test para manejo de errores con display de mensajes apropiados
  - Escribir test para deshabilitación de formulario durante envío
  - Escribir test para auto-cierre del modal después de envío exitoso
  - Verificar que todos los tests existentes de Fase 1 sigan pasando
  - _Requisitos: 5.2, 5.4, 5.6_

- [x] 7. Verificar integración completa y realizar pruebas manuales
  - Probar envío exitoso de feedback con usuario autenticado
  - Probar comportamiento con usuario no autenticado
  - Verificar que los datos se guarden correctamente en Supabase
  - Probar manejo de errores de red y base de datos
  - Verificar que la UX sea fluida y los estados visuales sean claros
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 4.1, 4.2, 4.3_