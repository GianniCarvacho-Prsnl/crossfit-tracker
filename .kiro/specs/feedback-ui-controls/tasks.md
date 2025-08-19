# Plan de Implementación

- [x] 1. Crear rama de desarrollo y configurar estructura base
  - Crear rama "feature/feedback-ui-controls" desde main
  - Crear directorio components/feedback/ para nuevos componentes
  - _Requisitos: 4.1, 4.2, 4.4_

- [x] 2. Implementar FeedbackProvider (Context)
  - Crear FeedbackProvider.tsx con context para estado global del modal
  - Implementar funciones openModal() y closeModal()
  - Crear hook personalizado useFeedback() para consumir el context
  - Escribir tests unitarios para el provider y hook
  - _Requisitos: 3.1, 3.8_

- [x] 3. Crear componente FeedbackModal
- [x] 3.1 Implementar estructura base del modal
  - Crear FeedbackModal.tsx con overlay y contenedor del modal
  - Implementar lógica de apertura/cierre con props isOpen y onClose
  - Agregar manejo de cierre con tecla ESC y clic fuera del modal
  - Escribir tests para renderizado y comportamiento de apertura/cierre
  - _Requisitos: 3.1, 3.8, 3.9_

- [x] 3.2 Implementar formulario de feedback
  - Agregar campos de formulario: tipo (select), título (input), descripción (textarea)
  - Implementar validación local para campos requeridos y límites de caracteres
  - Agregar botones "Enviar" (deshabilitado) y "Cancelar" con estilos apropiados
  - Mostrar mensaje placeholder indicando versión de vista previa
  - Escribir tests para validación de formulario y interacciones
  - _Requisitos: 3.2, 3.3, 3.4, 3.5, 3.7_

- [x] 3.3 Aplicar estilos responsive y animaciones
  - Implementar estilos responsive para móvil (95% ancho), tablet (80%) y desktop (500px max)
  - Agregar animaciones de entrada/salida del modal usando CSS transitions
  - Aplicar overlay oscuro con backdrop-filter blur
  - Asegurar cumplimiento de tamaños mínimos de touch target (44px)
  - Escribir tests para comportamiento responsive
  - _Requisitos: 3.6, 5.1, 5.2, 5.4_

- [x] 4. Crear componente FeedbackTrigger reutilizable
  - Implementar FeedbackTrigger.tsx que acepta variant ('menu' | 'footer')
  - Conectar con FeedbackProvider para abrir modal al hacer clic
  - Aplicar estilos específicos según variante (menu vs footer)
  - Escribir tests para diferentes variantes y funcionalidad de trigger
  - _Requisitos: 1.1, 1.2, 2.1, 2.2_

- [x] 5. Modificar componente Navigation existente
  - Agregar elemento "Feedback" al array navItems en Navigation.tsx
  - Integrar FeedbackTrigger con variant="menu" en el menú de navegación
  - Agregar ícono apropiado (mensaje/chat) usando Heroicons o similar
  - Mantener consistencia con estilos existentes de elementos de menú
  - Escribir tests para verificar presencia del elemento de feedback en menú
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 5.3_

- [x] 6. Crear componente Footer
  - Implementar Footer.tsx como componente sticky en la parte inferior
  - Agregar enlace discreto "Reportar un problema" con estilos sutiles
  - Integrar FeedbackTrigger con variant="footer"
  - Asegurar que no interfiera con contenido principal o navegación existente
  - Escribir tests para renderizado y funcionalidad del enlace
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 5.4_

- [x] 7. Integrar Footer en layout principal
  - Modificar app/layout.tsx para incluir Footer después del elemento main
  - Envolver toda la aplicación con FeedbackProvider en el layout
  - Asegurar que Footer sea visible en todas las páginas excepto login
  - Verificar que no afecte la estructura existente del layout
  - Escribir tests de integración para verificar presencia del footer
  - _Requisitos: 2.1, 2.3, 4.3_

- [x] 8. Implementar características de accesibilidad
  - Agregar atributos ARIA apropiados al modal (role="dialog", aria-labelledby)
  - Implementar focus trap dentro del modal cuando está abierto
  - Configurar tab order lógico en el formulario de feedback
  - Asegurar navegación por teclado funcional (ESC para cerrar)
  - Escribir tests de accesibilidad usando testing-library
  - _Requisitos: 3.8, 5.5_

- [x] 9. Escribir tests de integración completos
  - Crear tests E2E para flujo completo desde trigger hasta cierre de modal
  - Verificar funcionamiento en diferentes tamaños de pantalla (responsive)
  - Probar interacciones táctiles en simulación móvil
  - Validar que ambos triggers (menú y footer) abren el mismo modal
  - _Requisitos: 1.2, 2.2, 3.1, 3.6_

- [x] 10. Realizar pruebas finales y documentación
  - Ejecutar todos los tests unitarios, integración y E2E
  - Verificar cumplimiento de todos los criterios de aceptación
  - Probar en diferentes navegadores y dispositivos
  - Documentar cualquier limitación o consideración para Fase 2
  - Preparar rama para revisión y merge
  - _Requisitos: 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_