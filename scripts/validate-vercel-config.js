#!/usr/bin/env node

/**
 * Validate Vercel Configuration
 * 
 * This script validates the vercel.json configuration file to ensure
 * it meets performance and security requirements.
 */

const fs = require('fs');
const path = require('path');

const VERCEL_CONFIG_PATH = path.join(process.cwd(), 'vercel.json');

function validateVercelConfig() {
  console.log('🔍 Validating Vercel configuration...');

  // Check if vercel.json exists
  if (!fs.existsSync(VERCEL_CONFIG_PATH)) {
    console.error('❌ vercel.json not found');
    process.exit(1);
  }

  let config;
  try {
    const configContent = fs.readFileSync(VERCEL_CONFIG_PATH, 'utf8');
    config = JSON.parse(configContent);
  } catch (error) {
    console.error('❌ Invalid JSON in vercel.json:', error.message);
    process.exit(1);
  }

  const validationResults = [];

  // Validate basic structure
  if (!config.version || config.version !== 2) {
    validationResults.push('❌ Missing or invalid version (should be 2)');
  } else {
    validationResults.push('✅ Version is correct');
  }

  // Validate framework
  if (config.framework !== 'nextjs') {
    validationResults.push('❌ Framework should be "nextjs"');
  } else {
    validationResults.push('✅ Framework is correctly set to Next.js');
  }

  // Validate build configuration
  if (config.buildCommand !== 'npm run build') {
    validationResults.push('❌ Build command should be "npm run build"');
  } else {
    validationResults.push('✅ Build command is correct');
  }

  if (config.outputDirectory !== '.next') {
    validationResults.push('❌ Output directory should be ".next"');
  } else {
    validationResults.push('✅ Output directory is correct');
  }

  // Validate security headers
  const headers = config.headers || [];
  const globalHeaders = headers.find(h => h.source === '/(.*)')?.headers || [];
  
  const requiredSecurityHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
    'Content-Security-Policy',
    'Strict-Transport-Security'
  ];

  const presentHeaders = globalHeaders.map(h => h.key);
  const missingHeaders = requiredSecurityHeaders.filter(h => !presentHeaders.includes(h));

  if (missingHeaders.length > 0) {
    validationResults.push(`❌ Missing security headers: ${missingHeaders.join(', ')}`);
  } else {
    validationResults.push('✅ All required security headers are present');
  }

  // Validate function timeouts
  const functions = config.functions || {};
  let functionTimeoutIssues = 0;

  Object.entries(functions).forEach(([pattern, settings]) => {
    if (!settings.maxDuration) {
      validationResults.push(`❌ Missing maxDuration for ${pattern}`);
      functionTimeoutIssues++;
    } else if (settings.maxDuration > 30) {
      validationResults.push(`⚠️  High timeout (${settings.maxDuration}s) for ${pattern}`);
    }

    if (!settings.memory) {
      validationResults.push(`❌ Missing memory setting for ${pattern}`);
      functionTimeoutIssues++;
    }
  });

  if (functionTimeoutIssues === 0) {
    validationResults.push('✅ Function configurations are properly set');
  }

  // Validate caching headers
  const staticHeaders = headers.filter(h => 
    h.source.includes('_next/static') || 
    h.source.includes('\\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico|webp|avif)$')
  );

  if (staticHeaders.length > 0) {
    validationResults.push('✅ Static asset caching is configured');
  } else {
    validationResults.push('❌ Missing static asset caching configuration');
  }

  // Validate PWA configuration
  const swHeaders = headers.find(h => h.source === '/sw.js');
  if (swHeaders) {
    validationResults.push('✅ Service Worker caching is configured');
  } else {
    validationResults.push('⚠️  Service Worker caching not found');
  }

  // Validate environment variables
  if (config.env) {
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    const presentEnvVars = Object.keys(config.env);
    const missingEnvVars = requiredEnvVars.filter(v => !presentEnvVars.includes(v));

    if (missingEnvVars.length > 0) {
      validationResults.push(`❌ Missing environment variables: ${missingEnvVars.join(', ')}`);
    } else {
      validationResults.push('✅ Required environment variables are configured');
    }
  }

  // Print results
  console.log('\n📋 Validation Results:');
  validationResults.forEach(result => console.log(`  ${result}`));

  // Check for errors
  const errors = validationResults.filter(r => r.startsWith('❌'));
  const warnings = validationResults.filter(r => r.startsWith('⚠️'));

  console.log(`\n📊 Summary: ${validationResults.length - errors.length - warnings.length} passed, ${warnings.length} warnings, ${errors.length} errors`);

  if (errors.length > 0) {
    console.log('\n❌ Vercel configuration validation failed');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('\n⚠️  Vercel configuration has warnings but is valid');
    process.exit(0);
  } else {
    console.log('\n✅ Vercel configuration is valid and optimized');
    process.exit(0);
  }
}

// Performance recommendations
function printPerformanceRecommendations() {
  console.log('\n🚀 Performance Recommendations:');
  console.log('  • Static assets are cached for 1 year with immutable flag');
  console.log('  • Service Worker is configured for offline functionality');
  console.log('  • Security headers are properly configured');
  console.log('  • Function timeouts are optimized for each endpoint');
  console.log('  • CORS is configured for API security');
  console.log('  • Bundle splitting is enabled in next.config.js');
}

if (require.main === module) {
  validateVercelConfig();
  printPerformanceRecommendations();
}

module.exports = { validateVercelConfig };