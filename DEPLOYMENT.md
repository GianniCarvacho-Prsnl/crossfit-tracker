# Deployment Guide - CrossFit Tracker

This guide covers the complete deployment process for the CrossFit Tracker application to Vercel.

## Quick Start

For experienced developers, use the deployment checklist:
```bash
# Quick deployment check
npm run deploy:check

# Deploy to production
npm run deploy:vercel

# Verify deployment
PRODUCTION_URL=https://your-app.vercel.app npm run verify:production
```

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed verification steps.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Vercel account
- Supabase project (production instance)
- Git repository

## Environment Setup

### 1. Production Environment Variables

Create a `.env.production.local` file (not committed to git) with your production values:

```bash
# Supabase Configuration (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_ACCESS_TOKEN=your_production_access_token

# Next.js Configuration
NODE_ENV=production
```

### 2. Vercel Environment Variables

In your Vercel dashboard, add these environment variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview |
| `SUPABASE_ACCESS_TOKEN` | Your personal access token | Production, Preview |
| `NODE_ENV` | `production` | Production |

## Deployment Methods

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Preview**
   ```bash
   npm run deploy:preview
   ```

4. **Deploy to Production**
   ```bash
   npm run deploy:vercel
   ```

### Method 2: Git Integration

1. **Connect Repository**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your Git repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

3. **Set Environment Variables**
   - Add all required environment variables in Vercel dashboard

4. **Deploy**
   - Push to main branch for automatic deployment

### Method 3: GitHub Actions (CI/CD)

The project includes a GitHub Actions workflow for automated deployment.

1. **Set GitHub Secrets**
   ```
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_org_id
   VERCEL_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Workflow Triggers**
   - Push to main/master: Production deployment
   - Pull requests: Preview deployment

## Pre-Deployment Checklist

Run the deployment check script:

```bash
npm run deploy:check
```

This will:
- ✅ Run TypeScript type checking
- ✅ Run ESLint for code quality
- ✅ Execute unit tests
- ✅ Build the application

## Post-Deployment Verification

### Automated Verification

Run the production verification script:

```bash
PRODUCTION_URL=https://your-app.vercel.app npm run verify:production
```

### Manual Verification Checklist

- [ ] **Authentication Flow**
  - [ ] User registration works
  - [ ] Email confirmation works
  - [ ] Login/logout functionality
  - [ ] Protected routes redirect correctly

- [ ] **Core Functionality**
  - [ ] Workout registration form works
  - [ ] All 5 exercises are available
  - [ ] 1RM calculations are accurate
  - [ ] Unit conversions work (lbs/kg)
  - [ ] Records are saved to database

- [ ] **Data Display**
  - [ ] Records list displays correctly
  - [ ] Filtering by exercise works
  - [ ] Sorting by date/weight works
  - [ ] Both calculated and direct 1RM indicators show

- [ ] **Mobile Experience**
  - [ ] Responsive design works on mobile
  - [ ] Touch interactions are smooth
  - [ ] PWA can be installed
  - [ ] App works offline (cached content)

- [ ] **Performance**
  - [ ] Page load times are acceptable
  - [ ] Images are optimized
  - [ ] Bundle size is reasonable

## Database Setup

Ensure your production Supabase instance has:

1. **Tables Created**
   ```sql
   -- Run migrations in production
   -- exercises table with 5 exercises
   -- workout_records table with proper schema
   ```

2. **Row Level Security (RLS) Enabled**
   ```sql
   -- Verify RLS policies are active
   -- Users can only access their own data
   ```

3. **Indexes for Performance**
   ```sql
   -- Verify indexes on user_id, exercise_id, created_at
   ```

## Monitoring and Maintenance

### Performance Monitoring

- **Vercel Analytics**: Monitor Core Web Vitals
- **Bundle Analysis**: Run `npm run build:analyze` to check bundle size
- **Lighthouse Audits**: Run `npm run performance:audit` for performance metrics

### Error Monitoring

Consider adding error monitoring services:
- Sentry for error tracking
- Vercel Analytics for performance monitoring
- Supabase logs for database issues

### Regular Maintenance

- **Dependencies**: Update packages regularly
- **Security**: Monitor for security vulnerabilities
- **Performance**: Regular performance audits
- **Backups**: Ensure Supabase backups are configured

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Check linting errors: `npm run lint`
   - Verify environment variables are set

2. **Runtime Errors**
   - Check Vercel function logs
   - Verify Supabase connection
   - Check browser console for client-side errors

3. **PWA Issues**
   - Verify service worker is loading
   - Check manifest.json is accessible
   - Ensure HTTPS is enabled

4. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Verify network connectivity

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

## Rollback Procedure

If issues occur in production:

1. **Immediate Rollback**
   ```bash
   vercel rollback
   ```

2. **Fix and Redeploy**
   - Fix issues in development
   - Test thoroughly
   - Deploy again

3. **Database Rollback** (if needed)
   - Use Supabase point-in-time recovery
   - Restore from backup if necessary

## Security Considerations

- ✅ Environment variables are properly secured
- ✅ HTTPS is enforced
- ✅ Security headers are configured
- ✅ RLS policies protect user data
- ✅ No sensitive data in client-side code
- ✅ Regular security updates

---

For additional support or questions about deployment, refer to the project documentation or contact the development team.