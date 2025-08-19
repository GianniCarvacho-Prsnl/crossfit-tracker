
Detalles y justificación de las mejoras

Validación y seguridad en el formulario de registros (Alta, Seguridad/Validación): aunque el formulario impide guardar pesos vacíos, sería recomendable incorporar validaciones para evitar pesos irreales o repeticiones negativas. Esto protegería la base de datos y mejoraría la experiencia de usuario
GitHub
.

Gestión de registros (CRUD) (Alta, Funcionalidad): actualmente el historial solo permite ver registros. Implementar edición y eliminación permitiría corregir errores y mantener los datos actualizados. Debe incluir confirmaciones para prevenir borrados accidentales.

Perfil y preferencias (Media, Funcionalidad/UX): las secciones “Perfil”, “Datos personales”, “Preferencias” y “Seguridad” no están implementadas. Desarrollar estas vistas permitiría cambiar unidades, tema visual o restablecer contraseña desde la aplicación.

Análisis y gráficos de progreso (Media, Funcionalidad): incorporar gráficas de progreso por ejercicio o tendencia histórica aportaría valor añadido y motivación al usuario.

PWA y modo offline (Media, Rendimiento/Disponibilidad): siguiendo la lista de verificación de despliegue, la aplicación debería poder instalarse como PWA y funcionar parcialmente sin conexión
GitHub
.

Accesibilidad y usabilidad (Media, UX/Accesibilidad): añadir etiquetas ARIA, mejorar el contraste y proporcionar mensajes de error claros hará que la aplicación sea usable por personas con discapacidad.

Optimización de rendimiento (Media, Rendimiento): se puede mejorar la carga inicial mediante lazy-loading de componentes o reducción del tamaño del bundle. El checklist sugiere usar herramientas como npm run build:analyze
GitHub
.

Redirección de la página de inicio (Baja, Navegación): la URL raíz devuelve un error 403; redirigir automáticamente a /login evitará confusión en el usuario.

Traducciones y mensajes (Baja, UX): revisar consistencia de traducciones (“ago” por “hace”) y permitir elegir entre idiomas.




| Prioridad | Tipo                         | Mejora                 | Resumen clave                        |
| --------- | ---------------------------- | ---------------------- | ------------------------------------ |
| Alta      | Seguridad/Validación         | Validaciones avanzadas | Evitar pesos o reps irrealistas      |
| Alta      | Funcionalidad                | CRUD en historial      | Permitir editar y eliminar registros |
| Media     | Funcionalidad / UX           | Perfil y preferencias  | Implementar pantallas de usuario     |
| Media     | Funcionalidad                | Análisis y gráficas    | Mostrar evolución de récords         |
| Media     | Rendimiento / Disponibilidad | PWA y modo offline     | Habilitar instalación y cache        |
| Media     | UX / Accesibilidad           | Accesibilidad          | Etiquetas ARIA y mensajes claros     |
| Media     | Rendimiento                  | Optimización de carga  | Lazy loading, reducir bundle         |
| Baja      | Navegación                   | Redirección de raíz    | Evitar 403 en `/`                    |
| Baja      | UX                           | Revisar traducciones   | Consistencia en textos               |
