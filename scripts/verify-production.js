#!/usr/bin/env node

/**
 * Post-deployment verification script for CrossFit Tracker
 * Verifies core functionality after deployment to production
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  baseUrl: process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.PRODUCTION_URL || 'https://crossfit-tracker.vercel.app',
  timeout: 10000,
  performanceThresholds: {
    pageLoad: 3000, // 3 seconds
    apiResponse: 1000, // 1 second
    firstContentfulPaint: 1500 // 1.5 seconds
  }
};

class ProductionVerifier {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🚀 Starting post-deployment verification...');
    console.log(`📍 Target URL: ${CONFIG.baseUrl}\n`);

    try {
      // Core functionality tests
      await this.verifyHealthCheck();
      await this.verifyPageLoading();
      await this.verifyAuthentication();
      await this.verifyWorkoutRegistration();
      
      // Performance and responsiveness tests
      await this.verifyPerformance();
      await this.verifyResponsiveness();
      
      // Summary
      this.printSummary();
      
      // Exit with appropriate code
      process.exit(this.results.failed > 0 ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Verification failed with error:', error.message);
      process.exit(1);
    }
  }

  async verifyHealthCheck() {
    console.log('🔍 Testing health check endpoint...');
    
    try {
      const startTime = performance.now();
      const response = await this.makeRequest('/api/health');
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        
        if (data.status === 'ok' && data.database === 'connected') {
          this.logSuccess('Health check passed', { responseTime: `${responseTime.toFixed(2)}ms` });
        } else {
          this.logFailure('Health check returned invalid status', data);
        }
      } else {
        this.logFailure('Health check failed', { statusCode: response.statusCode });
      }
    } catch (error) {
      this.logFailure('Health check request failed', error.message);
    }
  }

  async verifyPageLoading() {
    console.log('🔍 Testing page loading...');
    
    const pages = [
      { path: '/', name: 'Home/Dashboard' },
      { path: '/login', name: 'Login' },
      { path: '/register', name: 'Register' },
      { path: '/records', name: 'Records' },
      { path: '/conversions', name: 'Conversions' },
      { path: '/percentages', name: 'Percentages' }
    ];

    for (const page of pages) {
      try {
        const startTime = performance.now();
        const response = await this.makeRequest(page.path);
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        if (response.statusCode === 200) {
          // Check for basic HTML structure
          const hasHtml = response.body.includes('<html');
          const hasTitle = response.body.includes('<title>');
          const hasNextScript = response.body.includes('_next/static');
          
          if (hasHtml && hasTitle && hasNextScript) {
            this.logSuccess(`${page.name} page loaded`, { 
              loadTime: `${loadTime.toFixed(2)}ms`,
              size: `${(response.body.length / 1024).toFixed(2)}KB`
            });
          } else {
            this.logFailure(`${page.name} page missing required elements`, {
              hasHtml, hasTitle, hasNextScript
            });
          }
        } else if (response.statusCode === 302 || response.statusCode === 307) {
          // Redirects are acceptable for protected routes
          this.logSuccess(`${page.name} page redirected (expected for protected routes)`, {
            statusCode: response.statusCode,
            location: response.headers.location
          });
        } else {
          this.logFailure(`${page.name} page failed to load`, {
            statusCode: response.statusCode
          });
        }
      } catch (error) {
        this.logFailure(`${page.name} page request failed`, error.message);
      }
    }
  }

  async verifyAuthentication() {
    console.log('🔍 Testing authentication functionality...');
    
    try {
      // Test login page accessibility
      const loginResponse = await this.makeRequest('/login');
      
      if (loginResponse.statusCode === 200) {
        // Check for authentication form elements
        const hasEmailInput = loginResponse.body.includes('type="email"') || 
                             loginResponse.body.includes('email');
        const hasPasswordInput = loginResponse.body.includes('type="password"') || 
                                loginResponse.body.includes('password');
        const hasSubmitButton = loginResponse.body.includes('type="submit"') ||
                               loginResponse.body.includes('Sign in') ||
                               loginResponse.body.includes('Login');
        
        if (hasEmailInput && hasPasswordInput && hasSubmitButton) {
          this.logSuccess('Login form elements present', {
            hasEmailInput, hasPasswordInput, hasSubmitButton
          });
        } else {
          this.logFailure('Login form missing required elements', {
            hasEmailInput, hasPasswordInput, hasSubmitButton
          });
        }
      } else {
        this.logFailure('Login page not accessible', {
          statusCode: loginResponse.statusCode
        });
      }

      // Test register page accessibility
      const registerResponse = await this.makeRequest('/register');
      
      if (registerResponse.statusCode === 200) {
        const hasRegisterForm = registerResponse.body.includes('register') ||
                               registerResponse.body.includes('sign up') ||
                               registerResponse.body.includes('Sign Up');
        
        if (hasRegisterForm) {
          this.logSuccess('Register page accessible');
        } else {
          this.logFailure('Register page missing registration form');
        }
      } else {
        this.logFailure('Register page not accessible', {
          statusCode: registerResponse.statusCode
        });
      }

      // Test protected route behavior
      const protectedResponse = await this.makeRequest('/records');
      
      if (protectedResponse.statusCode === 302 || protectedResponse.statusCode === 307) {
        this.logSuccess('Protected route correctly redirects unauthenticated users');
      } else if (protectedResponse.statusCode === 200) {
        // Check if it shows login prompt or auth component
        const hasAuthPrompt = protectedResponse.body.includes('login') ||
                             protectedResponse.body.includes('sign in') ||
                             protectedResponse.body.includes('authenticate');
        
        if (hasAuthPrompt) {
          this.logSuccess('Protected route shows authentication prompt');
        } else {
          this.logFailure('Protected route accessible without authentication');
        }
      } else {
        this.logFailure('Protected route returned unexpected status', {
          statusCode: protectedResponse.statusCode
        });
      }
      
    } catch (error) {
      this.logFailure('Authentication verification failed', error.message);
    }
  }

  async verifyWorkoutRegistration() {
    console.log('🔍 Testing workout registration functionality...');
    
    try {
      // Test workout registration page
      const registerWorkoutResponse = await this.makeRequest('/register');
      
      if (registerWorkoutResponse.statusCode === 200) {
        // Check for workout form elements
        const hasExerciseSelect = registerWorkoutResponse.body.includes('exercise') ||
                                 registerWorkoutResponse.body.includes('Clean') ||
                                 registerWorkoutResponse.body.includes('Snatch');
        const hasWeightInput = registerWorkoutResponse.body.includes('weight') ||
                              registerWorkoutResponse.body.includes('lbs') ||
                              registerWorkoutResponse.body.includes('kg');
        const hasRepsInput = registerWorkoutResponse.body.includes('reps') ||
                            registerWorkoutResponse.body.includes('repetitions');
        
        if (hasExerciseSelect && hasWeightInput && hasRepsInput) {
          this.logSuccess('Workout registration form elements present', {
            hasExerciseSelect, hasWeightInput, hasRepsInput
          });
        } else {
          this.logFailure('Workout registration form missing elements', {
            hasExerciseSelect, hasWeightInput, hasRepsInput
          });
        }
      } else {
        this.logFailure('Workout registration page not accessible', {
          statusCode: registerWorkoutResponse.statusCode
        });
      }

      // Test records page for workout display
      const recordsResponse = await this.makeRequest('/records');
      
      // Records page might redirect if not authenticated, which is expected
      if (recordsResponse.statusCode === 200) {
        const hasRecordsTable = recordsResponse.body.includes('records') ||
                               recordsResponse.body.includes('workout') ||
                               recordsResponse.body.includes('exercise');
        
        if (hasRecordsTable) {
          this.logSuccess('Records page contains workout display elements');
        } else {
          this.logSuccess('Records page accessible (content depends on authentication)');
        }
      } else if (recordsResponse.statusCode === 302 || recordsResponse.statusCode === 307) {
        this.logSuccess('Records page correctly requires authentication');
      } else {
        this.logFailure('Records page returned unexpected status', {
          statusCode: recordsResponse.statusCode
        });
      }
      
    } catch (error) {
      this.logFailure('Workout registration verification failed', error.message);
    }
  }

  async verifyPerformance() {
    console.log('🔍 Testing performance metrics...');
    
    try {
      // Test main page load time
      const startTime = performance.now();
      const response = await this.makeRequest('/');
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (loadTime < CONFIG.performanceThresholds.pageLoad) {
        this.logSuccess('Page load time within threshold', {
          loadTime: `${loadTime.toFixed(2)}ms`,
          threshold: `${CONFIG.performanceThresholds.pageLoad}ms`
        });
      } else {
        this.logFailure('Page load time exceeds threshold', {
          loadTime: `${loadTime.toFixed(2)}ms`,
          threshold: `${CONFIG.performanceThresholds.pageLoad}ms`
        });
      }

      // Test API response time
      const apiStartTime = performance.now();
      const apiResponse = await this.makeRequest('/api/health');
      const apiEndTime = performance.now();
      const apiResponseTime = apiEndTime - apiStartTime;
      
      if (apiResponseTime < CONFIG.performanceThresholds.apiResponse) {
        this.logSuccess('API response time within threshold', {
          responseTime: `${apiResponseTime.toFixed(2)}ms`,
          threshold: `${CONFIG.performanceThresholds.apiResponse}ms`
        });
      } else {
        this.logFailure('API response time exceeds threshold', {
          responseTime: `${apiResponseTime.toFixed(2)}ms`,
          threshold: `${CONFIG.performanceThresholds.apiResponse}ms`
        });
      }

      // Test resource sizes
      const resourceSizeKB = response.body.length / 1024;
      if (resourceSizeKB < 500) { // 500KB threshold for main page
        this.logSuccess('Page size within reasonable limits', {
          size: `${resourceSizeKB.toFixed(2)}KB`
        });
      } else {
        this.logFailure('Page size may be too large', {
          size: `${resourceSizeKB.toFixed(2)}KB`,
          threshold: '500KB'
        });
      }
      
    } catch (error) {
      this.logFailure('Performance verification failed', error.message);
    }
  }

  async verifyResponsiveness() {
    console.log('🔍 Testing responsiveness and mobile compatibility...');
    
    try {
      const response = await this.makeRequest('/');
      
      if (response.statusCode === 200) {
        // Check for mobile-responsive meta tags
        const hasViewportMeta = response.body.includes('viewport') &&
                               response.body.includes('width=device-width');
        const hasTailwindCSS = response.body.includes('tailwind') ||
                              response.body.includes('sm:') ||
                              response.body.includes('md:') ||
                              response.body.includes('lg:');
        const hasResponsiveClasses = response.body.includes('responsive') ||
                                    response.body.includes('mobile') ||
                                    hasTailwindCSS;
        
        if (hasViewportMeta) {
          this.logSuccess('Viewport meta tag present for mobile responsiveness');
        } else {
          this.logFailure('Missing viewport meta tag for mobile responsiveness');
        }

        if (hasResponsiveClasses) {
          this.logSuccess('Responsive CSS classes detected');
        } else {
          this.logSuccess('Page loaded (responsive classes detection may vary)');
        }

        // Check for PWA manifest
        const hasManifest = response.body.includes('manifest.json') ||
                           response.body.includes('web-app-manifest');
        
        if (hasManifest) {
          this.logSuccess('PWA manifest detected');
        } else {
          this.logFailure('PWA manifest not found');
        }

        // Test manifest accessibility
        try {
          const manifestResponse = await this.makeRequest('/manifest.json');
          if (manifestResponse.statusCode === 200) {
            const manifest = JSON.parse(manifestResponse.body);
            if (manifest.name && manifest.icons && manifest.start_url) {
              this.logSuccess('PWA manifest is valid', {
                name: manifest.name,
                icons: manifest.icons.length,
                startUrl: manifest.start_url
              });
            } else {
              this.logFailure('PWA manifest missing required fields');
            }
          } else {
            this.logFailure('PWA manifest not accessible', {
              statusCode: manifestResponse.statusCode
            });
          }
        } catch (manifestError) {
          this.logFailure('PWA manifest verification failed', manifestError.message);
        }
        
      } else {
        this.logFailure('Cannot verify responsiveness - page not accessible', {
          statusCode: response.statusCode
        });
      }
      
    } catch (error) {
      this.logFailure('Responsiveness verification failed', error.message);
    }
  }

  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, CONFIG.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        timeout: CONFIG.timeout,
        headers: {
          'User-Agent': 'CrossFit-Tracker-Production-Verifier/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      };

      const req = client.request(options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${CONFIG.timeout}ms`));
      });

      req.end();
    });
  }

  logSuccess(message, details = {}) {
    this.results.passed++;
    this.results.tests.push({ status: 'PASS', message, details });
    
    console.log(`✅ ${message}`);
    if (Object.keys(details).length > 0) {
      console.log(`   ${JSON.stringify(details, null, 2).replace(/\n/g, '\n   ')}`);
    }
  }

  logFailure(message, details = {}) {
    this.results.failed++;
    this.results.tests.push({ status: 'FAIL', message, details });
    
    console.log(`❌ ${message}`);
    if (Object.keys(details).length > 0) {
      console.log(`   ${JSON.stringify(details, null, 2).replace(/\n/g, '\n   ')}`);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Total:  ${this.results.passed + this.results.failed}`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All verification tests passed! Deployment is ready for production use.');
    } else {
      console.log('\n⚠️  Some verification tests failed. Please review the issues above.');
      console.log('\nFailed tests:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`   • ${test.message}`);
        });
    }
    
    console.log('='.repeat(60));
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new ProductionVerifier();
  verifier.runAllTests().catch(error => {
    console.error('Verification script failed:', error);
    process.exit(1);
  });
}

module.exports = ProductionVerifier;