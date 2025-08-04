#!/usr/bin/env node

/**
 * Pre-deployment Check Script for CrossFit Tracker
 * This script runs comprehensive checks before deployment to ensure everything is ready
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

// Load environment variables at startup
loadEnvFile();

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`${colors.blue}[${step}]${colors.reset} ${message}`);
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

function runCommand(command, description) {
  try {
    logStep('EXEC', `${description}: ${command}`);
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 120000 // 2 minutes timeout
    });
    logSuccess(`${description} completed successfully`);
    return { success: true, output };
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    if (error.stdout) {
      console.log('STDOUT:', error.stdout);
    }
    if (error.stderr) {
      console.log('STDERR:', error.stderr);
    }
    return { success: false, error: error.message };
  }
}

// Check functions
async function checkEnvironmentVariables() {
  logStep('ENV', 'Checking environment variables...');
  
  // Use the dedicated environment verification script
  const result = runCommand('node scripts/verify-env.js', 'Environment variables validation');
  return result.success;
}

async function testSupabaseConnectivity() {
  logStep('SUPABASE', 'Testing Supabase connectivity...');
  
  // Use the dedicated Supabase connectivity test script
  const result = runCommand('node scripts/test-supabase-connection.js', 'Supabase connectivity test');
  return result.success;
}

async function checkProjectStructure() {
  logStep('STRUCTURE', 'Checking project structure...');
  
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'tailwind.config.ts',
    'app/layout.tsx',
    'app/page.tsx',
    'components',
    'utils',
    'types'
  ];
  
  let allPresent = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      logSuccess(`${file} exists`);
    } else {
      logError(`Required file/directory ${file} is missing`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

async function runTypeCheck() {
  logStep('TYPES', 'Running TypeScript type check...');
  const result = runCommand('npm run type-check', 'TypeScript type checking');
  return result.success;
}

async function runLinting() {
  logStep('LINT', 'Running ESLint...');
  const result = runCommand('npm run lint:check', 'ESLint checking');
  return result.success;
}

async function runTests() {
  logStep('TEST', 'Running unit tests...');
  const result = runCommand('npm run test:ci:deploy', 'Unit tests (deployment subset)');
  return result.success;
}

async function runBuild() {
  logStep('BUILD', 'Running production build...');
  const result = runCommand('npm run build:verify', 'Production build');
  return result.success;
}

async function checkDependencies() {
  logStep('DEPS', 'Checking dependencies...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for critical dependencies
    const criticalDeps = [
      'next',
      'react',
      'react-dom',
      '@supabase/supabase-js',
      '@supabase/ssr'
    ];
    
    let allPresent = true;
    
    for (const dep of criticalDeps) {
      if (packageJson.dependencies[dep]) {
        logSuccess(`${dep} is installed (${packageJson.dependencies[dep]})`);
      } else {
        logError(`Critical dependency ${dep} is missing`);
        allPresent = false;
      }
    }
    
    // Check for security vulnerabilities
    try {
      const auditResult = runCommand('npm audit --audit-level=high', 'Security audit');
      if (auditResult.success) {
        logSuccess('No high-severity security vulnerabilities found');
      }
    } catch (error) {
      logWarning('Could not run security audit - please check manually');
    }
    
    return allPresent;
  } catch (error) {
    logError(`Failed to check dependencies: ${error.message}`);
    return false;
  }
}

async function checkBuildSize() {
  logStep('SIZE', 'Checking build size...');
  
  try {
    const buildDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(buildDir)) {
      logWarning('Build directory not found - run build first');
      return true; // Not critical for pre-deploy check
    }
    
    // Check if build is reasonable size (basic check)
    const stats = fs.statSync(buildDir);
    logSuccess(`Build directory exists and appears valid`);
    
    // Check for critical build files
    const criticalBuildFiles = [
      '.next/BUILD_ID',
      '.next/static',
      '.next/server'
    ];
    
    for (const file of criticalBuildFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        logSuccess(`${file} exists`);
      } else {
        logWarning(`Build file ${file} is missing`);
      }
    }
    
    return true;
  } catch (error) {
    logWarning(`Could not check build size: ${error.message}`);
    return true; // Not critical
  }
}

// Main execution
async function main() {
  log(`${colors.bold}${colors.blue}🚀 CrossFit Tracker Pre-Deployment Check${colors.reset}\n`);
  
  const checks = [
    { name: 'Project Structure', fn: checkProjectStructure, critical: true },
    { name: 'Dependencies', fn: checkDependencies, critical: true },
    { name: 'Environment Variables', fn: checkEnvironmentVariables, critical: true },
    { name: 'Supabase Connectivity', fn: testSupabaseConnectivity, critical: true },
    { name: 'TypeScript Check', fn: runTypeCheck, critical: true },
    { name: 'Linting', fn: runLinting, critical: true },
    { name: 'Unit Tests', fn: runTests, critical: true },
    { name: 'Production Build', fn: runBuild, critical: true },
    { name: 'Build Size Check', fn: checkBuildSize, critical: false }
  ];
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  for (const check of checks) {
    try {
      log(`\n${colors.yellow}Running ${check.name}...${colors.reset}`);
      const result = await check.fn();
      
      if (result) {
        logSuccess(`${check.name} passed`);
        passed++;
      } else {
        if (check.critical) {
          logError(`${check.name} failed (CRITICAL)`);
          failed++;
        } else {
          logWarning(`${check.name} failed (WARNING)`);
          warnings++;
        }
      }
    } catch (error) {
      if (check.critical) {
        logError(`${check.name} failed with error: ${error.message}`);
        failed++;
      } else {
        logWarning(`${check.name} failed with error: ${error.message}`);
        warnings++;
      }
    }
  }
  
  // Summary
  log(`\n${colors.bold}📊 Pre-Deployment Check Summary:${colors.reset}`);
  log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  log(`${colors.yellow}⚠️  Warnings: ${warnings}${colors.reset}`);
  
  if (failed > 0) {
    log(`\n${colors.red}${colors.bold}❌ Pre-deployment checks failed!${colors.reset}`);
    log(`${colors.red}Please fix the critical issues above before deploying.${colors.reset}`);
    process.exit(1);
  } else if (warnings > 0) {
    log(`\n${colors.yellow}${colors.bold}⚠️  Pre-deployment checks passed with warnings${colors.reset}`);
    log(`${colors.yellow}Consider addressing the warnings above.${colors.reset}`);
    log(`\n${colors.green}${colors.bold}🎉 Ready for deployment!${colors.reset}`);
  } else {
    log(`\n${colors.green}${colors.bold}🎉 All pre-deployment checks passed!${colors.reset}`);
    log(`${colors.green}Your application is ready for deployment.${colors.reset}`);
  }
  
  // Next steps
  log(`\n${colors.blue}${colors.bold}Next steps:${colors.reset}`);
  log(`${colors.blue}1. Run: npm run deploy:vercel (for production)${colors.reset}`);
  log(`${colors.blue}2. Run: npm run deploy:preview (for preview)${colors.reset}`);
  log(`${colors.blue}3. After deployment, run: npm run verify:production${colors.reset}`);
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    logError(`Pre-deployment check failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };