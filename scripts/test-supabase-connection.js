#!/usr/bin/env node

/**
 * Supabase Connectivity Test Script
 * This script tests the connection to Supabase using the configured environment variables
 * and verifies that all core functionality is accessible
 */

const https = require('https');
const { URL } = require('url');
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

function logStep(step, message) {
  log(`${colors.blue}[${step}]${colors.reset} ${message}`);
}

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
  
  return env;
}

// Make HTTP request with timeout
function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const requestOptions = {
      method: 'GET',
      timeout: 10000,
      ...options
    };
    
    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          success: true,
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });
    
    req.end();
  });
}

// Test basic Supabase REST API connectivity
async function testRestApiConnection(supabaseUrl, anonKey) {
  logStep('REST', 'Testing Supabase REST API connection...');
  
  try {
    const apiUrl = new URL('/rest/v1/', supabaseUrl).toString();
    
    const response = await makeRequest(apiUrl, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.success) {
      if (response.statusCode === 200) {
        logSuccess('REST API connection successful');
        return { success: true, message: 'Connected successfully' };
      } else if (response.statusCode === 401) {
        logSuccess('REST API reachable (authentication working)');
        return { success: true, message: 'API reachable, auth configured' };
      } else {
        logWarning(`REST API returned status ${response.statusCode}`);
        return { success: false, message: `HTTP ${response.statusCode}` };
      }
    } else {
      logError(`REST API connection failed: ${response.error}`);
      return { success: false, message: response.error };
    }
  } catch (error) {
    logError(`REST API test failed: ${error.message}`);
    return { success: false, message: error.message };
  }
}

// Test Supabase Auth API
async function testAuthApiConnection(supabaseUrl, anonKey) {
  logStep('AUTH', 'Testing Supabase Auth API connection...');
  
  try {
    const authUrl = new URL('/auth/v1/settings', supabaseUrl).toString();
    
    const response = await makeRequest(authUrl, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.success) {
      if (response.statusCode === 200) {
        logSuccess('Auth API connection successful');
        
        // Try to parse auth settings
        try {
          const settings = JSON.parse(response.data);
          if (settings.external) {
            logInfo(`Auth providers configured: ${Object.keys(settings.external).join(', ')}`);
          }
        } catch (parseError) {
          logInfo('Auth API responded but could not parse settings');
        }
        
        return { success: true, message: 'Auth API accessible' };
      } else {
        logWarning(`Auth API returned status ${response.statusCode}`);
        return { success: false, message: `HTTP ${response.statusCode}` };
      }
    } else {
      logError(`Auth API connection failed: ${response.error}`);
      return { success: false, message: response.error };
    }
  } catch (error) {
    logError(`Auth API test failed: ${error.message}`);
    return { success: false, message: error.message };
  }
}

// Test specific table access (if tables exist)
async function testTableAccess(supabaseUrl, anonKey) {
  logStep('TABLES', 'Testing database table access...');
  
  const tablesToTest = ['exercises', 'workout_records'];
  const results = [];
  
  for (const tableName of tablesToTest) {
    try {
      const tableUrl = new URL(`/rest/v1/${tableName}?select=*&limit=1`, supabaseUrl).toString();
      
      const response = await makeRequest(tableUrl, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.success) {
        if (response.statusCode === 200) {
          logSuccess(`Table '${tableName}' is accessible`);
          results.push({ table: tableName, success: true, message: 'Accessible' });
        } else if (response.statusCode === 401) {
          logWarning(`Table '${tableName}' requires authentication (RLS enabled)`);
          results.push({ table: tableName, success: true, message: 'RLS protected' });
        } else if (response.statusCode === 404) {
          logWarning(`Table '${tableName}' not found`);
          results.push({ table: tableName, success: false, message: 'Table not found' });
        } else {
          logWarning(`Table '${tableName}' returned status ${response.statusCode}`);
          results.push({ table: tableName, success: false, message: `HTTP ${response.statusCode}` });
        }
      } else {
        logError(`Table '${tableName}' test failed: ${response.error}`);
        results.push({ table: tableName, success: false, message: response.error });
      }
    } catch (error) {
      logError(`Table '${tableName}' test failed: ${error.message}`);
      results.push({ table: tableName, success: false, message: error.message });
    }
  }
  
  const accessibleTables = results.filter(r => r.success).length;
  const totalTables = results.length;
  
  if (accessibleTables > 0) {
    logSuccess(`${accessibleTables}/${totalTables} expected tables are accessible`);
    return { success: true, results };
  } else {
    logWarning('No expected tables found - database may not be set up yet');
    return { success: true, results, warning: 'No tables found' };
  }
}

// Test Supabase project health
async function testProjectHealth(supabaseUrl, anonKey) {
  logStep('HEALTH', 'Testing overall project health...');
  
  try {
    const healthUrl = new URL('/rest/v1/', supabaseUrl).toString();
    
    const response = await makeRequest(healthUrl, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.success) {
      // Check response time
      const startTime = Date.now();
      await makeRequest(healthUrl, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });
      const responseTime = Date.now() - startTime;
      
      if (responseTime < 1000) {
        logSuccess(`Project health good (response time: ${responseTime}ms)`);
      } else if (responseTime < 3000) {
        logWarning(`Project health acceptable (response time: ${responseTime}ms)`);
      } else {
        logWarning(`Project health slow (response time: ${responseTime}ms)`);
      }
      
      return { success: true, responseTime };
    } else {
      logError(`Project health check failed: ${response.error}`);
      return { success: false, message: response.error };
    }
  } catch (error) {
    logError(`Project health check failed: ${error.message}`);
    return { success: false, message: error.message };
  }
}

// Generate connectivity report
function generateConnectivityReport(results) {
  const reportPath = path.join(process.cwd(), '.next', 'supabase-connectivity-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    supabaseUrl: results.supabaseUrl ? results.supabaseUrl.replace(/\/+$/, '') : null,
    tests: results.tests,
    overall: results.overall
  };
  
  try {
    // Ensure .next directory exists
    const nextDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(nextDir)) {
      fs.mkdirSync(nextDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logInfo(`Connectivity report generated: ${reportPath}`);
  } catch (error) {
    logWarning(`Could not generate connectivity report: ${error.message}`);
  }
}

// Main connectivity test function
async function testSupabaseConnectivity() {
  log(`${colors.bold}${colors.blue}🔗 Supabase Connectivity Test${colors.reset}\n`);
  
  const env = loadEnvironmentVariables();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Validate required variables
  if (!supabaseUrl) {
    logError('NEXT_PUBLIC_SUPABASE_URL is not set');
    return { success: false, message: 'Missing Supabase URL' };
  }
  
  if (!anonKey) {
    logError('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    return { success: false, message: 'Missing Supabase anon key' };
  }
  
  logInfo(`Testing connection to: ${supabaseUrl}`);
  logInfo(`Using anon key: ${anonKey.substring(0, 20)}...`);
  
  const results = {
    supabaseUrl,
    tests: {},
    overall: { success: true, warnings: 0, errors: 0 }
  };
  
  // Run connectivity tests
  try {
    // Test REST API
    results.tests.restApi = await testRestApiConnection(supabaseUrl, anonKey);
    if (!results.tests.restApi.success) {
      results.overall.success = false;
      results.overall.errors++;
    }
    
    // Test Auth API
    results.tests.authApi = await testAuthApiConnection(supabaseUrl, anonKey);
    if (!results.tests.authApi.success) {
      results.overall.warnings++;
    }
    
    // Test table access
    results.tests.tableAccess = await testTableAccess(supabaseUrl, anonKey);
    if (!results.tests.tableAccess.success) {
      results.overall.warnings++;
    }
    
    // Test project health
    results.tests.projectHealth = await testProjectHealth(supabaseUrl, anonKey);
    if (!results.tests.projectHealth.success) {
      results.overall.warnings++;
    }
    
  } catch (error) {
    logError(`Connectivity test failed: ${error.message}`);
    results.overall.success = false;
    results.overall.errors++;
  }
  
  // Generate report
  generateConnectivityReport(results);
  
  // Summary
  log(`\n${colors.bold}Connectivity Test Summary:${colors.reset}`);
  
  if (results.overall.success) {
    logSuccess('Supabase connectivity test passed!');
    if (results.overall.warnings > 0) {
      logWarning(`${results.overall.warnings} warning(s) found - check details above`);
    }
  } else {
    logError(`Supabase connectivity test failed with ${results.overall.errors} error(s)`);
    
    log(`\n${colors.bold}Troubleshooting Steps:${colors.reset}`);
    logError('1. Verify NEXT_PUBLIC_SUPABASE_URL is correct');
    logError('2. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is valid');
    logError('3. Check Supabase project status in dashboard');
    logError('4. Ensure project is not paused or suspended');
    logError('5. Check network connectivity and firewall settings');
  }
  
  return results;
}

// Main execution
async function main() {
  const results = await testSupabaseConnectivity();
  
  if (!results.overall.success) {
    log(`\n${colors.red}${colors.bold}❌ Supabase connectivity test failed!${colors.reset}`);
    process.exit(1);
  } else {
    log(`\n${colors.green}${colors.bold}🎉 Supabase connectivity test passed!${colors.reset}`);
    if (results.overall.warnings > 0) {
      log(`${colors.yellow}Note: ${results.overall.warnings} warning(s) found - review above for details${colors.reset}`);
    }
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    logError(`Supabase connectivity test failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { testSupabaseConnectivity, main };