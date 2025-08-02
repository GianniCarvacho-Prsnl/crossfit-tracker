#!/usr/bin/env node

/**
 * Production Verification Script for CrossFit Tracker
 * This script verifies that all critical functionality works in production
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://your-app.vercel.app';
const TIMEOUT = 10000; // 10 seconds

// Test cases
const testCases = [
  {
    name: 'Homepage loads',
    path: '/',
    expectedStatus: 200,
    expectedContent: 'CrossFit Tracker'
  },
  {
    name: 'Login page loads',
    path: '/login',
    expectedStatus: 200,
    expectedContent: 'Iniciar Sesión'
  },
  {
    name: 'Register page loads',
    path: '/register',
    expectedStatus: 200,
    expectedContent: 'Registrar Peso'
  },
  {
    name: 'Records page loads',
    path: '/records',
    expectedStatus: 200,
    expectedContent: 'Mis Registros'
  },
  {
    name: 'Conversions mockup loads',
    path: '/conversions',
    expectedStatus: 200,
    expectedContent: 'Conversiones'
  },
  {
    name: 'Percentages mockup loads',
    path: '/percentages',
    expectedStatus: 200,
    expectedContent: 'Porcentajes'
  },
  {
    name: 'PWA manifest loads',
    path: '/manifest.json',
    expectedStatus: 200,
    expectedContent: 'CrossFit Tracker'
  },
  {
    name: 'Service worker loads',
    path: '/sw.js',
    expectedStatus: 200,
    expectedContent: 'workbox'
  }
];

// Utility function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const request = client.get(url, { timeout: TIMEOUT }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data
        });
      });
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Main verification function
async function verifyProduction() {
  console.log(`🚀 Verifying production deployment at: ${PRODUCTION_URL}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      const url = new URL(testCase.path, PRODUCTION_URL).toString();
      const response = await makeRequest(url);
      
      // Check status code
      if (response.statusCode !== testCase.expectedStatus) {
        console.log(`❌ ${testCase.name}: Expected status ${testCase.expectedStatus}, got ${response.statusCode}`);
        failed++;
        continue;
      }
      
      // Check content if specified
      if (testCase.expectedContent && !response.body.includes(testCase.expectedContent)) {
        console.log(`❌ ${testCase.name}: Expected content "${testCase.expectedContent}" not found`);
        failed++;
        continue;
      }
      
      console.log(`✅ ${testCase.name}: OK`);
      passed++;
      
    } catch (error) {
      console.log(`❌ ${testCase.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n🔍 Additional checks to perform manually:');
    console.log('- Test user authentication flow');
    console.log('- Verify Supabase connection');
    console.log('- Test workout registration');
    console.log('- Test records filtering and sorting');
    console.log('- Verify PWA installation');
    console.log('- Check mobile responsiveness');
    console.log('- Test offline functionality');
    
    process.exit(1);
  } else {
    console.log('\n🎉 All automated checks passed!');
    console.log('\n✅ Manual verification checklist:');
    console.log('- [ ] User can register/login successfully');
    console.log('- [ ] Workout registration works with all exercises');
    console.log('- [ ] 1RM calculations are accurate');
    console.log('- [ ] Records display and filtering work');
    console.log('- [ ] Unit conversions display correctly');
    console.log('- [ ] PWA can be installed on mobile');
    console.log('- [ ] App works offline (cached content)');
    console.log('- [ ] Mobile UI is responsive and touch-friendly');
  }
}

// Run verification
if (require.main === module) {
  verifyProduction().catch(console.error);
}

module.exports = { verifyProduction };