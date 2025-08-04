# Vercel Deployment Optimization

This document outlines the performance and security optimizations implemented for the CrossFit Tracker deployment on Vercel.

## Performance Optimizations

### 1. Caching Strategy

#### Static Assets
- **Cache Duration**: 1 year (31,536,000 seconds)
- **Immutable Flag**: Enabled for versioned assets
- **Applies to**: `/_next/static/*`, JS, CSS, fonts, images

```json
{
  "source": "/_next/static/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

#### PWA Assets
- **Service Worker**: No cache, always fresh
- **Manifest**: 24-hour cache
- **Workbox Scripts**: 1-year cache with immutable flag

#### API Responses
- **Health Endpoint**: No cache for real-time status
- **General APIs**: CORS configured with credentials support

### 2. Function Configuration

#### Optimized Timeouts and Memory
- **Health Check**: 5s timeout, 512MB memory
- **Auth Confirmation**: 15s timeout, 512MB memory (Supabase operations)
- **General APIs**: 10s timeout, 1GB memory
- **Page Rendering**: 10s timeout, 1GB memory

```json
{
  "functions": {
    "app/api/health/route.ts": {
      "maxDuration": 5,
      "memory": 512
    },
    "app/auth/confirm/route.ts": {
      "maxDuration": 15,
      "memory": 512
    }
  }
}
```

## Security Enhancements

### 1. Enhanced Security Headers

#### Content Security Policy (CSP)
- **Default Source**: Self-only
- **Scripts**: Self + Vercel Analytics + unsafe-eval/inline for Next.js
- **Styles**: Self + Google Fonts + unsafe-inline
- **Fonts**: Self + Google Fonts Static
- **Images**: Self + data URLs + HTTPS + blob
- **Connections**: Self + Supabase + Vercel services
- **Form Actions**: Self-only

#### Additional Security Headers
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Strict-Transport-Security**: HSTS with preload
- **Cross-Origin-Embedder-Policy**: credentialless
- **Cross-Origin-Opener-Policy**: same-origin
- **Cross-Origin-Resource-Policy**: same-origin

### 2. CORS Configuration

#### API Endpoints
- **Origin**: Restricted to production domain
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With, X-CSRF-Token
- **Credentials**: Enabled for authenticated requests
- **Max Age**: 24 hours for preflight caching

### 3. Permissions Policy
Disabled unnecessary browser features:
- Camera, Microphone, Geolocation
- Interest Cohort, Browsing Topics
- Payment, USB, Bluetooth
- Magnetometer, Gyroscope, Accelerometer

## Build Optimizations

### 1. Next.js Configuration
- **Bundle Splitting**: Vendor and Supabase chunks
- **Image Optimization**: WebP and AVIF formats
- **Package Imports**: Optimized for Supabase
- **Console Removal**: Production builds

### 2. PWA Configuration
- **Runtime Caching**: Optimized for offline functionality
- **Google Fonts**: Long-term caching
- **API Responses**: Network-first with fallback
- **Static Resources**: Stale-while-revalidate

## Monitoring and Validation

### 1. Configuration Validation
Run the validation script to ensure configuration integrity:

```bash
npm run validate:vercel
```

### 2. Performance Monitoring
- **Web Vitals**: Enabled for Core Web Vitals tracking
- **Function Performance**: Timeout and memory monitoring
- **Cache Hit Rates**: Static asset performance

### 3. Security Validation
- **Headers**: Automated validation of security headers
- **CSP**: Content Security Policy compliance
- **CORS**: Cross-origin request validation

## Deployment Commands

### Production Deployment
```bash
npm run deploy:vercel
```

### Preview Deployment
```bash
npm run deploy:preview
```

### Configuration Check
```bash
npm run validate:vercel
node scripts/vercel-performance-config.js
```

## Performance Metrics

### Expected Improvements
- **Static Asset Loading**: 99% cache hit rate
- **Function Cold Starts**: Minimized with appropriate memory allocation
- **Security Score**: A+ rating on security headers
- **PWA Score**: 100% on Lighthouse PWA audit

### Monitoring
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Function Duration**: Health check < 100ms, APIs < 1s
- **Cache Performance**: 95%+ hit rate for static assets

## Troubleshooting

### Common Issues
1. **CSP Violations**: Check browser console for blocked resources
2. **Function Timeouts**: Monitor function duration in Vercel dashboard
3. **Cache Issues**: Verify cache headers in Network tab

### Debug Commands
```bash
# Validate configuration
npm run validate:vercel

# Check performance settings
node scripts/vercel-performance-config.js

# Analyze bundle size
npm run analyze
```

## Best Practices

1. **Regular Validation**: Run configuration validation before deployments
2. **Performance Monitoring**: Monitor Core Web Vitals and function performance
3. **Security Updates**: Keep security headers updated with latest recommendations
4. **Cache Strategy**: Review and optimize caching based on usage patterns
5. **Function Optimization**: Monitor and adjust timeouts based on actual performance