# Troubleshooting - Despliegue CrossFit Tracker

Esta guía proporciona soluciones detalladas para problemas comunes durante el despliegue.

## 🚨 Problemas Críticos

### 1. Sitio Completamente Inaccesible

#### Síntomas
- Error 500 en todas las páginas
- "This Serverless Function has crashed" 
- Timeout en todas las requests

#### Diagnóstico
```bash
# Verificar status del deployment
vercel inspect [deployment-url]

# Ver logs en tiempo real
vercel logs --follow

# Verificar health check
curl https://tu-app.vercel.app/api/health
```

#### Soluciones

**Solución 1: Rollback Inmediato**
```bash
# Rollback al deployment anterior
vercel rollback

# Verificar que el rollback funcionó
curl https://tu-app.vercel.app/api/health
```

**Solución 2: Variables de Entorno**
```bash
# Verificar variables críticas
vercel env ls

# Añadir variables faltantes
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Re-deploy
vercel --prod
```

**Solución 3: Build Issues**
```bash
# Verificar build localmente
npm run build

# Si falla, corregir errores y re-deploy
git add .
git commit -m "fix: resolve build issues"
git push origin main
```

### 2. Base de Datos No Conecta

#### Síntomas
- Health check retorna `database: "disconnected"`
- Errores de autenticación
- No se pueden cargar/guardar workouts

#### Diagnóstico
```bash
# Probar conexión a Supabase
npm run test:supabase

# Verificar variables de entorno
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Soluciones

**Verificar Configuración de Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Verifica que el proyecto está activo
3. Settings → API → Verifica URL y keys
4. Settings → Authentication → Verifica Site URL

**Actualizar Variables**
```bash
# Obtener nuevas credenciales de Supabase
# Actualizar en Vercel
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production

vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production  
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Re-deploy
vercel --prod
```

## ⚠️ Problemas de Build

### 1. TypeScript Errors

#### Síntomas
```
Error: Type errors found
src/components/WorkoutForm.tsx(45,12): error TS2339: Property 'exercise' does not exist on type 'FormData'
```

#### Soluciones
```bash
# Verificar errores localmente
npm run type-check

# Corregir errores de tipos
# Ejemplo: Añadir tipos faltantes
interface FormData {
  exercise: string;
  weight: number;
  reps: number;
}

# Verificar que se corrigió
npm run type-check

# Commit y deploy
git add .
git commit -m "fix: resolve TypeScript errors"
git push origin main
```

### 2. Linting Errors

#### Síntomas
```
Error: ESLint found errors
src/app/page.tsx: 'React' is defined but never used
```

#### Soluciones
```bash
# Auto-fix errores de linting
npm run lint

# Si hay errores que no se pueden auto-fix
npm run lint:check

# Corregir manualmente y verificar
npm run lint:check

# Deploy
git add .
git commit -m "fix: resolve linting errors"
git push origin main
```

### 3. Test Failures

#### Síntomas
```
Error: Tests failed
FAIL __tests__/components/WorkoutForm.test.tsx
```

#### Soluciones
```bash
# Ejecutar tests localmente
npm run test:ci:deploy

# Para tests específicos
npm test -- __tests__/components/WorkoutForm.test.tsx

# Corregir tests fallidos
# Verificar que pasan
npm run test:ci:deploy

# Deploy
git add .
git commit -m "fix: resolve failing tests"
git push origin main
```

## 🔧 Problemas de Runtime

### 1. API Routes No Funcionan

#### Síntomas
- 404 en `/api/health`
- API endpoints no responden
- "API route not found"

#### Diagnóstico
```bash
# Verificar estructura de archivos
ls -la app/api/
ls -la app/api/health/

# Verificar que route.ts existe
cat app/api/health/route.ts
```

#### Soluciones

**Verificar Estructura de Archivos**
```
app/
├── api/
│   └── health/
│       └── route.ts    # Debe existir
```

**Verificar Contenido de route.ts**
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
}
```

**Re-deploy**
```bash
git add app/api/
git commit -m "fix: ensure API routes are properly configured"
git push origin main
```

### 2. Autenticación No Funciona

#### Síntomas
- Login form no aparece
- Redirects infinitos
- "Authentication failed"

#### Diagnóstico
```bash
# Verificar configuración de Supabase Auth
curl https://tu-supabase-url.supabase.co/auth/v1/settings

# Verificar Site URL en Supabase
# Debe ser: https://tu-app.vercel.app
```

#### Soluciones

**Configurar Site URL en Supabase**
1. Ve a Supabase Dashboard
2. Authentication → Settings
3. Site URL: `https://tu-app.vercel.app`
4. Redirect URLs: `https://tu-app.vercel.app/auth/callback`

**Verificar Variables de Auth**
```bash
# Verificar que las variables están correctas
vercel env ls | grep SUPABASE

# Si están incorrectas, actualizarlas
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```

### 3. Páginas No Cargan

#### Síntomas
- 404 en páginas específicas
- "Page not found"
- Routing no funciona

#### Diagnóstico
```bash
# Verificar estructura de páginas
ls -la app/
ls -la app/login/
ls -la app/register/
```

#### Soluciones

**Verificar Estructura de App Router**
```
app/
├── page.tsx           # /
├── login/
│   └── page.tsx      # /login
├── register/
│   └── page.tsx      # /register
└── records/
    └── page.tsx      # /records
```

**Verificar Exports**
```typescript
// app/login/page.tsx
export default function LoginPage() {
  return <div>Login Page</div>;
}
```

## 📊 Problemas de Performance

### 1. Páginas Cargan Lento

#### Síntomas
- Tiempo de carga > 5 segundos
- "Slow response time" en verificación
- Users reportan lentitud

#### Diagnóstico
```bash
# Verificar bundle size
npm run build:analyze

# Performance audit
npm run performance:audit

# Verificar con script de verificación
npm run verify:production -- --verbose
```

#### Soluciones

**Optimizar Bundle**
```bash
# Verificar imports innecesarios
# Implementar lazy loading
# Ejemplo:
const WorkoutForm = lazy(() => import('./components/WorkoutForm'));

# Verificar mejora
npm run build:analyze
```

**Optimizar Imágenes**
```typescript
// Usar Next.js Image component
import Image from 'next/image';

<Image
  src="/workout-icon.png"
  alt="Workout"
  width={100}
  height={100}
  priority
/>
```

### 2. API Responses Lentas

#### Síntomas
- API timeout errors
- Health check > 2 segundos
- Database queries lentas

#### Soluciones

**Optimizar Queries de Supabase**
```typescript
// Antes: Query ineficiente
const { data } = await supabase
  .from('workout_records')
  .select('*');

// Después: Query optimizada
const { data } = await supabase
  .from('workout_records')
  .select('id, exercise, weight, reps, created_at')
  .limit(50)
  .order('created_at', { ascending: false });
```

**Configurar Timeouts en Vercel**
```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

## 🔐 Problemas de Seguridad

### 1. CORS Errors

#### Síntomas
```
Access to fetch at 'https://api.supabase.co' from origin 'https://tu-app.vercel.app' has been blocked by CORS policy
```

#### Soluciones

**Configurar CORS en Supabase**
1. Ve a Supabase Dashboard
2. Settings → API
3. CORS origins: `https://tu-app.vercel.app`

**Headers en Vercel**
```json
// vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

### 2. Environment Variables Exposed

#### Síntomas
- Variables sensibles visibles en client
- Security warnings en logs

#### Soluciones

**Verificar Variables Públicas**
```bash
# Solo estas variables deben ser NEXT_PUBLIC_*
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Estas NO deben ser públicas
SUPABASE_ACCESS_TOKEN=xxx  # Sin NEXT_PUBLIC_
```

**Mover Variables Sensibles**
```typescript
// Usar en server components o API routes únicamente
const serviceKey = process.env.SUPABASE_SERVICE_KEY; // Server-side only
```

## 🔄 Procedimientos de Recovery

### Recovery Rápido (< 5 minutos)

```bash
# 1. Rollback inmediato
vercel rollback

# 2. Verificar que funciona
curl https://tu-app.vercel.app/api/health

# 3. Notificar a usuarios (si es necesario)
```

### Recovery Completo (< 30 minutos)

```bash
# 1. Identificar problema
vercel logs --follow

# 2. Crear hotfix branch
git checkout -b hotfix/critical-issue

# 3. Aplicar fix mínimo
# (Solo cambios críticos)

# 4. Test rápido
npm run test:ci:deploy

# 5. Deploy hotfix
git push origin hotfix/critical-issue
vercel --prod

# 6. Verificar fix
npm run verify:production

# 7. Merge a main
git checkout main
git merge hotfix/critical-issue
git push origin main
```

### Recovery de Desastre (> 30 minutos)

```bash
# 1. Activar modo mantenimiento
# (Crear página estática de mantenimiento)

# 2. Investigar problema completo
git log --oneline -20
vercel logs [deployment-id]

# 3. Crear fix completo
git checkout -b fix/disaster-recovery

# 4. Testing exhaustivo
npm run test
npm run build
npm run verify:production -- --url staging-url

# 5. Deploy gradual
vercel --prod
npm run verify:production

# 6. Monitoreo post-recovery
# Verificar métricas por 24h
```

## 📞 Escalation Matrix

| Severidad | Tiempo | Acción | Contacto |
|-----------|--------|--------|----------|
| **P0 - Crítico** | 0-5 min | Rollback automático | Team Lead |
| **P1 - Alto** | 5-30 min | Hotfix deployment | Senior Dev |
| **P2 - Medio** | 30min-2h | Fix programado | Dev Team |
| **P3 - Bajo** | 2h-24h | Next sprint | Product Owner |

## 📋 Checklist de Troubleshooting

### Antes de Escalar
- [ ] Rollback intentado
- [ ] Logs revisados
- [ ] Variables de entorno verificadas
- [ ] Health check probado
- [ ] Documentación consultada

### Durante la Investigación
- [ ] Problema reproducido localmente
- [ ] Root cause identificado
- [ ] Fix mínimo viable creado
- [ ] Tests verificados
- [ ] Impact assessment completado

### Después del Fix
- [ ] Deployment verificado
- [ ] Monitoring activo
- [ ] Post-mortem programado
- [ ] Documentación actualizada
- [ ] Preventive measures implementadas

---

**Para emergencias críticas**: Contactar inmediatamente al team lead
**Para consultas**: Revisar esta documentación primero