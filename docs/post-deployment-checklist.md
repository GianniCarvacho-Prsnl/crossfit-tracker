# Checklist de Verificación Post-Despliegue

Esta checklist asegura que todos los aspectos críticos del despliegue funcionen correctamente.

## 🚀 Verificación Inmediata (0-5 minutos)

### Accesibilidad Básica
- [ ] **Sitio web accesible**: `https://tu-app.vercel.app` carga sin errores
- [ ] **Health check funciona**: `/api/health` retorna status 200
- [ ] **No errores 500**: Páginas principales cargan correctamente
- [ ] **HTTPS activo**: Certificado SSL válido y activo

### Verificación Automática
```bash
# Ejecutar verificación automática
npm run verify:production

# Resultado esperado: ✅ All verification tests passed!
```

## 🔍 Verificación Funcional (5-15 minutos)

### Navegación y Páginas
- [ ] **Página principal** (`/`): Dashboard carga correctamente
- [ ] **Login** (`/login`): Formulario de autenticación visible
- [ ] **Registro** (`/register`): Formulario de workout registration accesible
- [ ] **Records** (`/records`): Página de historial accesible
- [ ] **Conversions** (`/conversions`): Página de conversiones carga
- [ ] **Percentages** (`/percentages`): Página de porcentajes carga

### Funcionalidad de Autenticación
- [ ] **Formulario de login**: Campos email y password presentes
- [ ] **Botón de submit**: Funcional y visible
- [ ] **Formulario de registro**: Accesible desde navegación
- [ ] **Rutas protegidas**: Redirigen a login cuando no autenticado
- [ ] **Logout**: Funcionalidad disponible (si está implementada)

### Registro de Workouts
- [ ] **Formulario accesible**: Página `/register` carga correctamente
- [ ] **Campo ejercicio**: Dropdown o select con opciones (Clean, Snatch, etc.)
- [ ] **Campo peso**: Input numérico para peso
- [ ] **Campo repeticiones**: Input para número de reps
- [ ] **Validación**: Formulario valida campos requeridos
- [ ] **Submit**: Botón de envío presente y funcional

### Visualización de Records
- [ ] **Página records**: `/records` accesible
- [ ] **Autenticación requerida**: Redirige si no está autenticado
- [ ] **Estructura de datos**: Preparada para mostrar workouts
- [ ] **Filtros**: Interfaz para filtrar por ejercicio (si implementado)
- [ ] **Ordenamiento**: Opciones de ordenar por fecha/peso (si implementado)

## 📱 Verificación de Responsiveness (5-10 minutos)

### Mobile Compatibility
- [ ] **Viewport meta tag**: Presente en todas las páginas
- [ ] **Responsive design**: Layout se adapta a pantallas móviles
- [ ] **Touch targets**: Botones y links tienen tamaño adecuado (44px+)
- [ ] **Texto legible**: Tamaño de fuente apropiado en móvil
- [ ] **Navegación móvil**: Menú funciona en dispositivos móviles

### PWA Features
- [ ] **Manifest.json**: Accesible en `/manifest.json`
- [ ] **Manifest válido**: Contiene name, icons, start_url
- [ ] **Service Worker**: Registrado correctamente (si implementado)
- [ ] **Installable**: App puede instalarse como PWA

### Testing en Dispositivos
```bash
# Usar herramientas de desarrollo del navegador
# Chrome DevTools → Toggle device toolbar
# Probar en:
```
- [ ] **iPhone SE** (375x667): Layout correcto
- [ ] **iPhone 12** (390x844): Navegación funcional
- [ ] **iPad** (768x1024): Responsive design
- [ ] **Desktop** (1920x1080): Funcionalidad completa

## ⚡ Verificación de Performance (5-10 minutos)

### Métricas de Carga
- [ ] **Tiempo de carga inicial**: < 3 segundos
- [ ] **First Contentful Paint**: < 1.5 segundos
- [ ] **Largest Contentful Paint**: < 2.5 segundos
- [ ] **Cumulative Layout Shift**: < 0.1

### API Performance
- [ ] **Health check response**: < 1 segundo
- [ ] **Database queries**: < 2 segundos
- [ ] **Authentication requests**: < 3 segundos

### Herramientas de Testing
```bash
# Lighthouse audit
npx lighthouse https://tu-app.vercel.app --output=html

# Verificación automática de performance
npm run verify:production -- --verbose
```

### Métricas Esperadas
- [ ] **Performance Score**: > 80
- [ ] **Accessibility Score**: > 90
- [ ] **Best Practices Score**: > 80
- [ ] **SEO Score**: > 80

## 🔐 Verificación de Seguridad (5-10 minutos)

### Headers de Seguridad
```bash
# Verificar headers de seguridad
curl -I https://tu-app.vercel.app

# Headers esperados:
```
- [ ] **X-Frame-Options**: DENY o SAMEORIGIN
- [ ] **X-Content-Type-Options**: nosniff
- [ ] **Referrer-Policy**: strict-origin-when-cross-origin
- [ ] **Content-Security-Policy**: Configurado apropiadamente

### HTTPS y Certificados
- [ ] **HTTPS forzado**: HTTP redirige a HTTPS
- [ ] **Certificado válido**: SSL/TLS certificado activo
- [ ] **HSTS**: HTTP Strict Transport Security habilitado
- [ ] **Mixed content**: No hay contenido HTTP en páginas HTTPS

### Variables de Entorno
- [ ] **Variables públicas**: Solo `NEXT_PUBLIC_*` expuestas al cliente
- [ ] **Variables sensibles**: No expuestas en el bundle del cliente
- [ ] **API keys**: Configuradas correctamente en Vercel

## 🗄️ Verificación de Base de Datos (5-10 minutos)

### Conectividad
```bash
# Probar conexión a Supabase
npm run test:supabase

# Verificar health check incluye database status
curl https://tu-app.vercel.app/api/health | jq '.database'
```

### Configuración de Supabase
- [ ] **Database online**: Supabase proyecto activo
- [ ] **API keys válidas**: Anon key y URL correctos
- [ ] **RLS policies**: Row Level Security configurado
- [ ] **Site URL**: Configurado en Supabase Auth settings

### Schema y Datos
- [ ] **Tablas existentes**: workout_records y otras tablas necesarias
- [ ] **Permisos**: Usuario anónimo tiene permisos apropiados
- [ ] **Indexes**: Índices de performance configurados
- [ ] **Backup**: Sistema de backup activo

## 🔄 Verificación de Integración (10-15 minutos)

### Flujo de Usuario Completo
- [ ] **Visitar sitio**: Usuario puede acceder a la página principal
- [ ] **Navegar**: Todas las páginas son accesibles
- [ ] **Intentar login**: Formulario de login funciona (aunque falle auth)
- [ ] **Ver registro**: Formulario de workout registration visible
- [ ] **Acceder records**: Página de records requiere autenticación correctamente

### APIs y Endpoints
```bash
# Probar endpoints críticos
curl https://tu-app.vercel.app/api/health
curl https://tu-app.vercel.app/manifest.json
curl -I https://tu-app.vercel.app/favicon.ico
```

### Error Handling
- [ ] **404 pages**: Páginas no encontradas muestran error apropiado
- [ ] **500 errors**: Errores de servidor manejados gracefully
- [ ] **Network errors**: Errores de red manejados apropiadamente
- [ ] **Fallbacks**: Contenido de fallback cuando APIs fallan

## 📊 Verificación de Monitoreo (5 minutos)

### Logs y Métricas
```bash
# Verificar logs de Vercel
vercel logs --follow

# Verificar que no hay errores críticos
vercel logs | grep -i error
```

### Alertas y Notificaciones
- [ ] **Error tracking**: Errores se reportan correctamente
- [ ] **Performance monitoring**: Métricas se recolectan
- [ ] **Uptime monitoring**: Sistema de monitoreo activo
- [ ] **Alertas configuradas**: Notificaciones para downtime

## ✅ Verificación Final (5 minutos)

### Checklist de Completitud
- [ ] **Todas las verificaciones anteriores**: Completadas exitosamente
- [ ] **No errores críticos**: En logs de Vercel o Supabase
- [ ] **Performance aceptable**: Métricas dentro de umbrales
- [ ] **Funcionalidad core**: Todas las features principales funcionan

### Documentación
- [ ] **Deployment documentado**: Cambios registrados
- [ ] **Issues conocidos**: Documentados si existen
- [ ] **Next steps**: Próximos pasos identificados
- [ ] **Rollback plan**: Procedimiento de rollback confirmado

### Comunicación
- [ ] **Team notificado**: Equipo informado del deployment exitoso
- [ ] **Stakeholders informados**: Status comunicado a stakeholders
- [ ] **Documentation updated**: Documentación actualizada
- [ ] **Monitoring active**: Monitoreo post-deployment activo

## 🚨 Criterios de Fallo

### Rollback Inmediato Si:
- [ ] Sitio web completamente inaccesible
- [ ] Health check falla consistentemente
- [ ] Errores 500 en páginas principales
- [ ] Database completamente desconectada
- [ ] Performance degradada > 50%

### Investigación Requerida Si:
- [ ] Funcionalidades específicas no funcionan
- [ ] Performance degradada 20-50%
- [ ] Errores intermitentes en logs
- [ ] Algunos usuarios reportan problemas
- [ ] Métricas de monitoreo anómalas

## 📋 Template de Reporte

```markdown
# Reporte de Verificación Post-Despliegue

**Fecha**: [Date]
**Deployment ID**: [Vercel deployment ID]
**Verificado por**: [Name]

## Resumen
- ✅ Deployment exitoso
- ✅ Todas las verificaciones pasaron
- ⚠️ [Issues menores identificados]

## Métricas
- **Tiempo de carga**: [X] segundos
- **Health check**: [X] ms
- **Performance score**: [X]/100

## Issues Identificados
- [ ] [Issue 1] - Severidad: [Low/Medium/High]
- [ ] [Issue 2] - Severidad: [Low/Medium/High]

## Próximos Pasos
- [ ] [Action item 1]
- [ ] [Action item 2]

## Notas Adicionales
[Any additional observations]
```

## 🔄 Monitoreo Continuo

### Primeras 24 Horas
- [ ] **Verificar cada hora**: Health check y métricas básicas
- [ ] **Monitorear logs**: Revisar errores o warnings
- [ ] **User feedback**: Recopilar feedback de usuarios
- [ ] **Performance tracking**: Monitorear métricas de performance

### Primera Semana
- [ ] **Daily checks**: Verificación diaria de métricas
- [ ] **Error analysis**: Análisis de errores reportados
- [ ] **Performance trends**: Tendencias de performance
- [ ] **User analytics**: Análisis de uso y comportamiento

---

**Nota**: Esta checklist debe completarse para cada deployment a producción. Mantener registro de verificaciones para auditoría y mejora continua.