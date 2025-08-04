# Guía de Despliegue - CrossFit Tracker

Esta guía proporciona instrucciones paso a paso para desplegar CrossFit Tracker en Vercel.

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Configuración Inicial](#configuración-inicial)
3. [Variables de Entorno](#variables-de-entorno)
4. [Proceso de Despliegue](#proceso-de-despliegue)
5. [Verificación Post-Despliegue](#verificación-post-despliegue)
6. [Troubleshooting](#troubleshooting)
7. [Rollback y Recovery](#rollback-y-recovery)
8. [Checklist de Verificación](#checklist-de-verificación)

## 🔧 Prerrequisitos

### Herramientas Requeridas
- **Node.js**: v18.0.0 o superior
- **npm**: v8.0.0 o superior
- **Vercel CLI**: Instalado globalmente
- **Git**: Para control de versiones
- **Cuenta de Vercel**: Con acceso al proyecto
- **Proyecto Supabase**: Configurado y funcionando

### Verificación de Prerrequisitos
```bash
# Verificar versiones
node --version    # Debe ser >= 18.0.0
npm --version     # Debe ser >= 8.0.0
vercel --version  # Debe estar instalado

# Instalar Vercel CLI si no está instalado
npm install -g vercel
```

### Acceso Requerido
- ✅ Acceso de escritura al repositorio de GitHub
- ✅ Permisos de administrador en el proyecto Vercel
- ✅ Acceso a las credenciales de Supabase
- ✅ Variables de entorno de producción

## ⚙️ Configuración Inicial

### 1. Preparar el Repositorio
```bash
# Clonar el repositorio (si no lo tienes)
git clone https://github.com/tu-usuario/crossfit-tracker.git
cd crossfit-tracker

# Instalar dependencias
npm install

# Verificar que todo funciona localmente
npm run dev
```

### 2. Configurar Vercel CLI
```bash
# Iniciar sesión en Vercel
vercel login

# Vincular el proyecto (solo la primera vez)
vercel link

# Verificar configuración
vercel env ls
```

## 🔐 Variables de Entorno

### Variables Requeridas para Producción

| Variable | Descripción | Ejemplo | Requerida |
|----------|-------------|---------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública de Supabase | `https://xxx.supabase.co` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ |
| `SUPABASE_ACCESS_TOKEN` | Token de acceso personal | `sbp_xxx...` | ✅ |

### Configurar Variables en Vercel

#### Opción 1: Vercel Dashboard
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Añade cada variable con su valor correspondiente
5. Selecciona los entornos: **Production**, **Preview**, **Development**

#### Opción 2: Vercel CLI
```bash
# Añadir variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_ACCESS_TOKEN production

# Verificar variables configuradas
vercel env ls
```

### Obtener Credenciales de Supabase

1. **URL y Anon Key**:
   - Ve a tu proyecto en [supabase.com](https://supabase.com)
   - Settings → API
   - Copia `URL` y `anon public`

2. **Access Token**:
   - Ve a [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
   - Genera un nuevo token
   - Copia el token generado

## 🚀 Proceso de Despliegue

### Despliegue Automático (Recomendado)

#### 1. Configurar GitHub Integration
```bash
# Asegurar que el repositorio está actualizado
git add .
git commit -m "feat: prepare for production deployment"
git push origin main
```

#### 2. Configurar Auto-Deploy en Vercel
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Git
3. Asegurar que **Auto-deploy** está habilitado para `main`
4. Configurar **Build Command**: `npm run build`
5. Configurar **Output Directory**: `.next`

#### 3. Trigger Deployment
```bash
# Hacer push a main para trigger automático
git push origin main

# O hacer deployment manual
vercel --prod
```

### Despliegue Manual

#### 1. Pre-deployment Checks
```bash
# Ejecutar verificaciones pre-despliegue
npm run deploy:check

# Esto ejecuta:
# - npm run pre-deploy:env    (verificar variables)
# - npm run type-check        (verificar TypeScript)
# - npm run lint:check        (verificar linting)
# - npm run test:ci:deploy    (ejecutar tests)
# - npm run build:verify      (verificar build)
```

#### 2. Deploy to Production
```bash
# Despliegue directo a producción
npm run deploy:vercel

# O usando Vercel CLI directamente
vercel --prod
```

#### 3. Deploy Preview (Opcional)
```bash
# Crear deployment de preview
npm run deploy:preview

# O usando Vercel CLI
vercel
```

### Monitoreo del Despliegue

```bash
# Ver logs del deployment en tiempo real
vercel logs [deployment-url]

# Ver status del deployment
vercel inspect [deployment-url]

# Listar deployments recientes
vercel ls
```

## ✅ Verificación Post-Despliegue

### 1. Verificación Automática
```bash
# Ejecutar script de verificación completa
npm run verify:production

# Verificación rápida (solo tests esenciales)
npm run verify:production -- --quick

# Verificación con URL específica
npm run verify:production -- --url https://tu-app.vercel.app

# Verificación verbose (más detalles)
npm run verify:production -- --verbose
```

### 2. Verificación Manual

#### Health Check
```bash
# Verificar endpoint de salud
curl https://tu-app.vercel.app/api/health

# Respuesta esperada:
# {
#   "status": "ok",
#   "database": "connected",
#   "timestamp": "2024-01-01T00:00:00.000Z"
# }
```

#### Funcionalidades Core
1. **Navegación**: Verificar que todas las páginas cargan
2. **Autenticación**: Probar login/registro
3. **Workout Registration**: Verificar formulario de workouts
4. **Records**: Comprobar visualización de registros
5. **Responsive**: Probar en dispositivos móviles

### 3. Performance Check
```bash
# Verificar performance con Lighthouse
npm run performance:audit

# O manualmente
npx lighthouse https://tu-app.vercel.app --output=html
```

## 🔧 Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Build Failures

**Error**: `Type errors found`
```bash
# Solución
npm run type-check
# Corregir errores de TypeScript y volver a desplegar
```

**Error**: `Lint errors found`
```bash
# Solución
npm run lint
# Corregir errores de linting y volver a desplegar
```

**Error**: `Tests failing`
```bash
# Solución
npm run test:ci:deploy
# Revisar y corregir tests fallidos
```

#### 2. Runtime Errors

**Error**: `Database connection failed`
```bash
# Verificar variables de entorno
vercel env ls

# Probar conexión local
npm run test:supabase

# Verificar que las variables están correctas en Vercel Dashboard
```

**Error**: `404 on API routes`
```bash
# Verificar que los archivos API están en app/api/
# Verificar que el build incluye las rutas API
# Revisar vercel.json configuration
```

**Error**: `Environment variables not found`
```bash
# Verificar variables en Vercel
vercel env ls

# Añadir variables faltantes
vercel env add VARIABLE_NAME production

# Re-deploy
vercel --prod
```

#### 3. Performance Issues

**Error**: `Slow page load times`
```bash
# Verificar bundle size
npm run build:analyze

# Optimizar imports
# Implementar lazy loading
# Verificar imágenes optimizadas
```

**Error**: `API timeouts`
```bash
# Verificar configuración de Vercel functions
# Revisar vercel.json para timeouts
# Optimizar queries de Supabase
```

#### 4. Authentication Issues

**Error**: `Auth not working in production`
```bash
# Verificar Supabase URL configuration
# Comprobar Site URL en Supabase Dashboard
# Verificar redirect URLs configuradas
```

### Logs y Debugging

```bash
# Ver logs de función específica
vercel logs --follow

# Ver logs de deployment específico
vercel logs [deployment-id]

# Debug con variables de entorno
vercel env pull .env.local
npm run dev
```

## 🔄 Rollback y Recovery

### Rollback Automático

#### Usando Vercel Dashboard
1. Ve a tu proyecto en Vercel
2. Pestaña **Deployments**
3. Encuentra el deployment estable anterior
4. Click en **⋯** → **Promote to Production**

#### Usando Vercel CLI
```bash
# Listar deployments recientes
vercel ls

# Promover deployment específico
vercel promote [deployment-url]

# Rollback al deployment anterior
vercel rollback
```

### Rollback Manual

```bash
# 1. Identificar último commit estable
git log --oneline -10

# 2. Crear branch de rollback
git checkout -b rollback/emergency-fix [commit-hash]

# 3. Push y deploy
git push origin rollback/emergency-fix
vercel --prod
```

### Recovery Procedures

#### 1. Database Issues
```bash
# Verificar estado de Supabase
curl https://tu-supabase-url.supabase.co/rest/v1/

# Revisar logs de Supabase
# Contactar soporte si es necesario
```

#### 2. Complete Site Down
```bash
# 1. Rollback inmediato
vercel rollback

# 2. Verificar variables de entorno
vercel env ls

# 3. Re-deploy con fix
git revert [problematic-commit]
git push origin main
```

#### 3. Partial Functionality Loss
```bash
# 1. Identificar funcionalidad afectada
npm run verify:production

# 2. Deploy hotfix
git checkout -b hotfix/critical-fix
# Hacer cambios necesarios
git commit -m "hotfix: critical issue"
git push origin hotfix/critical-fix
vercel --prod
```

## ✅ Checklist de Verificación Post-Despliegue

### Pre-Deployment ✅
- [ ] Variables de entorno configuradas
- [ ] Tests pasando (`npm run test:ci:deploy`)
- [ ] Build exitoso (`npm run build:verify`)
- [ ] Type checking sin errores (`npm run type-check`)
- [ ] Linting sin errores (`npm run lint:check`)
- [ ] Conexión a Supabase verificada (`npm run test:supabase`)

### Deployment ✅
- [ ] Deployment completado sin errores
- [ ] URL de producción accesible
- [ ] Health check endpoint funcionando (`/api/health`)
- [ ] Variables de entorno cargadas correctamente

### Post-Deployment ✅
- [ ] **Páginas principales cargan correctamente**:
  - [ ] `/` (Dashboard)
  - [ ] `/login` (Autenticación)
  - [ ] `/register` (Registro de workouts)
  - [ ] `/records` (Historial)
  - [ ] `/conversions` (Conversiones)
  - [ ] `/percentages` (Porcentajes)

- [ ] **Funcionalidad de autenticación**:
  - [ ] Formulario de login visible
  - [ ] Formulario de registro accesible
  - [ ] Rutas protegidas redirigen correctamente
  - [ ] Logout funciona correctamente

- [ ] **Registro de workouts**:
  - [ ] Formulario de workout accesible
  - [ ] Campos requeridos presentes (ejercicio, peso, reps)
  - [ ] Validación de formulario funciona

- [ ] **Visualización de records**:
  - [ ] Página de records accesible
  - [ ] Datos se muestran correctamente (si hay datos)
  - [ ] Filtros y ordenamiento funcionan

- [ ] **Performance y responsiveness**:
  - [ ] Tiempo de carga < 3 segundos
  - [ ] API responses < 1 segundo
  - [ ] Diseño responsive en móvil
  - [ ] PWA manifest accesible

- [ ] **Verificación automática**:
  - [ ] `npm run verify:production` pasa todos los tests
  - [ ] No hay errores en logs de Vercel
  - [ ] Métricas de performance aceptables

### Monitoring Setup ✅
- [ ] Alerts configuradas para downtime
- [ ] Error tracking funcionando
- [ ] Performance monitoring activo
- [ ] Backup procedures documentadas

## 📞 Contactos de Emergencia

### Servicios Críticos
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **GitHub Support**: [support.github.com](https://support.github.com)

### Escalation Procedures
1. **Nivel 1**: Rollback automático
2. **Nivel 2**: Contactar team lead
3. **Nivel 3**: Contactar soporte de servicios
4. **Nivel 4**: Escalation a management

## 📚 Recursos Adicionales

### Documentación
- [Vercel Deployment Docs](https://vercel.com/docs/deployments)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-to-prod)

### Scripts Útiles
```bash
# Verificación completa pre-deploy
npm run deploy:check

# Verificación post-deploy
npm run verify:production

# Performance audit
npm run performance:audit

# Rollback de emergencia
vercel rollback
```

### Monitoreo Continuo
- Configurar alertas de uptime
- Monitorear métricas de performance
- Revisar logs regularmente
- Mantener documentación actualizada

---

**Última actualización**: $(date)
**Versión**: 1.0.0
**Mantenido por**: Equipo de Desarrollo CrossFit Tracker