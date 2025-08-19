# Requisitos - Feedback Backend Integration (Fase 2)

## Introducción

Esta especificación define la implementación simple de funcionalidad backend para el sistema de feedback de CrossFit Tracker. La Fase 1 (UI) ya está completada. La Fase 2 se enfoca en hacer funcional el envío básico: guardar el comentario del usuario junto con su identificación.

**Enfoque Simple:** Solo necesitamos capturar el feedback del usuario y asociarlo con quien lo envió. Funcionalidades avanzadas se implementarán en futuras versiones.

## Requisitos

### Requisito 1

**Historia de Usuario:** Como usuario de CrossFit Tracker, quiero que mi feedback se guarde realmente cuando hago clic en "Enviar", para que mis comentarios lleguen al equipo de desarrollo.

#### Criterios de Aceptación

1. CUANDO el usuario complete el formulario de feedback y haga clic en "Enviar" ENTONCES el sistema DEBERÁ validar que el campo de descripción no esté vacío
2. CUANDO la validación sea exitosa ENTONCES el sistema DEBERÁ enviar los datos a Supabase para su almacenamiento
3. CUANDO el envío sea exitoso ENTONCES el sistema DEBERÁ mostrar un mensaje de confirmación "¡Feedback enviado!"
4. CUANDO el envío sea exitoso ENTONCES el sistema DEBERÁ cerrar el modal automáticamente después de 2 segundos
5. SI el envío falla ENTONCES el sistema DEBERÁ mostrar "Error al enviar. Inténtalo de nuevo."
6. CUANDO ocurra un error ENTONCES el usuario DEBERÁ poder reintentar sin perder el texto escrito

### Requisito 2

**Historia de Usuario:** Como usuario autenticado de CrossFit Tracker, quiero que mi feedback esté asociado a mi cuenta, para que el equipo sepa quién envió cada comentario.

#### Criterios de Aceptación

1. CUANDO un usuario autenticado envíe feedback ENTONCES el sistema DEBERÁ guardar su user_id junto con el comentario
2. CUANDO un usuario no autenticado intente enviar feedback ENTONCES el sistema DEBERÁ mostrar "Debes iniciar sesión para enviar feedback"
3. CUANDO se guarde el feedback ENTONCES DEBERÁ incluir fecha y hora de creación
4. CUANDO se guarde el feedback ENTONCES DEBERÁ almacenar el tipo, título y descripción del formulario
5. SI el usuario no está autenticado ENTONCES el botón "Enviar" DEBERÁ estar deshabilitado con mensaje explicativo

### Requisito 3

**Historia de Usuario:** Como desarrollador, quiero una tabla simple en Supabase para almacenar el feedback, para poder revisar los comentarios de los usuarios.

#### Criterios de Aceptación

1. CUANDO se cree la base de datos ENTONCES DEBERÁ tener una tabla "feedback" con campos básicos (id, user_id, type, title, description, created_at)
2. CUANDO se configure la tabla ENTONCES DEBERÁ implementar Row Level Security básica
3. CUANDO se configuren las políticas ENTONCES los usuarios DEBERÁN poder insertar solo su propio feedback
4. CUANDO se configuren las políticas ENTONCES solo los administradores DEBERÁN poder leer todos los feedbacks
5. CUANDO se cree la tabla ENTONCES DEBERÁ usar tipos de datos simples (text, uuid, timestamp)

### Requisito 4

**Historia de Usuario:** Como usuario de CrossFit Tracker, quiero ver un estado visual claro cuando envío feedback, para saber si se está procesando o si ya terminó.

#### Criterios de Aceptación

1. CUANDO el usuario haga clic en "Enviar" ENTONCES el botón DEBERÁ cambiar a "Enviando..." y deshabilitarse
2. CUANDO esté enviando ENTONCES el formulario DEBERÁ estar deshabilitado para prevenir cambios
3. CUANDO el envío sea exitoso ENTONCES DEBERÁ mostrar "¡Enviado!" con un ícono de check verde
4. CUANDO el envío falle ENTONCES DEBERÁ mostrar "Error" con un ícono de alerta roja
5. CUANDO se complete (éxito o error) ENTONCES el botón DEBERÁ volver a "Enviar" para permitir reintento
6. CUANDO sea exitoso ENTONCES el modal DEBERÁ cerrarse automáticamente después de mostrar confirmación

### Requisito 5

**Historia de Usuario:** Como desarrollador, quiero que la implementación sea simple y testeable, para poder mantener y extender el sistema fácilmente en el futuro.

#### Criterios de Aceptación

1. CUANDO se implemente el service ENTONCES DEBERÁ tener una función simple `submitFeedback(data)`
2. CUANDO se modifique el FeedbackModal ENTONCES DEBERÁ mantener la misma interfaz visual existente
3. CUANDO se agregue la funcionalidad ENTONCES DEBERÁ incluir tests básicos de éxito y error
4. CUANDO se complete la implementación ENTONCES DEBERÁ pasar todos los tests existentes de Fase 1
5. CUANDO se implemente ENTONCES DEBERÁ usar el patrón de manejo de errores existente en la app
6. CUANDO se complete ENTONCES DEBERÁ estar listo para futuras extensiones sin refactoring mayor