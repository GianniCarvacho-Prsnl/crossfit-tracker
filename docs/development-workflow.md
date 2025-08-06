# Flujo de Desarrollo - CrossFit Tracker

## 🌿 Estrategia de Branching

### Estructura de Ramas
```
main (producción)
├── feature/nueva-funcionalidad
├── improvement/optimizar-dashboard  
├── hotfix/corregir-bug-critico
└── experiment/probar-nueva-idea
```

## 🔄 Flujos de Trabajo

### 1. Nueva Feature
```bash
# Crear rama desde main
git checkout main
git pull origin main
git checkout -b feature/nombre-descriptivo

# Ejemplo: Añadir gráficos al dashboard
git checkout -b feature/dashboard-charts

# Desarrollar la feature
# ... hacer cambios ...

# Commits descriptivos
git add .
git commit -m "feat: add progress charts to dashboard"
git commit -m "feat: add chart filtering by exercise type"
git commit -m "style: improve chart responsive design"

# Push para crear preview deployment
git push origin feature/dashboard-charts

# Vercel automáticamente crea:
# https://crossfit-tracker-git-feature-dashboard-charts-giannicarvacho-prsnls-projects.vercel.app
```

### 2. Mejora de Feature Existente
```bash
# Crear rama de improvement
git checkout -b improvement/optimize-workout-form

# Hacer mejoras
git add .
git commit -m "perf: optimize workout form validation"
git commit -m "ux: improve form error messages"

# Push y probar
git push origin improvement/optimize-workout-form
```

### 3. Hotfix Crítico
```bash
# Para bugs críticos en producción
git checkout main
git checkout -b hotfix/fix-login-error

# Aplicar fix
git add .
git commit -m "fix: resolve login authentication error"

# Merge directo a main (sin PR para emergencias)
git checkout main
git merge hotfix/fix-login-error
git push origin main

# Vercel despliega automáticamente
```

### 4. Experimento/Prueba
```bash
# Para probar ideas sin compromiso
git checkout -b experiment/new-ui-design

# Experimentar libremente
git add .
git commit -m "experiment: try new dashboard layout"

# Si funciona, convertir a feature branch
# Si no, simplemente eliminar la rama
```

## 🚀 Preview Deployments

### Cómo Funcionan
- **Automático**: Cada push a cualquier rama crea un preview
- **URL Predecible**: `https://crossfit-tracker-git-[branch-name]-[user].vercel.app`
- **Aislado**: No afecta producción
- **Completo**: Incluye base de datos y todas las funcionalidades

### Ejemplos de URLs de Preview
```bash
# Feature branch
feature/dashboard-charts
→ https://crossfit-tracker-git-feature-dashboard-charts-giannicarvacho-prsnls-projects.vercel.app

# Improvement branch  
improvement/optimize-forms
→ https://crossfit-tracker-git-improvement-optimize-forms-giannicarvacho-prsnls-projects.vercel.app

# Hotfix branch
hotfix/fix-auth-bug
→ https://crossfit-tracker-git-hotfix-fix-auth-bug-giannicarvacho-prsnls-projects.vercel.app
```

## 🧪 Testing en Preview

### Verificación Automática
```bash
# Probar preview deployment
PRODUCTION_URL=https://preview-url.vercel.app npm run verify:production

# Verificación rápida
PRODUCTION_URL=https://preview-url.vercel.app npm run verify:production -- --quick

# Verificación detallada
PRODUCTION_URL=https://preview-url.vercel.app npm run verify:production -- --verbose
```

### Testing Manual
```bash
# Verificar endpoints principales
curl -s -o /dev/null -w "%{http_code}" https://preview-url.vercel.app
curl -s -o /dev/null -w "%{http_code}" https://preview-url.vercel.app/api/health
curl -s -o /dev/null -w "%{http_code}" https://preview-url.vercel.app/login
```

## 📋 Checklist de Development

### Antes de Crear Branch
- [ ] `git checkout main && git pull origin main`
- [ ] Verificar que main está estable
- [ ] Definir objetivo claro de la feature/improvement

### Durante el Desarrollo
- [ ] Commits frecuentes y descriptivos
- [ ] Seguir convención de commits: `feat:`, `fix:`, `style:`, `perf:`
- [ ] Probar localmente: `npm run dev`
- [ ] Ejecutar tests: `npm run test`

### Antes del Push
- [ ] Build exitoso: `npm run build`
- [ ] Linting limpio: `npm run lint`
- [ ] TypeScript sin errores: `npm run type-check`
- [ ] Tests pasando: `npm run test:ci:deploy`

### Después del Push
- [ ] Verificar que preview deployment se creó
- [ ] Probar funcionalidad en preview URL
- [ ] Ejecutar verificación: `npm run verify:production`

### Antes del Merge a Main
- [ ] Preview deployment funcionando correctamente
- [ ] Todos los tests pasando
- [ ] Code review (si trabajas en equipo)
- [ ] Documentación actualizada si es necesario

## 🔄 Merge a Producción

### Proceso Recomendado
```bash
# 1. Asegurar que main está actualizado
git checkout main
git pull origin main

# 2. Merge de la feature branch
git merge feature/nombre-feature

# 3. Push a main
git push origin main

# 4. Vercel despliega automáticamente a producción
# 5. Verificar deployment
sleep 30  # Esperar a que termine el deployment
npm run verify:production

# 6. Limpiar branch local (opcional)
git branch -d feature/nombre-feature
```

### Merge con Pull Request (Recomendado para equipos)
1. Push de la feature branch
2. Crear Pull Request en GitHub
3. Review del código
4. Merge del PR
5. Vercel despliega automáticamente

## 🚨 Manejo de Errores

### Si el Preview Deployment Falla
```bash
# Ver logs del deployment
vercel logs [preview-deployment-url]

# Revisar errores comunes
npm run build  # ¿Build local funciona?
npm run type-check  # ¿Errores de TypeScript?
npm run lint:check  # ¿Errores de linting?

# Corregir y push nuevamente
git add .
git commit -m "fix: resolve deployment issues"
git push origin feature/branch-name
```

### Si Producción se Rompe
```bash
# Rollback inmediato
vercel rollback

# O desde dashboard de Vercel:
# 1. Ir a Deployments
# 2. Encontrar último deployment estable
# 3. "Promote to Production"

# Investigar el problema en branch separada
git checkout -b hotfix/investigate-production-issue
```

## 📊 Monitoreo de Branches

### Comandos Útiles
```bash
# Ver todas las branches
git branch -a

# Ver branches remotas
git branch -r

# Ver último commit de cada branch
git branch -v

# Limpiar branches ya mergeadas
git branch --merged main | grep -v main | xargs git branch -d
```

### Vercel CLI para Branches
```bash
# Ver todos los deployments
vercel ls

# Ver deployments de una branch específica
vercel ls --scope feature/dashboard-charts

# Ver logs de preview deployment
vercel logs [preview-url]
```

## 🎯 Convenciones de Naming

### Branches
```bash
feature/add-exercise-tracking     # Nueva funcionalidad
improvement/optimize-dashboard    # Mejora de funcionalidad existente
fix/resolve-login-bug            # Bug fix
hotfix/critical-security-patch   # Fix crítico para producción
experiment/test-new-ui           # Experimento/prueba
refactor/cleanup-auth-code       # Refactoring de código
```

### Commits
```bash
feat: add new exercise tracking functionality
fix: resolve authentication timeout issue
style: improve mobile responsive design
perf: optimize database queries for records page
docs: update deployment documentation
test: add unit tests for workout calculations
refactor: simplify authentication flow
```

## 🔧 Configuración de IDE

### VS Code Settings (Recomendado)
```json
{
  "git.autofetch": true,
  "git.confirmSync": false,
  "git.enableSmartCommit": true,
  "git.postCommitCommand": "push"
}
```

### Git Hooks (Opcional)
```bash
# Pre-commit hook para ejecutar tests
echo '#!/bin/sh\nnpm run test:ci:deploy' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

**Recuerda**: Este flujo está diseñado para maximizar la seguridad y minimizar el riesgo de romper producción. ¡Siempre prueba en preview deployments antes de hacer merge a main!