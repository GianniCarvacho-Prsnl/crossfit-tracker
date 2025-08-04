#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Performance audit script for Vercel deployment optimization
 * Validates configuration against performance requirements
 */
function performanceAudit() {
  console.log('🚀 Running Performance Audit for Vercel Configuration...\n');

  const checks = [];

  // Check Next.js configuration
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Check PWA configuration
    if (nextConfig.includes('next-pwa')) {
      checks.push({ name: 'PWA Configuration', status: '✅', details: 'Service worker and caching configured' });
    } else {
      checks.push({ name: 'PWA Configuration', status: '❌', details: 'PWA not configured' });
    }

    // Check bundle analyzer
    if (nextConfig.includes('@next/bundle-analyzer')) {
      checks.push({ name: 'Bundle Analysis', status: '✅', details: 'Bundle analyzer configured' });
    } else {
      checks.push({ name: 'Bundle Analysis', status: '⚠️', details: 'Bundle analyzer not found' });
    }

    // Check image optimization
    if (nextConfig.includes('images:')) {
      checks.push({ name: 'Image Optimization', status: '✅', details: 'Next.js image optimization configured' });
    } else {
      checks.push({ name: 'Image Optimization', status: '⚠️', details: 'Image optimization not explicitly configured' });
    }

    // Check compiler optimizations
    if (nextConfig.includes('removeConsole')) {
      checks.push({ name: 'Production Optimizations', status: '✅', details: 'Console removal in production enabled' });
    } else {
      checks.push({ name: 'Production Optimizations', status: '⚠️', details: 'Production optimizations not found' });
    }
  }

  // Check Vercel configuration
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  if (fs.existsSync(vercelConfigPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    
    // Check function timeouts
    const functions = vercelConfig.functions || {};
    const hasOptimizedTimeouts = Object.values(functions).some(fn => fn.maxDuration <= 10);
    
    if (hasOptimizedTimeouts) {
      checks.push({ name: 'Function Timeouts', status: '✅', details: 'Optimized function timeouts configured' });
    } else {
      checks.push({ name: 'Function Timeouts', status: '⚠️', details: 'Function timeouts not optimized' });
    }

    // Check caching headers
    const headers = vercelConfig.headers || [];
    const hasCaching = headers.some(h => 
      h.headers && h.headers.some(header => header.key === 'Cache-Control')
    );
    
    if (hasCaching) {
      checks.push({ name: 'Caching Strategy', status: '✅', details: 'Cache headers configured for performance' });
    } else {
      checks.push({ name: 'Caching Strategy', status: '❌', details: 'No caching headers found' });
    }

    // Check regions
    if (vercelConfig.regions && vercelConfig.regions.length > 0) {
      checks.push({ name: 'Edge Optimization', status: '✅', details: `Deployed to ${vercelConfig.regions.join(', ')}` });
    } else {
      checks.push({ name: 'Edge Optimization', status: '⚠️', details: 'No specific regions configured' });
    }
  }

  // Check package.json scripts
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    if (scripts['build:analyze']) {
      checks.push({ name: 'Bundle Analysis Script', status: '✅', details: 'Bundle analysis script available' });
    } else {
      checks.push({ name: 'Bundle Analysis Script', status: '⚠️', details: 'No bundle analysis script found' });
    }

    if (scripts['performance:audit']) {
      checks.push({ name: 'Performance Audit Script', status: '✅', details: 'Performance audit script available' });
    } else {
      checks.push({ name: 'Performance Audit Script', status: '⚠️', details: 'No performance audit script found' });
    }
  }

  // Performance targets validation
  console.log('🎯 Performance Targets Validation:\n');
  
  const performanceTargets = [
    { metric: 'First Contentful Paint', target: '< 1.5s', status: '📋', note: 'Verify with Lighthouse after deployment' },
    { metric: 'Largest Contentful Paint', target: '< 2.5s', status: '📋', note: 'Verify with Lighthouse after deployment' },
    { metric: 'Cumulative Layout Shift', target: '< 0.1', status: '📋', note: 'Verify with Lighthouse after deployment' },
    { metric: 'Time to Interactive', target: '< 3s', status: '📋', note: 'Verify with Lighthouse after deployment' }
  ];

  performanceTargets.forEach(target => {
    console.log(`${target.status} ${target.metric}: ${target.target}`);
    console.log(`   ${target.note}\n`);
  });

  // Print configuration results
  console.log('⚙️  Configuration Validation Results:\n');
  checks.forEach(check => {
    console.log(`${check.status} ${check.name}`);
    if (check.details) {
      console.log(`   ${check.details}\n`);
    }
  });

  const failed = checks.filter(c => c.status === '❌').length;
  const warnings = checks.filter(c => c.status === '⚠️').length;
  const passed = checks.filter(c => c.status === '✅').length;

  console.log(`📊 Configuration Summary: ${passed} passed, ${warnings} warnings, ${failed} failed\n`);

  // Recommendations
  console.log('💡 Performance Recommendations:\n');
  console.log('1. Run `npm run build:analyze` to check bundle sizes');
  console.log('2. Use Lighthouse CI for automated performance testing');
  console.log('3. Monitor Core Web Vitals with Vercel Analytics');
  console.log('4. Test on real devices for mobile performance');
  console.log('5. Verify PWA functionality works offline\n');

  if (failed > 0) {
    console.log('❌ Performance audit found critical issues. Please fix before deployment.');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  Performance audit passed with recommendations.');
  } else {
    console.log('✅ Performance audit passed! Configuration is optimized for deployment.');
  }
}

if (require.main === module) {
  performanceAudit();
}

module.exports = { performanceAudit };