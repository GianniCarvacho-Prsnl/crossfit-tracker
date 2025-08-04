#!/usr/bin/env node

/**
 * Vercel Performance Configuration Generator
 * 
 * This script generates optimized configuration recommendations
 * for Vercel deployment based on the CrossFit Tracker app requirements.
 */

const fs = require('fs');
const path = require('path');

const VERCEL_CONFIG_PATH = path.join(process.cwd(), 'vercel.json');

function generatePerformanceConfig() {
  console.log('🚀 Generating Vercel performance configuration...');

  const performanceConfig = {
    // Edge Functions configuration for better performance
    edge: {
      // Enable edge runtime for API routes that don't need Node.js
      functions: [
        'app/api/health/route.ts'
      ]
    },

    // Optimized caching strategies
    caching: {
      // Static assets - 1 year cache with immutable
      static: {
        maxAge: 31536000,
        immutable: true
      },
      
      // API responses - short cache for dynamic content
      api: {
        maxAge: 300, // 5 minutes
        staleWhileRevalidate: 86400 // 24 hours
      },
      
      // PWA assets
      pwa: {
        serviceWorker: {
          maxAge: 0,
          mustRevalidate: true
        },
        manifest: {
          maxAge: 86400 // 24 hours
        }
      }
    },

    // Function optimization
    functions: {
      // Health check - minimal resources
      health: {
        maxDuration: 5,
        memory: 512,
        runtime: 'edge'
      },
      
      // Auth confirmation - needs more time for Supabase
      auth: {
        maxDuration: 15,
        memory: 512
      },
      
      // General API routes
      api: {
        maxDuration: 10,
        memory: 1024
      },
      
      // Page rendering
      pages: {
        maxDuration: 10,
        memory: 1024
      }
    },

    // Security optimizations
    security: {
      headers: {
        // Enhanced CSP for better security
        contentSecurityPolicy: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com https://vercel.live",
          "frame-ancestors 'none'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; '),
        
        // Additional security headers
        additionalHeaders: [
          'Cross-Origin-Embedder-Policy: credentialless',
          'Cross-Origin-Opener-Policy: same-origin',
          'Cross-Origin-Resource-Policy: same-origin'
        ]
      }
    },

    // Performance monitoring
    monitoring: {
      // Web Vitals tracking
      webVitals: true,
      
      // Function performance tracking
      functions: true,
      
      // Edge network performance
      edge: true
    }
  };

  return performanceConfig;
}

function validateCurrentConfig() {
  console.log('🔍 Validating current Vercel configuration...');
  
  if (!fs.existsSync(VERCEL_CONFIG_PATH)) {
    console.error('❌ vercel.json not found');
    return false;
  }

  try {
    const config = JSON.parse(fs.readFileSync(VERCEL_CONFIG_PATH, 'utf8'));
    
    // Check for performance optimizations
    const checks = [
      {
        name: 'Static asset caching',
        check: () => config.headers?.some(h => h.source.includes('_next/static')),
        recommendation: 'Configure long-term caching for static assets'
      },
      {
        name: 'Security headers',
        check: () => {
          const globalHeaders = config.headers?.find(h => h.source === '/(.*)')?.headers || [];
          return globalHeaders.some(h => h.key === 'Content-Security-Policy');
        },
        recommendation: 'Add comprehensive security headers'
      },
      {
        name: 'Function timeouts',
        check: () => Object.keys(config.functions || {}).length > 0,
        recommendation: 'Configure appropriate function timeouts'
      },
      {
        name: 'PWA optimization',
        check: () => config.headers?.some(h => h.source === '/sw.js'),
        recommendation: 'Optimize service worker caching'
      }
    ];

    let passed = 0;
    checks.forEach(check => {
      if (check.check()) {
        console.log(`✅ ${check.name}`);
        passed++;
      } else {
        console.log(`❌ ${check.name} - ${check.recommendation}`);
      }
    });

    console.log(`\n📊 Performance checks: ${passed}/${checks.length} passed`);
    return passed === checks.length;

  } catch (error) {
    console.error('❌ Error validating config:', error.message);
    return false;
  }
}

function printOptimizationTips() {
  console.log('\n💡 Vercel Performance Optimization Tips:');
  console.log('');
  console.log('🎯 Caching Strategy:');
  console.log('  • Static assets: 1 year cache with immutable flag');
  console.log('  • API responses: 5 minutes with stale-while-revalidate');
  console.log('  • Service Worker: No cache, always fresh');
  console.log('');
  console.log('⚡ Function Optimization:');
  console.log('  • Health checks: 5s timeout, 512MB memory');
  console.log('  • Auth operations: 15s timeout for Supabase calls');
  console.log('  • General APIs: 10s timeout, 1GB memory');
  console.log('');
  console.log('🔒 Security Headers:');
  console.log('  • CSP configured for Supabase and Vercel services');
  console.log('  • CORS restricted to production domain');
  console.log('  • Additional security headers for cross-origin protection');
  console.log('');
  console.log('📱 PWA Optimization:');
  console.log('  • Service Worker properly cached');
  console.log('  • Manifest cached for 24 hours');
  console.log('  • Workbox assets cached immutably');
}

if (require.main === module) {
  const config = generatePerformanceConfig();
  const isValid = validateCurrentConfig();
  
  if (isValid) {
    console.log('\n✅ Current Vercel configuration is optimized for performance');
  } else {
    console.log('\n⚠️  Vercel configuration could be improved');
  }
  
  printOptimizationTips();
}

module.exports = { generatePerformanceConfig, validateCurrentConfig };