# Plan de Implementación - CrossFit Tracker

- [x] 1. Configurar estructura del proyecto Next.js
  - Inicializar proyecto Next.js 14 con TypeScript y Tailwind CSS
  - Configurar estructura de carpetas según diseño (app/, components/, utils/)
  - Instalar dependencias necesarias: @supabase/supabase-js, @supabase/ssr
  - Configurar variables de entorno para Supabase
  - _Requisitos: 8.1, 8.2_

- [x] 2. Configurar cliente Supabase y utilidades
  - Crear utilidades de cliente Supabase para componentes cliente y servidor
  - Implementar middleware de Next.js para manejo de tokens de autenticación
  - Crear funciones utilitarias para cálculos (fórmula de Epley, conversiones)
  - Escribir tests unitarios para funciones de cálculo y conversión
  - _Requisitos: 2.3, 3.3, 3.4_

- [x] 3. Crear esquema de base de datos en Supabase
  - Crear tabla `exercises` con los 5 ejercicios iniciales
  - Crear tabla `workout_records` con todos los campos necesarios
  - Configurar políticas de Row Level Security (RLS) para ambas tablas
  - Crear índices para optimización de consultas
  - _Requisitos: 8.1, 8.2, 1.2_

- [x] 4. Implementar sistema de autenticación
  - Crear componente de login/signup con formulario de email y contraseña
  - Implementar página de confirmación de email (/auth/confirm)
  - Crear lógica de redirección según estado de autenticación
  - Implementar funcionalidad de logout
  - Escribir tests de integración para flujo de autenticación
  - _Requisitos: 1.1, 1.2, 1.3, 1.4_

- [x] 5. Crear layout principal y navegación
  - Implementar layout principal con navegación móvil optimizada
  - Crear componente de navegación con menú hamburguesa
  - Implementar indicador de usuario autenticado
  - Configurar rutas protegidas que requieren autenticación
  - _Requisitos: 7.1, 7.2, 7.4_

- [x] 6. Implementar formulario de registro de pesos
  - Crear componente WorkoutForm con campos para ejercicio, peso, repeticiones
  - Implementar selector de ejercicios (dropdown con los 5 ejercicios)
  - Agregar selector de unidades (libras/kilogramos)
  - Implementar validación de formulario del lado cliente
  - Integrar cálculo automático de 1RM usando fórmula de Epley
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7. Crear funcionalidad de guardado de registros
  - Implementar función para insertar registros en Supabase
  - Manejar conversión de unidades antes del almacenamiento (todo en libras)
  - Implementar manejo de errores para operaciones de base de datos
  - Mostrar mensajes de confirmación y error al usuario
  - Escribir tests de integración para operaciones CRUD
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 8.3_

- [x] 8. Implementar visualización de registros
  - Crear componente RecordsList para mostrar historial de registros
  - Implementar filtrado por tipo de ejercicio
  - Agregar funcionalidad de ordenamiento por fecha y peso máximo
  - Mostrar indicadores visuales para registros calculados vs directos
  - Implementar conversión automática para mostrar pesos en ambas unidades
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 9. Crear página dashboard principal
  - Implementar página principal que muestre resumen de registros recientes
  - Mostrar estadísticas básicas (último PR por ejercicio)
  - Agregar enlaces de navegación rápida a funciones principales
  - Optimizar para visualización móvil
  - _Requisitos: 7.1, 7.3, 7.4_

- [x] 10. Implementar páginas mockup
  - Crear página de conversiones de peso con diseño mockup
  - Mostrar ejemplo de tabla de conversión (barra + discos = total en kg)
  - Crear página de porcentajes de RM con diseño mockup
  - Incluir texto explicativo sobre funcionalidades futuras
  - _Requisitos: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_

- [x] 11. Optimizar diseño responsivo y móvil
  - Implementar breakpoints de Tailwind CSS para diferentes tamaños de pantalla
  - Optimizar formularios para entrada táctil en móvil
  - Asegurar que todos los elementos interactivos tengan tamaño mínimo de 44px
  - Implementar tipografía escalable y legible en pantallas pequeñas
  - _Requisitos: 7.1, 7.2, 7.3, 7.4_

- [x] 12. Configurar PWA y optimizaciones de performance
  - Configurar next-pwa para funcionalidad de aplicación web progresiva
  - Implementar service worker para cache de recursos estáticos
  - Optimizar imágenes usando Next.js Image component
  - Configurar code splitting para componentes no críticos
  - _Requisitos: 7.4_

- [x] 13. Implementar manejo robusto de errores
  - Crear componentes de error boundary para capturar errores de React
  - Implementar estados de carga para todas las operaciones asíncronas
  - Mostrar mensajes de error user-friendly para diferentes tipos de errores
  - Agregar retry logic para operaciones de red fallidas
  - _Requisitos: 8.3_

- [x] 14. Escribir tests end-to-end
  - Configurar Cypress para testing E2E
  - Escribir tests para flujo completo de registro de workout
  - Crear tests para filtrado y ordenamiento de registros
  - Implementar tests para funcionalidad de autenticación
  - _Requisitos: Todos los requisitos principales_

- [x] 15. Configurar deployment y variables de entorno
  - Configurar variables de entorno para producción
  - Preparar configuración de deployment (Vercel recomendado para Next.js)
  - Verificar que todas las funcionalidades trabajen en ambiente de producción
  - Documentar proceso de deployment y configuración
  - _Requisitos: 8.1, 8.2_