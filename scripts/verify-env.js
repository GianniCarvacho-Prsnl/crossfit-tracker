#!/usr/bin/env node

/**
 * Environment Variables Verification Script for CrossFit Tracker
 * This script verifies that all required environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

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

// Environment variable definitions
const environmentVariables = {
  required: [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      description: 'Supabase project URL',
      validation: (value) => {
        if (!value) return { valid: false, message: 'Value is required' };
        if (!value.startsWith('https://')) return { valid: false, message: 'Must start with https://' };
        if (!value.includes('.supabase.co')) return { valid: false, message: 'Must be a valid Supabase URL' };
        return { valid: true };
      }
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      description: 'Supabase anonymous key',
      validation: (value) => {
        if (!value) return { valid: false, message: 'Value is required' };
        if (value.length < 100) return { valid: false, message: 'Key appears to be too short' };
        if (!value.startsWith('eyJ')) return { valid: false, message: 'Should be a JWT token starting with eyJ' };
        return { valid: true };
      }
    }
  ],
  optional: [
    {
      name: 'SUPABASE_ACCESS_TOKEN',
      description: 'Supabase personal access token (for MCP integration)',
      validation: (value) => {
        if (!value) return { valid: true, message: 'Optional - not set' };
        if (value.length < 40) return { valid: false, message: 'Token appears to be too short' };
        return { valid: true };
      }
    },
    {
      name: 'NODE_ENV',
      description: 'Node.js environment',
      validation: (value) => {
        if (!value) return { valid: true, message: 'Will default to development' };
        const validEnvs = ['development', 'production', 'test'];
        if (!validEnvs.includes(value)) {
          return { valid: false, message: `Must be one of: ${validEnvs.join(', ')}` };
        }
        return { valid: true };
      }
    }
  ],
  production: [
    {
      name: 'NEXT_PUBLIC_VERCEL_ANALYTICS_ID',
      description: 'Vercel Analytics ID (recommended for production)',
      validation: (value) => {
        if (!value) return { valid: true, message: 'Optional - analytics not configured' };
        return { valid: true };
      }
    }
  ]
};

// Load environment variables from various sources
function loadEnvironmentVariables() {
  const envSources = [];
  
  // Load from process.env (already loaded)
  envSources.push({ source: 'process.env', vars: process.env });
  
  // Try to load from .env.local
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    try {
      const envLocal = fs.readFileSync(envLocalPath, 'utf8');
      const envVars = {};
      envLocal.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      });
      envSources.push({ source: '.env.local', vars: envVars });
    } catch (error) {
      logWarning(`Could not read .env.local: ${error.message}`);
    }
  }
  
  // Try to load from .env.production.local (for production builds)
  if (process.env.NODE_ENV === 'production') {
    const envProdPath = path.join(process.cwd(), '.env.production.local');
    if (fs.existsSync(envProdPath)) {
      try {
        const envProd = fs.readFileSync(envProdPath, 'utf8');
        const envVars = {};
        envProd.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        });
        envSources.push({ source: '.env.production.local', vars: envVars });
      } catch (error) {
        logWarning(`Could not read .env.production.local: ${error.message}`);
      }
    }
  }
  
  return envSources;
}

// Test Supabase connectivity
async function testSupabaseConnection(url, anonKey) {
  return new Promise((resolve) => {
    try {
      const testUrl = new URL('/rest/v1/', url).toString();
      
      const options = {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };
      
      const req = https.request(testUrl, options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 401) {
          // 200 = success, 401 = unauthorized but connection works
          resolve({ success: true, status: res.statusCode });
        } else {
          resolve({ success: false, status: res.statusCode, message: `HTTP ${res.statusCode}` });
        }
      });
      
      req.on('error', (error) => {
        resolve({ success: false, message: error.message });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, message: 'Connection timeout' });
      });
      
      req.end();
    } catch (error) {
      resolve({ success: false, message: error.message });
    }
  });
}

// Validate environment variables
async function validateEnvironmentVariables() {
  log(`${colors.bold}${colors.blue}🔍 Environment Variables Verification${colors.reset}\n`);
  
  const envSources = loadEnvironmentVariables();
  
  // Show loaded sources
  logInfo('Environment sources loaded:');
  envSources.forEach(source => {
    const count = Object.keys(source.vars).length;
    logInfo(`  - ${source.source}: ${count} variables`);
  });
  
  // Merge all environment variables (later sources override earlier ones)
  const mergedEnv = {};
  envSources.forEach(source => {
    Object.assign(mergedEnv, source.vars);
  });
  
  let allValid = true;
  let criticalMissing = 0;
  
  // Check required variables
  log(`\n${colors.bold}Required Variables:${colors.reset}`);
  for (const envVar of environmentVariables.required) {
    const value = mergedEnv[envVar.name];
    const validation = envVar.validation(value);
    
    if (validation.valid) {
      logSuccess(`${envVar.name}: ${validation.message || 'Valid'}`);
    } else {
      logError(`${envVar.name}: ${validation.message}`);
      logError(`  Description: ${envVar.description}`);
      allValid = false;
      criticalMissing++;
    }
  }
  
  // Check optional variables
  log(`\n${colors.bold}Optional Variables:${colors.reset}`);
  for (const envVar of environmentVariables.optional) {
    const value = mergedEnv[envVar.name];
    const validation = envVar.validation(value);
    
    if (validation.valid) {
      if (value) {
        logSuccess(`${envVar.name}: ${validation.message || 'Valid'}`);
      } else {
        logInfo(`${envVar.name}: ${validation.message || 'Not set'}`);
      }
    } else {
      logWarning(`${envVar.name}: ${validation.message}`);
      logWarning(`  Description: ${envVar.description}`);
    }
  }
  
  // Check production-specific variables
  if (process.env.NODE_ENV === 'production') {
    log(`\n${colors.bold}Production Variables:${colors.reset}`);
    for (const envVar of environmentVariables.production) {
      const value = mergedEnv[envVar.name];
      const validation = envVar.validation(value);
      
      if (validation.valid) {
        if (value) {
          logSuccess(`${envVar.name}: ${validation.message || 'Valid'}`);
        } else {
          logWarning(`${envVar.name}: ${validation.message || 'Not set (recommended for production)'}`);
        }
      } else {
        logWarning(`${envVar.name}: ${validation.message}`);
        logWarning(`  Description: ${envVar.description}`);
      }
    }
  }
  
  // Test Supabase connection if variables are present
  const supabaseUrl = mergedEnv.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = mergedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    log(`\n${colors.bold}Connectivity Test:${colors.reset}`);
    logInfo('Testing Supabase connection...');
    
    const connectionTest = await testSupabaseConnection(supabaseUrl, supabaseKey);
    
    if (connectionTest.success) {
      logSuccess(`Supabase connection successful (HTTP ${connectionTest.status})`);
    } else {
      logError(`Supabase connection failed: ${connectionTest.message}`);
      if (connectionTest.status) {
        logError(`HTTP Status: ${connectionTest.status}`);
      }
      allValid = false;
    }
  } else {
    logWarning('Skipping connectivity test - Supabase variables not properly configured');
  }
  
  // Summary and recommendations
  log(`\n${colors.bold}Summary:${colors.reset}`);
  
  if (allValid) {
    logSuccess('All environment variables are properly configured!');
  } else {
    logError(`${criticalMissing} critical environment variable(s) are missing or invalid`);
    
    log(`\n${colors.bold}Recommendations:${colors.reset}`);
    
    if (!fs.existsSync('.env.local')) {
      logInfo('Create .env.local file with your environment variables');
      logInfo('You can copy from .env.local.example as a starting point');
    }
    
    if (process.env.NODE_ENV === 'production' && !fs.existsSync('.env.production.local')) {
      logInfo('For production builds, create .env.production.local');
      logInfo('You can copy from .env.production.example as a starting point');
    }
    
    logInfo('Ensure all required variables are set in your deployment platform (Vercel)');
    logInfo('Double-check your Supabase project settings for correct URL and keys');
  }
  
  return allValid;
}

// Generate environment documentation
function generateEnvironmentDocs() {
  const docsPath = path.join(process.cwd(), 'ENVIRONMENT_VARIABLES.md');
  
  let docs = `# Environment Variables Documentation

This document describes all environment variables used by CrossFit Tracker.

## Required Variables

These variables must be set for the application to function properly:

`;

  environmentVariables.required.forEach(envVar => {
    docs += `### ${envVar.name}
- **Description**: ${envVar.description}
- **Required**: Yes
- **Example**: See .env.local.example

`;
  });

  docs += `## Optional Variables

These variables are optional but may enhance functionality:

`;

  environmentVariables.optional.forEach(envVar => {
    docs += `### ${envVar.name}
- **Description**: ${envVar.description}
- **Required**: No
- **Example**: See .env.local.example

`;
  });

  docs += `## Production Variables

Additional variables recommended for production:

`;

  environmentVariables.production.forEach(envVar => {
    docs += `### ${envVar.name}
- **Description**: ${envVar.description}
- **Required**: No (recommended)
- **Example**: See .env.production.example

`;
  });

  docs += `## Setup Instructions

1. Copy \`.env.local.example\` to \`.env.local\`
2. Fill in your actual values
3. For production, copy \`.env.production.example\` to \`.env.production.local\`
4. Configure the same variables in your deployment platform (Vercel)

## Verification

Run \`npm run pre-deploy:env\` to verify all environment variables are properly configured.
`;

  try {
    fs.writeFileSync(docsPath, docs);
    logSuccess(`Environment documentation generated: ${docsPath}`);
  } catch (error) {
    logWarning(`Could not generate documentation: ${error.message}`);
  }
}

// Main execution
async function main() {
  const isValid = await validateEnvironmentVariables();
  
  // Generate documentation
  generateEnvironmentDocs();
  
  if (!isValid) {
    log(`\n${colors.red}${colors.bold}❌ Environment verification failed!${colors.reset}`);
    process.exit(1);
  } else {
    log(`\n${colors.green}${colors.bold}🎉 Environment verification passed!${colors.reset}`);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    logError(`Environment verification failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { validateEnvironmentVariables, main };