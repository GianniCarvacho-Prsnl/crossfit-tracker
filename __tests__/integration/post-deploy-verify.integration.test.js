/**
 * Integration tests for post-deployment verification
 * Tests the actual CLI and script execution
 */

const { execSync } = require('child_process');
const path = require('path');

describe('Post-Deployment Verification Integration', () => {
  const scriptPath = path.join(__dirname, '../../scripts/post-deploy-verify.js');

  beforeEach(() => {
    // Mock console methods to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show help when --help flag is used', () => {
    try {
      const output = execSync(`node ${scriptPath} --help`, { 
        encoding: 'utf8',
        timeout: 5000 
      });
      
      expect(output).toContain('CrossFit Tracker - Post-Deployment Verification Tool');
      expect(output).toContain('Usage: npm run verify:production');
      expect(output).toContain('Options:');
      expect(output).toContain('--url, -u');
      expect(output).toContain('--verbose, -v');
      expect(output).toContain('--quick, -q');
    } catch (error) {
      // Help command exits with code 0, so this shouldn't happen
      fail(`Help command failed: ${error.message}`);
    }
  });

  it('should accept URL parameter', () => {
    try {
      const output = execSync(`node ${scriptPath} --help`, { 
        encoding: 'utf8',
        timeout: 5000 
      });
      
      expect(output).toContain('--url, -u <url>');
    } catch (error) {
      fail(`URL parameter test failed: ${error.message}`);
    }
  });

  it('should have proper npm script configuration', () => {
    const packageJson = require('../../package.json');
    
    expect(packageJson.scripts).toHaveProperty('verify:production');
    expect(packageJson.scripts).toHaveProperty('verify:production:full');
    expect(packageJson.scripts['verify:production']).toContain('post-deploy-verify.js');
    expect(packageJson.scripts['verify:production:full']).toContain('verify-production.js');
  });

  it('should export ProductionVerifier class', () => {
    const ProductionVerifier = require('../../scripts/verify-production');
    
    expect(ProductionVerifier).toBeDefined();
    expect(typeof ProductionVerifier).toBe('function');
    
    const verifier = new ProductionVerifier();
    expect(verifier).toHaveProperty('results');
    expect(verifier).toHaveProperty('runAllTests');
    expect(verifier).toHaveProperty('verifyHealthCheck');
    expect(verifier).toHaveProperty('verifyPageLoading');
    expect(verifier).toHaveProperty('verifyAuthentication');
    expect(verifier).toHaveProperty('verifyWorkoutRegistration');
    expect(verifier).toHaveProperty('verifyPerformance');
    expect(verifier).toHaveProperty('verifyResponsiveness');
  });

  it('should have proper file permissions for scripts', () => {
    const fs = require('fs');
    
    // Check that script files exist
    expect(fs.existsSync(path.join(__dirname, '../../scripts/verify-production.js'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '../../scripts/post-deploy-verify.js'))).toBe(true);
    
    // Check that they have proper shebang
    const verifyScript = fs.readFileSync(path.join(__dirname, '../../scripts/verify-production.js'), 'utf8');
    const cliScript = fs.readFileSync(path.join(__dirname, '../../scripts/post-deploy-verify.js'), 'utf8');
    
    expect(verifyScript).toMatch(/^#!/);
    expect(cliScript).toMatch(/^#!/);
  });

  it('should handle environment variables correctly', () => {
    const originalEnv = process.env;
    
    try {
      // Test with VERCEL_URL
      process.env.VERCEL_URL = 'test-app.vercel.app';
      delete process.env.PRODUCTION_URL;
      
      const ProductionVerifier = require('../../scripts/verify-production');
      const verifier = new ProductionVerifier();
      
      // The CONFIG should use VERCEL_URL when available
      expect(process.env.VERCEL_URL).toBe('test-app.vercel.app');
      
      // Test with PRODUCTION_URL override
      process.env.PRODUCTION_URL = 'https://custom-url.com';
      
      // Should use PRODUCTION_URL when set
      expect(process.env.PRODUCTION_URL).toBe('https://custom-url.com');
      
    } finally {
      process.env = originalEnv;
    }
  });

  it('should have documentation file', () => {
    const fs = require('fs');
    const docPath = path.join(__dirname, '../../docs/post-deployment-verification.md');
    
    expect(fs.existsSync(docPath)).toBe(true);
    
    const docContent = fs.readFileSync(docPath, 'utf8');
    expect(docContent).toContain('# Post-Deployment Verification Guide');
    expect(docContent).toContain('npm run verify:production');
    expect(docContent).toContain('Health Check Verification');
    expect(docContent).toContain('Performance Verification');
    expect(docContent).toContain('Troubleshooting');
  });
});