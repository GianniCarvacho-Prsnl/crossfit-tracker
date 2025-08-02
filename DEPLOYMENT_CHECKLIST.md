# Deployment Checklist - CrossFit Tracker

Use this checklist to ensure a successful deployment to production.

## Pre-Deployment Checklist

### 1. Code Quality & Testing
- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] ESLint passes without errors (`npm run lint`)
- [ ] Unit tests pass (`npm run test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Application builds successfully (`npm run build`)

### 2. Environment Configuration
- [ ] Production Supabase project created and configured
- [ ] Database schema deployed to production Supabase
- [ ] Row Level Security (RLS) policies enabled
- [ ] Environment variables configured in deployment platform
- [ ] `.env.production.local` file created (if needed)

### 3. Database Setup
- [ ] `exercises` table populated with 5 exercises
- [ ] `workout_records` table created with proper schema
- [ ] Database indexes created for performance
- [ ] RLS policies tested and working
- [ ] Database backup strategy configured

### 4. Security Review
- [ ] No sensitive data in client-side code
- [ ] Environment variables properly secured
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] CORS settings reviewed

## Deployment Steps

### Option 1: Vercel CLI Deployment
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to preview (optional)
npm run deploy:preview

# 4. Deploy to production
npm run deploy:vercel
```

### Option 2: Git Integration
1. Push code to main/master branch
2. Vercel automatically deploys
3. Monitor deployment logs

### Option 3: GitHub Actions
1. Ensure GitHub secrets are configured
2. Push to main/master branch
3. Monitor GitHub Actions workflow

## Post-Deployment Verification

### Automated Checks
```bash
# Run production verification script
PRODUCTION_URL=https://your-app.vercel.app npm run verify:production
```

### Manual Verification

#### 1. Core Functionality
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Email confirmation works
- [ ] Login/logout functionality
- [ ] Protected routes redirect correctly

#### 2. Workout Management
- [ ] Workout registration form works
- [ ] All 5 exercises are available in dropdown
- [ ] 1RM calculations are accurate (test with known values)
- [ ] Unit conversions work correctly (lbs/kg)
- [ ] Records are saved to database

#### 3. Data Display
- [ ] Records list displays correctly
- [ ] Filtering by exercise works
- [ ] Sorting by date works (newest first)
- [ ] Sorting by weight works (heaviest first)
- [ ] Both calculated and direct 1RM indicators show
- [ ] Unit conversions display correctly in list

#### 4. Mobile Experience
- [ ] Responsive design works on mobile devices
- [ ] Touch interactions are smooth and responsive
- [ ] Forms are easy to use on mobile
- [ ] Navigation menu works on mobile
- [ ] PWA can be installed on mobile devices

#### 5. Performance & PWA
- [ ] Page load times are acceptable (< 3 seconds)
- [ ] Images load and are optimized
- [ ] Service worker is registered and working
- [ ] App works offline (shows cached content)
- [ ] PWA manifest is accessible
- [ ] App can be added to home screen

#### 6. Error Handling
- [ ] Network errors are handled gracefully
- [ ] Database errors show user-friendly messages
- [ ] Form validation works correctly
- [ ] Loading states are shown during operations

## Performance Monitoring

### Initial Performance Audit
```bash
# Run Lighthouse audit
npm run performance:audit

# Analyze bundle size
npm run build:analyze
```

### Key Metrics to Monitor
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Bundle Size**: Monitor and keep reasonable

## Rollback Plan

If critical issues are discovered:

### Immediate Rollback
```bash
# Rollback to previous deployment
vercel rollback
```

### Database Rollback (if needed)
1. Access Supabase dashboard
2. Use point-in-time recovery
3. Restore to pre-deployment state
4. Verify data integrity

## Monitoring & Maintenance

### Set Up Monitoring
- [ ] Vercel Analytics configured
- [ ] Error monitoring (Sentry) configured (optional)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured

### Regular Maintenance Tasks
- [ ] Monitor application logs
- [ ] Review performance metrics weekly
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Backup database regularly

## Troubleshooting Common Issues

### Build Failures
1. Check TypeScript errors: `npm run type-check`
2. Check linting errors: `npm run lint`
3. Verify all dependencies are installed
4. Check environment variables

### Runtime Errors
1. Check Vercel function logs
2. Verify Supabase connection
3. Check browser console for client errors
4. Verify environment variables are set

### Database Issues
1. Check Supabase logs
2. Verify RLS policies
3. Test database connection
4. Check for schema mismatches

### PWA Issues
1. Verify service worker registration
2. Check manifest.json accessibility
3. Ensure HTTPS is enabled
4. Clear browser cache and test

## Success Criteria

Deployment is considered successful when:
- [ ] All automated checks pass
- [ ] All manual verification items complete
- [ ] Performance metrics meet targets
- [ ] No critical errors in logs
- [ ] User acceptance testing passes

## Contact Information

For deployment issues or questions:
- Development Team: [contact information]
- Vercel Support: [support resources]
- Supabase Support: [support resources]

---

**Last Updated**: [Date]
**Deployment Version**: [Version]
**Deployed By**: [Name]