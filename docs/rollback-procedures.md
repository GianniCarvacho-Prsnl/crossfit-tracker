# Procedimientos de Rollback y Recovery

Esta guía detalla los procedimientos para rollback y recovery en caso de problemas con el despliegue.

## 🚨 Tipos de Rollback

### 1. Rollback Automático (Recomendado)
**Tiempo estimado**: 2-5 minutos  
**Uso**: Problemas críticos que afectan toda la aplicación

### 2. Rollback Manual
**Tiempo estimado**: 5-15 minutos  
**Uso**: Problemas específicos o cuando el automático no funciona

### 3. Recovery Completo
**Tiempo estimado**: 15-60 minutos  
**Uso**: Problemas complejos que requieren investigación

## ⚡ Rollback Automático

### Usando Vercel Dashboard

#### Paso 1: Acceder al Dashboard
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona el proyecto **crossfit-tracker**
3. Ve a la pestaña **Deployments**

#### Paso 2: Identificar Deployment Estable
```
✅ [deployment-abc123] - 2 hours ago - READY
❌ [deployment-def456] - 30 min ago - ERROR  <- Deployment problemático
✅ [deployment-ghi789] - 4 hours ago - READY  <- Último estable
```

#### Paso 3: Promover Deployment Anterior
1. Click en el deployment estable (✅)
2. Click en **⋯** (tres puntos)
3. Seleccionar **Promote to Production**
4. Confirmar la acción

#### Paso 4: Verificar Rollback
```bash
# Verificar que el rollback funcionó
curl https://tu-app.vercel.app/api/health

# Respuesta esperada:
# {
#   "status": "ok",
#   "database": "connected",
#   "timestamp": "2024-01-01T00:00:00.000Z"
# }
```

### Usando Vercel CLI

#### Rollback Rápido
```bash
# Rollback al deployment anterior
vercel rollback

# Verificar el rollback
vercel ls
curl https://tu-app.vercel.app/api/health
```

#### Rollback a Deployment Específico
```bash
# Listar deployments recientes
vercel ls

# Promover deployment específico
vercel promote https://crossfit-tracker-abc123.vercel.app

# Verificar
npm run verify:production
```

## 🔧 Rollback Manual

### Cuando Usar Rollback Manual
- Vercel CLI no está disponible
- Problemas específicos de funcionalidad
- Necesitas control granular del proceso

### Procedimiento Paso a Paso

#### Paso 1: Identificar Commit Estable
```bash
# Ver historial de commits
git log --oneline -10

# Ejemplo de output:
# abc1234 feat: add new workout feature  <- Problemático
# def5678 fix: improve performance       <- Último estable
# ghi9012 feat: update UI components
```

#### Paso 2: Crear Branch de Rollback
```bash
# Crear branch desde commit estable
git checkout -b rollback/emergency-$(date +%Y%m%d-%H%M) def5678

# Verificar que estás en el commit correcto
git log --oneline -1
```

#### Paso 3: Deploy del Rollback
```bash
# Push del branch de rollback
git push origin rollback/emergency-$(date +%Y%m%d-%H%M)

# Deploy a producción
vercel --prod

# O configurar el branch como production branch temporalmente
```

#### Paso 4: Verificar Rollback
```bash
# Verificación completa
npm run verify:production

# Verificación específica de funcionalidad afectada
curl https://tu-app.vercel.app/api/health
curl https://tu-app.vercel.app/login
```

## 🔄 Recovery Completo

### Cuándo Usar Recovery Completo
- Rollback automático falló
- Problemas de base de datos
- Corrupción de datos
- Problemas de infraestructura

### Procedimiento de Recovery

#### Fase 1: Evaluación (5-10 minutos)

```bash
# 1. Evaluar el alcance del problema
vercel logs --follow

# 2. Verificar servicios externos
curl https://tu-supabase-url.supabase.co/rest/v1/
curl https://api.vercel.com/v1/user

# 3. Identificar root cause
git diff HEAD~1 HEAD
npm run test:ci:deploy
```

#### Fase 2: Rollback de Emergencia (2-5 minutos)

```bash
# 1. Rollback inmediato para minimizar downtime
vercel rollback

# 2. Verificar que el rollback funciona parcialmente
curl https://tu-app.vercel.app/api/health

# 3. Comunicar status a stakeholders
echo "Site rolled back, investigating issue" > status.txt
```

#### Fase 3: Investigación y Fix (15-45 minutos)

```bash
# 1. Crear branch de investigación
git checkout -b investigate/critical-issue-$(date +%Y%m%d)

# 2. Reproducir problema localmente
npm install
npm run dev
# Probar funcionalidad afectada

# 3. Identificar y aplicar fix
# (Hacer cambios mínimos necesarios)

# 4. Verificar fix localmente
npm run test:ci:deploy
npm run build:verify
```

#### Fase 4: Deploy del Fix (5-10 minutos)

```bash
# 1. Commit del fix
git add .
git commit -m "fix: resolve critical issue [emergency]"

# 2. Push y deploy
git push origin investigate/critical-issue-$(date +%Y%m%d)
vercel --prod

# 3. Verificar que el fix funciona
npm run verify:production
```

#### Fase 5: Monitoreo Post-Recovery (30-60 minutos)

```bash
# 1. Monitoreo continuo
watch -n 30 'curl -s https://tu-app.vercel.app/api/health | jq'

# 2. Verificar métricas
vercel logs --follow

# 3. Confirmar estabilidad
# Esperar 30-60 minutos sin errores
```

## 📊 Recovery de Base de Datos

### Problemas de Conectividad

#### Diagnóstico
```bash
# Verificar conexión a Supabase
npm run test:supabase

# Verificar variables de entorno
vercel env ls | grep SUPABASE

# Probar conexión directa
curl https://tu-supabase-url.supabase.co/rest/v1/workout_records \
  -H "apikey: tu-anon-key"
```

#### Recovery
```bash
# 1. Verificar status de Supabase
# Ve a https://status.supabase.com

# 2. Regenerar API keys si es necesario
# Supabase Dashboard → Settings → API

# 3. Actualizar variables en Vercel
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# 4. Re-deploy
vercel --prod
```

### Problemas de Datos

#### Backup de Datos
```sql
-- Crear backup de datos críticos
SELECT * FROM workout_records 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Exportar a CSV desde Supabase Dashboard
-- Table Editor → Export → CSV
```

#### Restaurar Datos
```sql
-- Si hay pérdida de datos, restaurar desde backup
-- Usar Supabase Dashboard o SQL Editor

INSERT INTO workout_records (user_id, exercise, weight, reps, created_at)
VALUES 
  -- Datos del backup
  ('user-id', 'Clean', 100, 5, '2024-01-01T10:00:00Z');
```

## 🚨 Procedimientos de Emergencia

### Downtime Completo

#### Acción Inmediata (0-2 minutos)
```bash
# 1. Rollback inmediato
vercel rollback

# 2. Verificar si resuelve el problema
curl https://tu-app.vercel.app/api/health

# 3. Si no funciona, activar página de mantenimiento
# (Crear deployment estático simple)
```

#### Página de Mantenimiento
```html
<!-- maintenance.html -->
<!DOCTYPE html>
<html>
<head>
    <title>CrossFit Tracker - Mantenimiento</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Mantenimiento Programado</h1>
        <p>CrossFit Tracker está temporalmente fuera de servicio para mantenimiento.</p>
        <p>Estaremos de vuelta pronto. Gracias por tu paciencia.</p>
        <p><strong>Tiempo estimado:</strong> 30 minutos</p>
        <p><small>Última actualización: <span id="timestamp"></span></small></p>
    </div>
    <script>
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
    </script>
</body>
</html>
```

### Problemas de Seguridad

#### Compromiso de Credenciales
```bash
# 1. Regenerar todas las API keys inmediatamente
# Supabase Dashboard → Settings → API → Regenerate

# 2. Actualizar variables en Vercel
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# 3. Revisar logs de acceso
# Supabase Dashboard → Logs
# Vercel Dashboard → Functions → Logs

# 4. Re-deploy con nuevas credenciales
vercel --prod

# 5. Monitorear actividad sospechosa
```

## 📋 Checklist de Rollback

### Pre-Rollback ✅
- [ ] Problema confirmado y documentado
- [ ] Impacto evaluado (usuarios afectados, funcionalidades)
- [ ] Deployment estable identificado
- [ ] Stakeholders notificados
- [ ] Backup de datos críticos (si aplica)

### Durante Rollback ✅
- [ ] Rollback ejecutado
- [ ] Health check verificado
- [ ] Funcionalidades críticas probadas
- [ ] Logs monitoreados
- [ ] Performance verificada

### Post-Rollback ✅
- [ ] Estabilidad confirmada (30+ minutos)
- [ ] Usuarios notificados de resolución
- [ ] Root cause identificado
- [ ] Fix programado
- [ ] Post-mortem agendado
- [ ] Documentación actualizada

## 📞 Contactos de Emergencia

### Escalation Path
1. **Nivel 1** (0-5 min): Auto-rollback
2. **Nivel 2** (5-15 min): Team Lead
3. **Nivel 3** (15-30 min): Senior Developer
4. **Nivel 4** (30+ min): Engineering Manager

### Servicios Críticos
- **Vercel Status**: [vercel-status.com](https://vercel-status.com)
- **Supabase Status**: [status.supabase.com](https://status.supabase.com)
- **GitHub Status**: [githubstatus.com](https://githubstatus.com)

### Comunicación
- **Slack**: #crossfit-tracker-alerts
- **Email**: team@crossfit-tracker.com
- **Status Page**: status.crossfit-tracker.com

## 📚 Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

## Resumen
- **Fecha**: [Date]
- **Duración**: [Duration]
- **Impacto**: [User impact]
- **Root Cause**: [Brief description]

## Timeline
- **[Time]**: Incident detected
- **[Time]**: Rollback initiated
- **[Time]**: Service restored
- **[Time]**: Root cause identified
- **[Time]**: Permanent fix deployed

## Root Cause Analysis
[Detailed analysis]

## Action Items
- [ ] [Action 1] - Owner: [Name] - Due: [Date]
- [ ] [Action 2] - Owner: [Name] - Due: [Date]

## Lessons Learned
[Key takeaways]

## Prevention Measures
[How to prevent similar issues]
```

---

**Recuerda**: En caso de duda, siempre prioriza la estabilidad del servicio. Es mejor hacer un rollback rápido y investigar después que intentar arreglar en producción.