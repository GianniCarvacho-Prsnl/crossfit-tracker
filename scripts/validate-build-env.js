#!/usr/bin/env node

/**
 * Build-time Environment Variables Validation Script
 * This script validates environment variables during the build process
 * and fails the build if critical variables are missing or invalid
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message) {
  log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// Environment variable validation rules
const validationRules = {
  'NEXT_PUBLIC_SUPABASE_URL': {
    required: true,
    description: 'Supabase project URL',
    validate: (value) => {
      if (!value) return { valid: false, message: 'Value is required for build' };
      if (!value.startsWith('https://')) return { valid: false, message: 'Must start with https://' };
      if (!value.includes('.supabase.co')) return { valid: false, message: 'Must be a valid Supabase URL' };
      return { valid: true };
    }
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    required: true,
    description: 'Supabase anonymous key',
    validate: (value) => {
      if (!value) return { valid: false, message: 'Value is required for build' };
      if (value.length < 100) return { valid: false, message: 'Key appears to be too short' };
      if (!value.startsWith('eyJ')) return { valid: false, message: 'Should be a JWT token starting with eyJ' };
      return { valid: true };
    }
  },
  'NODE_ENV': {
    required: false,
    description: 'Node.js environment',
    validate: (value) => {
      if (!value) return { valid: true, message: 'Will default to development' };
      const validEnvs = ['development', 'production', 'test'];
      if (!validEnvs.includes(value)) {
        return { valid: false, message: `Must be one of: ${validEnvs.join(', ')}` };
      }
      return { valid: true };
    }
  }
};

// Load environment variables from various sources
function loadEnvironmentVariables() {
  const env = { ...process.env };
  
  // Try to load from .env.local
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    try {
      const envLocal = fs.readFileSync(envLocalPath, 'utf8');
      envLocal.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const cleanKey = key.trim();
          const cleanValue = valueParts.join('=').trim();
          if (cleanValue && !env[cleanKey]) {
            env[cleanKey] = cleanValue;
          }
        }
      });
    } catch (error) {
      logWarning(`Could not read .env.local: ${error.message}`);
    }
  }
  
  // Try to load from .env.production.local if in production
  if (process.env.NODE_ENV === 'production') {
    const envProdPath = path.join(process.cwd(), '.env.production.local');
    if (fs.existsSync(envProdPath)) {
      try {
        const envProd = fs.readFileSync(envProdPath, 'utf8');
        envProd.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            const cleanKey = key.trim();
            const cleanValue = valueParts.join('=').trim();
            if (cleanValue && !env[cleanKey]) {
              env[cleanKey] = cleanValue;
            }
          }
        });
      } catch (error) {
        logWarning(`Could not read .env.production.local: ${error.message}`);
      }
    }
  }
  
  return env;
}

// Validate build-time environment variables
function validateBuildEnvironment() {
  log(`${colors.bold}${colors.blue}🔧 Build-time Environment Validation${colors.reset}\n`);
  
  const env = loadEnvironmentVariables();
  const buildEnv = process.env.NODE_ENV || 'development';
  
  logInfo(`Build environment: ${buildEnv}`);
  logInfo(`Validating environment variables for build...\n`);
  
  let allValid = true;
  let criticalMissing = 0;
  
  // Validate each environment variable
  for (const [varName, rule] of Object.entries(validationRules)) {
    const value = env[varName];
    const validation = rule.validate(value);
    
    if (rule.required) {
      if (validation.valid) {
        logSuccess(`${varName}: ${validation.message || 'Valid'}`);
      } else {
        logError(`${varName}: ${validation.message}`);
        logError(`  Description: ${rule.description}`);
        allValid = false;
        criticalMissing++;
      }
    } else {
      if (validation.valid) {
        if (value) {
          logSuccess(`${varName}: ${validation.message || 'Valid'}`);
        } else {
          logInfo(`${varName}: ${validation.message || 'Not set (optional)'}`);
        }
      } else {
        logWarning(`${varName}: ${validation.message}`);
        logWarning(`  Description: ${rule.description}`);
      }
    }
  }
  
  // Check for Next.js public variables specifically
  const publicVars = Object.keys(env).filter(key => key.startsWith('NEXT_PUBLIC_'));
  if (publicVars.length > 0) {
    log(`\n${colors.bold}Public Variables (NEXT_PUBLIC_*):${colors.reset}`);
    publicVars.forEach(varName => {
      if (validationRules[varName]) {
        // Already validated above
        return;
      }
      logInfo(`${varName}: Set (will be included in client bundle)`);
    });
  }
  
  // Summary
  log(`\n${colors.bold}Build Environment Summary:${colors.reset}`);
  
  if (allValid) {
    logSuccess('All required environment variables are properly configured for build!');
    logSuccess('Build can proceed safely.');
  } else {
    logError(`${criticalMissing} critical environment variable(s) are missing or invalid`);
    logError('Build cannot proceed with missing required variables.');
    
    log(`\n${colors.bold}Required Actions:${colors.reset}`);
    logError('1. Set all required environment variables');
    logError('2. For local builds: Update .env.local file');
    logError('3. For production builds: Configure variables in deployment platform');
    logError('4. Run validation again: npm run pre-deploy:env');
  }
  
  return allValid;
}

// Generate build environment report
function generateBuildReport(isValid) {
  const reportPath = path.join(process.cwd(), '.next', 'build-env-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development',
    buildValid: isValid,
    requiredVariables: Object.keys(validationRules).filter(key => validationRules[key].required),
    optionalVariables: Object.keys(validationRules).filter(key => !validationRules[key].required),
    publicVariables: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
  };
  
  try {
    // Ensure .next directory exists
    const nextDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(nextDir)) {
      fs.mkdirSync(nextDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logInfo(`Build environment report generated: ${reportPath}`);
  } catch (error) {
    logWarning(`Could not generate build report: ${error.message}`);
  }
}

// Main execution
function main() {
  const isValid = validateBuildEnvironment();
  
  // Generate build report
  generateBuildReport(isValid);
  
  if (!isValid) {
    log(`\n${colors.red}${colors.bold}❌ Build environment validation failed!${colors.reset}`);
    log(`${colors.red}Fix the environment variables above before building.${colors.reset}`);
    process.exit(1);
  } else {
    log(`\n${colors.green}${colors.bold}🎉 Build environment validation passed!${colors.reset}`);
    log(`${colors.green}Build can proceed safely.${colors.reset}`);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { validateBuildEnvironment, main };