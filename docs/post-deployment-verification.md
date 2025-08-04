# Post-Deployment Verification Guide

This document explains how to use the post-deployment verification system for CrossFit Tracker.

## Overview

The post-deployment verification system automatically tests core functionality after deploying to production, ensuring that:

- All pages load correctly
- Authentication system works
- Workout registration functionality is available
- Performance meets acceptable thresholds
- Mobile responsiveness is maintained
- PWA features are functional

## Quick Start

### Basic Verification
```bash
npm run verify:production
```

### Full Verification (All Tests)
```bash
npm run verify:production:full
```

### Custom URL Verification
```bash
npm run verify:production -- --url https://your-app.vercel.app
```

### Quick Check (Essential Tests Only)
```bash
npm run verify:production -- --quick
```

## Command Line Options

| Option | Short | Description |
|--------|-------|-------------|
| `--url <url>` | `-u` | Specify custom URL to verify |
| `--verbose` | `-v` | Show detailed output for all tests |
| `--quick` | `-q` | Run only essential tests (faster) |
| `--help` | `-h` | Show help message |

## Test Categories

### 1. Health Check Verification
- Tests `/api/health` endpoint
- Verifies database connectivity
- Checks response time

**Expected Results:**
- Status code: 200
- Response body contains `status: 'ok'` and `database: 'connected'`
- Response time under 1 second

### 2. Page Loading Tests
Tests all main application pages:
- `/` (Home/Dashboard)
- `/login` (Authentication)
- `/register` (Workout Registration)
- `/records` (Workout History)
- `/conversions` (Weight Conversions)
- `/percentages` (RM Percentages)

**Expected Results:**
- Status code: 200 or 302 (redirect for protected routes)
- Contains valid HTML structure
- Includes Next.js static assets
- Page size under reasonable limits

### 3. Authentication Verification
- Login page accessibility
- Registration form presence
- Protected route behavior
- Form element validation

**Expected Results:**
- Login form contains email and password inputs
- Registration page is accessible
- Protected routes redirect unauthenticated users
- Authentication components are present

### 4. Workout Registration Tests
- Workout form accessibility
- Required form elements
- Records page functionality

**Expected Results:**
- Exercise selection dropdown present
- Weight and reps input fields available
- Records page shows workout data or requires authentication

### 5. Performance Verification
- Page load time measurement
- API response time testing
- Resource size analysis

**Performance Thresholds:**
- Page load time: < 3 seconds
- API response time: < 1 second
- Main page size: < 500KB

### 6. Responsiveness Tests
- Mobile viewport meta tag
- Responsive CSS classes
- PWA manifest validation
- Mobile compatibility features

**Expected Results:**
- Viewport meta tag present
- Responsive design classes detected
- Valid PWA manifest accessible
- Mobile-optimized layout

## Integration with CI/CD

### Vercel Deployment
Add to your Vercel deployment workflow:

```bash
# After successful deployment
npm run verify:production
```

### GitHub Actions
```yaml
- name: Verify Production Deployment
  run: |
    npm run verify:production -- --url ${{ steps.deploy.outputs.url }}
  env:
    PRODUCTION_URL: ${{ steps.deploy.outputs.url }}
```

### Manual Verification
For manual testing after deployment:

```bash
# Set custom URL
export PRODUCTION_URL=https://your-app.vercel.app

# Run verification
npm run verify:production

# Or run with URL directly
npm run verify:production -- --url https://your-app.vercel.app
```

## Environment Variables

The verification script uses these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `VERCEL_URL` | Automatically set by Vercel | - |
| `PRODUCTION_URL` | Custom production URL override | `https://crossfit-tracker.vercel.app` |

## Troubleshooting

### Common Issues

#### 1. Connection Timeouts
```
❌ Health check request failed: Request timeout after 10000ms
```

**Solutions:**
- Check if the deployment is complete
- Verify the URL is correct
- Ensure the application is running

#### 2. Authentication Tests Failing
```
❌ Login form missing required elements
```

**Solutions:**
- Verify login page is accessible
- Check form HTML structure
- Ensure authentication components are rendered

#### 3. Performance Issues
```
❌ Page load time exceeds threshold: 5000ms > 3000ms
```

**Solutions:**
- Check bundle size optimization
- Verify CDN configuration
- Review performance optimizations

#### 4. PWA Manifest Issues
```
❌ PWA manifest not accessible
```

**Solutions:**
- Verify `public/manifest.json` exists
- Check manifest.json syntax
- Ensure proper MIME type configuration

### Debug Mode

For detailed debugging, use verbose mode:

```bash
npm run verify:production -- --verbose
```

This will show:
- Detailed request/response information
- Performance metrics
- HTML content analysis
- Error stack traces

### Custom Verification

You can extend the verification script by modifying `scripts/verify-production.js`:

```javascript
// Add custom test
async verifyCustomFeature() {
  console.log('🔍 Testing custom feature...');
  
  try {
    const response = await this.makeRequest('/api/custom');
    
    if (response.statusCode === 200) {
      this.logSuccess('Custom feature working');
    } else {
      this.logFailure('Custom feature failed');
    }
  } catch (error) {
    this.logFailure('Custom feature error', error.message);
  }
}
```

## Exit Codes

The verification script uses standard exit codes:

- `0`: All tests passed
- `1`: One or more tests failed or script error

This allows integration with CI/CD pipelines that check exit codes for success/failure.

## Best Practices

1. **Run After Every Deployment**: Include verification in your deployment pipeline
2. **Monitor Performance**: Track performance metrics over time
3. **Test Different Environments**: Verify both staging and production
4. **Custom Tests**: Add application-specific tests as needed
5. **Alert on Failures**: Set up notifications for verification failures

## Example Output

### Successful Verification
```
🚀 Starting post-deployment verification...
📍 Target URL: https://crossfit-tracker.vercel.app

🔍 Testing health check endpoint...
✅ Health check passed
   {"responseTime":"145.23ms"}

🔍 Testing page loading...
✅ Home/Dashboard page loaded
✅ Login page loaded
✅ Register page loaded
✅ Records page correctly requires authentication
✅ Conversions page loaded
✅ Percentages page loaded

🔍 Testing authentication functionality...
✅ Login form elements present
✅ Register page accessible
✅ Protected route correctly redirects unauthenticated users

🔍 Testing workout registration functionality...
✅ Workout registration form elements present
✅ Records page correctly requires authentication

🔍 Testing performance metrics...
✅ Page load time within threshold
✅ API response time within threshold
✅ Page size within reasonable limits

🔍 Testing responsiveness and mobile compatibility...
✅ Viewport meta tag present for mobile responsiveness
✅ Responsive CSS classes detected
✅ PWA manifest detected
✅ PWA manifest is valid

============================================================
📊 VERIFICATION SUMMARY
============================================================
✅ Passed: 18
❌ Failed: 0
📈 Total:  18

🎉 All verification tests passed! Deployment is ready for production use.
============================================================
```

### Failed Verification
```
🚀 Starting post-deployment verification...
📍 Target URL: https://crossfit-tracker.vercel.app

🔍 Testing health check endpoint...
❌ Health check returned invalid status
   {"status":"error","database":"disconnected"}

============================================================
📊 VERIFICATION SUMMARY
============================================================
✅ Passed: 0
❌ Failed: 1
📈 Total:  1

⚠️  Some verification tests failed. Please review the issues above.

Failed tests:
   • Health check returned invalid status
============================================================
```