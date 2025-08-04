# Documento de Requisitos - CrossFit Tracker

## Introducción

CrossFit Tracker es una aplicación web MVP diseñada para permitir a un practicante de CrossFit registrar, almacenar y visualizar sus récords personales (PR/RM) en ejercicios típicos como Clean, Snatch, Deadlift, etc. La aplicación está optimizada para uso móvil y permite tanto el registro directo de 1RM como el cálculo estimado usando la fórmula de Epley para múltiples repeticiones.

## Requisitos

### Requisito 1: Autenticación de Usuario

**Historia de Usuario:** Como practicante de CrossFit, quiero poder iniciar sesión de forma segura en la aplicación, para que mis datos de entrenamiento estén protegidos y sean accesibles solo para mí.

#### Criterios de Aceptación

1. CUANDO el usuario accede a la aplicación ENTONCES el sistema DEBERÁ mostrar una pantalla de login
2. CUANDO el usuario ingresa credenciales válidas ENTONCES el sistema DEBERÁ autenticar al usuario usando Supabase Auth
3. CUANDO el usuario no está autenticado ENTONCES el sistema DEBERÁ redirigir a la pantalla de login
4. CUANDO el usuario cierra sesión ENTONCES el sistema DEBERÁ limpiar la sesión y redirigir al login

### Requisito 2: Registro de Peso Máximo (1RM)

**Historia de Usuario:** Como practicante de CrossFit, quiero registrar mis pesos máximos tanto por repetición única como por múltiples repeticiones con cálculo automático, para que pueda llevar un seguimiento preciso de mi progreso.

#### Criterios de Aceptación

1. CUANDO el usuario selecciona "registrar peso" ENTONCES el sistema DEBERÁ mostrar un formulario con campos para ejercicio (Clean, Snatch, Deadlift, Front Squat, Back Squat), peso, repeticiones y fecha
2. CUANDO el usuario ingresa 1 repetición ENTONCES el sistema DEBERÁ marcar el registro como "1RM directo"
3. CUANDO el usuario ingresa más de 1 repetición ENTONCES el sistema DEBERÁ calcular el 1RM usando la fórmula de Epley: 1RM = (Peso * 0.0333 * Repeticiones) + Peso
4. CUANDO el sistema calcula el 1RM ENTONCES DEBERÁ marcar el registro como "1RM calculado"
5. CUANDO el usuario guarda un registro ENTONCES el sistema DEBERÁ almacenar: ejercicio, peso original, repeticiones, 1RM calculado/directo, tipo de registro, fecha

### Requisito 3: Manejo de Unidades de Peso

**Historia de Usuario:** Como practicante de CrossFit, quiero ingresar pesos considerando que uso una barra olímpica de 45 libras y discos en ambos lados, para que el cálculo del peso total sea preciso.

#### Criterios de Aceptación

1. CUANDO el usuario ingresa peso ENTONCES el sistema DEBERÁ asumir que incluye barra olímpica (45 lbs) más discos totales de ambos lados
2. CUANDO el usuario selecciona unidad "libras" ENTONCES el sistema DEBERÁ almacenar el peso directamente en libras
3. CUANDO el usuario selecciona unidad "kilogramos" ENTONCES el sistema DEBERÁ convertir a libras para almacenamiento (1 kg = 2.20462 lbs)
4. CUANDO se almacena un peso ENTONCES el sistema DEBERÁ guardar tanto el valor en libras como la unidad original de entrada

### Requisito 4: Visualización y Filtrado de Registros

**Historia de Usuario:** Como practicante de CrossFit, quiero ver mis registros filtrados por ejercicio y ordenados por fecha o peso, para que pueda analizar mi progreso de manera efectiva.

#### Criterios de Aceptación

1. CUANDO el usuario accede a la vista de registros ENTONCES el sistema DEBERÁ mostrar una lista de todos los registros
2. CUANDO el usuario selecciona un filtro de ejercicio ENTONCES el sistema DEBERÁ mostrar solo los registros de ese ejercicio
3. CUANDO el usuario selecciona ordenar por fecha ENTONCES el sistema DEBERÁ ordenar los registros del más reciente al más antiguo
4. CUANDO el usuario selecciona ordenar por peso ENTONCES el sistema DEBERÁ ordenar por 1RM de mayor a menor
5. CUANDO se muestra un peso ENTONCES el sistema DEBERÁ mostrar tanto el valor en libras como en kilogramos
6. CUANDO se muestra un registro ENTONCES el sistema DEBERÁ indicar si fue "1RM directo" o "1RM calculado"

### Requisito 5: Conversión de Pesos

**Historia de Usuario:** Como practicante de CrossFit, quiero acceder a una tabla de conversión de pesos completa y herramientas de conversión, para que pueda planificar mis entrenamientos conociendo las equivalencias exactas entre libras y kilogramos.

#### Criterios de Aceptación

1. CUANDO el usuario accede a "Conversiones" ENTONCES el sistema DEBERÁ mostrar una página funcional de conversiones
2. CUANDO se muestra la página ENTONCES DEBERÁ incluir una tabla de conversión con barra olímpica (45 lbs) + discos de cada 5 lbs por lado hasta 145 lbs por lado
3. CUANDO se muestra la tabla ENTONCES DEBERÁ mostrar: peso por lado, peso total en lbs, peso total en kg, y discos necesarios
4. CUANDO el usuario usa el convertidor manual ENTONCES DEBERÁ poder ingresar cualquier peso en lbs o kg y ver la conversión instantánea
5. CUANDO el usuario selecciona un peso de la tabla ENTONCES el sistema DEBERÁ mostrar la combinación exacta de discos necesarios
6. CUANDO se muestra una conversión ENTONCES DEBERÁ ser precisa hasta 1 decimal en kg y mostrar el peso exacto en lbs
7. CUANDO el usuario usa la calculadora de discos ENTONCES DEBERÁ poder ingresar un peso objetivo y ver qué discos necesita para alcanzarlo

### Requisito 6: Porcentajes de RM (Mockup)

**Historia de Usuario:** Como practicante de CrossFit, quiero calcular porcentajes de mi RM para planificar entrenamientos, para que pueda trabajar con intensidades específicas.

#### Criterios de Aceptación

1. CUANDO el usuario accede a "Porcentajes RM" ENTONCES el sistema DEBERÁ mostrar una página con mockup
2. CUANDO se muestra el mockup ENTONCES DEBERÁ incluir texto explicativo sobre cálculo de porcentajes (70%, 50%, etc.)
3. CUANDO se muestra el mockup ENTONCES DEBERÁ mostrar ejemplo de cálculo de discos necesarios por porcentaje

### Requisito 7: Diseño Responsivo

**Historia de Usuario:** Como practicante de CrossFit, quiero usar la aplicación principalmente desde mi celular, para que pueda registrar mis entrenamientos directamente en el gimnasio.

#### Criterios de Aceptación

1. CUANDO la aplicación se carga en dispositivo móvil ENTONCES DEBERÁ adaptarse completamente a la pantalla
2. CUANDO el usuario interactúa con formularios ENTONCES DEBERÁN ser fáciles de usar en pantalla táctil
3. CUANDO se muestran listas o tablas ENTONCES DEBERÁN ser legibles y navegables en móvil
4. CUANDO se carga la aplicación ENTONCES DEBERÁ tener un diseño sobrio y funcional

### Requisito 8: Persistencia de Datos

**Historia de Usuario:** Como practicante de CrossFit, quiero que mis datos se guarden de forma segura y persistente, para que no pierda mi historial de entrenamientos.

#### Criterios de Aceptación

1. CUANDO el usuario registra un peso ENTONCES el sistema DEBERÁ almacenar los datos en Supabase
2. CUANDO el usuario cierra y reabre la aplicación ENTONCES DEBERÁ poder acceder a todos sus registros históricos
3. CUANDO ocurre un error de conexión ENTONCES el sistema DEBERÁ mostrar un mensaje informativo
4. CUANDO se restaura la conexión ENTONCES el sistema DEBERÁ sincronizar automáticamente