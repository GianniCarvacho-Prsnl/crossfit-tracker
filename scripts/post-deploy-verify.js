#!/usr/bin/env node

/**
 * Post-deployment verification CLI wrapper
 * Provides a simple interface for running production verification
 */

const ProductionVerifier = require('./verify-production');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  url: null,
  verbose: false,
  quick: false,
  help: false
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  switch (arg) {
    case '--url':
    case '-u':
      options.url = args[i + 1];
      i++; // Skip next argument as it's the URL value
      break;
    case '--verbose':
    case '-v':
      options.verbose = true;
      break;
    case '--quick':
    case '-q':
      options.quick = true;
      break;
    case '--help':
    case '-h':
      options.help = true;
      break;
    default:
      if (arg.startsWith('http')) {
        options.url = arg;
      }
      break;
  }
}

// Show help
if (options.help) {
  console.log(`
CrossFit Tracker - Post-Deployment Verification Tool

Usage: npm run verify:production [options]

Options:
  --url, -u <url>     Specify the URL to verify (default: from env or vercel app)
  --verbose, -v       Show detailed output for all tests
  --quick, -q         Run only essential tests (faster verification)
  --help, -h          Show this help message

Examples:
  npm run verify:production
  npm run verify:production --url https://my-app.vercel.app
  npm run verify:production --quick
  npm run verify:production --verbose

Environment Variables:
  VERCEL_URL          Automatically set by Vercel during deployment
  PRODUCTION_URL      Custom production URL override
`);
  process.exit(0);
}

// Set URL if provided
if (options.url) {
  process.env.PRODUCTION_URL = options.url;
}

// Create and configure verifier
class CLIVerifier extends ProductionVerifier {
  constructor(options) {
    super();
    this.options = options;
  }

  async runAllTests() {
    if (this.options.quick) {
      console.log('🚀 Starting quick post-deployment verification...');
      console.log(`📍 Target URL: ${this.getBaseUrl()}\n`);

      try {
        // Quick tests only
        await this.verifyHealthCheck();
        await this.verifyPageLoading();
        await this.verifyBasicPerformance();
        
        this.printSummary();
        process.exit(this.results.failed > 0 ? 1 : 0);
        
      } catch (error) {
        console.error('❌ Quick verification failed:', error.message);
        process.exit(1);
      }
    } else {
      // Run full verification
      await super.runAllTests();
    }
  }

  async verifyBasicPerformance() {
    console.log('🔍 Testing basic performance...');
    
    try {
      const startTime = performance.now();
      const response = await this.makeRequest('/');
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (loadTime < 5000) { // 5 second threshold for quick test
        this.logSuccess('Basic performance check passed', {
          loadTime: `${loadTime.toFixed(2)}ms`
        });
      } else {
        this.logFailure('Basic performance check failed', {
          loadTime: `${loadTime.toFixed(2)}ms`,
          threshold: '5000ms'
        });
      }
    } catch (error) {
      this.logFailure('Basic performance check failed', error.message);
    }
  }

  getBaseUrl() {
    return process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.PRODUCTION_URL || 'https://crossfit-tracker.vercel.app';
  }

  logSuccess(message, details = {}) {
    super.logSuccess(message, details);
    
    if (this.options.verbose && Object.keys(details).length > 0) {
      console.log(`   📊 Details: ${JSON.stringify(details, null, 2).replace(/\n/g, '\n   ')}`);
    }
  }

  logFailure(message, details = {}) {
    super.logFailure(message, details);
    
    if (this.options.verbose && Object.keys(details).length > 0) {
      console.log(`   🔍 Debug info: ${JSON.stringify(details, null, 2).replace(/\n/g, '\n   ')}`);
    }
  }
}

// Run CLI verifier
const verifier = new CLIVerifier(options);
verifier.runAllTests().catch(error => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});