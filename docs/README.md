# Documentación de CrossFit Tracker

Bienvenido a la documentación completa de CrossFit Tracker. Esta documentación cubre todos los aspectos del desarrollo, despliegue y mantenimiento de la aplicación.

## 📚 Índice de Documentación

### 🚀 Despliegue y Producción
- **[Guía de Despliegue](./deployment-guide.md)** - Proceso completo paso a paso para desplegar en Vercel
- **[Troubleshooting de Despliegue](./troubleshooting-deployment.md)** - Soluciones para problemas comunes
- **[Procedimientos de Rollback](./rollback-procedures.md)** - Guías de rollback y recovery
- **[Checklist Post-Despliegue](./post-deployment-checklist.md)** - Verificación completa después del despliegue
- **[Verificación de Producción](./post-deployment-verification.md)** - Guía del script de verificación automática

### 🏗️ Desarrollo
- **[Estructura del Proyecto](../README.md)** - Información general del proyecto
- **[Configuración de Desarrollo](./development-setup.md)** - Setup local (si existe)

## 🎯 Guías Rápidas

### Para Desarrolladores
```bash
# Setup inicial
npm install
npm run dev

# Antes de hacer deploy
npm run deploy:check

# Deploy a producción
npm run deploy:vercel

# Verificar deployment
npm run verify:production
```

### Para DevOps/SRE
```bash
# Verificación rápida de producción
npm run verify:production -- --quick

# Rollback de emergencia
vercel rollback

# Monitoreo de logs
vercel logs --follow
```

### Para QA/Testing
```bash
# Tests completos
npm run test:ci

# Verificación post-deployment
npm run verify:production -- --verbose

# Performance audit
npm run performance:audit
```

## 🚨 Procedimientos de Emergencia

### Downtime Crítico
1. **Rollback inmediato**: `vercel rollback`
2. **Verificar recovery**: `curl https://tu-app.vercel.app/api/health`
3. **Notificar equipo**: Usar canales de comunicación establecidos
4. **Investigar causa**: Revisar logs y cambios recientes

### Problemas de Performance
1. **Verificar métricas**: `npm run verify:production`
2. **Revisar logs**: `vercel logs --follow`
3. **Performance audit**: `npm run performance:audit`
4. **Aplicar optimizaciones**: Según hallazgos del audit

### Problemas de Base de Datos
1. **Verificar conectividad**: `npm run test:supabase`
2. **Revisar variables**: `vercel env ls`
3. **Verificar Supabase status**: [status.supabase.com](https://status.supabase.com)
4. **Regenerar keys**: Si es necesario

## 📋 Checklists Rápidas

### Pre-Deployment ✅
- [ ] Tests pasando (`npm run test:ci:deploy`)
- [ ] Build exitoso (`npm run build:verify`)
- [ ] Variables de entorno configuradas
- [ ] Supabase conectado (`npm run test:supabase`)

### Post-Deployment ✅
- [ ] Health check OK (`/api/health`)
- [ ] Páginas principales cargan
- [ ] Autenticación funciona
- [ ] Performance aceptable
- [ ] Verificación automática pasa (`npm run verify:production`)

### Rollback ✅
- [ ] Problema identificado y documentado
- [ ] Rollback ejecutado (`vercel rollback`)
- [ ] Recovery verificado
- [ ] Equipo notificado
- [ ] Post-mortem programado

## 🔗 Enlaces Importantes

### Servicios
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
- **GitHub Repository**: [github.com/tu-usuario/crossfit-tracker](https://github.com/tu-usuario/crossfit-tracker)

### Status Pages
- **Vercel Status**: [vercel-status.com](https://vercel-status.com)
- **Supabase Status**: [status.supabase.com](https://status.supabase.com)
- **GitHub Status**: [githubstatus.com](https://githubstatus.com)

### Documentación Externa
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

## 📞 Contactos

### Equipo de Desarrollo
- **Team Lead**: [nombre@email.com]
- **Senior Developer**: [nombre@email.com]
- **DevOps**: [nombre@email.com]

### Escalation
- **Nivel 1**: Auto-rollback (0-5 min)
- **Nivel 2**: Team Lead (5-15 min)
- **Nivel 3**: Senior Developer (15-30 min)
- **Nivel 4**: Engineering Manager (30+ min)

## 🔄 Mantenimiento de Documentación

### Actualización Regular
- **Después de cada deployment**: Actualizar procedimientos si es necesario
- **Mensualmente**: Revisar y actualizar enlaces y contactos
- **Trimestralmente**: Review completo de todos los procedimientos

### Contribuciones
- Todos los miembros del equipo pueden contribuir
- Cambios importantes requieren review
- Mantener formato consistente
- Incluir ejemplos prácticos

## 📈 Métricas y KPIs

### Deployment Success
- **Target**: 95% deployments exitosos
- **Measurement**: Deployments sin rollback requerido
- **Review**: Semanal

### Recovery Time
- **Target**: < 15 minutos para rollback
- **Measurement**: Tiempo desde detección hasta recovery
- **Review**: Por incident

### Performance
- **Target**: < 3 segundos tiempo de carga
- **Measurement**: Lighthouse scores y verificación automática
- **Review**: Diario

---

**Última actualización**: $(date)  
**Versión de documentación**: 1.0.0  
**Mantenido por**: Equipo CrossFit Tracker

Para preguntas o sugerencias sobre esta documentación, contactar al equipo de desarrollo.