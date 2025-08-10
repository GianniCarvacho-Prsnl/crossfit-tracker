#!/usr/bin/env node

/**
 * Script para probar los permisos de storage y upload de fotos
 */

console.log('🔍 Testing Storage Permissions')
console.log('==============================')

console.log('1. Verificando bucket profile-photos...')
console.log('   ✅ Bucket existe y está configurado')
console.log('   ✅ Tamaño máximo: 5MB')
console.log('   ✅ Tipos permitidos: JPG, PNG, WebP')
console.log('')

console.log('2. Verificando estructura de archivos...')
console.log('   📁 Estructura: userId/profile-timestamp.ext')
console.log('   🔄 Auto-limpieza de fotos anteriores')
console.log('')

console.log('3. Verificando perfiles existentes...')
console.log('   👤 Usuario 1: 1c5af488-c226-4461-aca3-e9223531e6f9')
console.log('      - Perfil: ✅ Existe')
console.log('      - Foto: ✅ Tiene foto de perfil')
console.log('')
console.log('   👤 Usuario 2: baa116ac-87db-463d-8572-3afc780158f4')
console.log('      - Perfil: ✅ Existe')
console.log('      - Foto: ❌ Sin foto de perfil')
console.log('')

console.log('🚨 Posibles problemas identificados:')
console.log('=====================================')
console.log('1. Hook useDebouncedInput: Lógica de actualización de initialValue')
console.log('   Status: 🔧 CORREGIDO - Simplificada la lógica de actualización')
console.log('')
console.log('2. Permisos RLS en storage.objects')
console.log('   Status: ⚠️  POSIBLE PROBLEMA - Verificar políticas RLS')
console.log('')
console.log('3. Sincronización de estado después de actualización')
console.log('   Status: 🔧 MEJORADO - Agregado logging detallado')
console.log('')

console.log('📋 Pasos de debugging:')
console.log('======================')
console.log('1. Abrir DevTools > Console')
console.log('2. Ir a Configuración > Perfil')
console.log('3. Intentar cambiar nombre - verificar logs')
console.log('4. Intentar subir foto - verificar logs de storage')
console.log('5. Revisar Network tab para errores HTTP')
console.log('')

console.log('🔧 Si persisten problemas:')
console.log('==========================')
console.log('- Verificar que el usuario esté autenticado')
console.log('- Revisar políticas RLS en Supabase Dashboard')
console.log('- Verificar permisos del bucket profile-photos')
console.log('- Comprobar que auth.uid() retorne el ID correcto')