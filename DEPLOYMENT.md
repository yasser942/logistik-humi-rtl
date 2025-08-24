# Vercel Deployment Guide

## Overview
This React application uses client-side routing with React Router. The `vercel.json` configuration ensures that all routes are properly handled by redirecting to `index.html`.

## Files Added for Vercel Deployment

### 1. `vercel.json`
- **Rewrites**: Redirects all routes to `index.html` for client-side routing
- **Headers**: Configures caching for static assets and prevents caching for HTML files

### 2. `.vercelignore`
- Excludes unnecessary files from deployment
- Optimizes build size and deployment speed

### 3. Updated `vite.config.ts`
- Added build optimization for production
- Configured chunk splitting for better performance

## Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   ```

3. **Verify deployment**:
   - Check that all routes work (e.g., `/employees`, `/attendance`)
   - Ensure no 404 errors on direct URL access

## Troubleshooting 404 Errors

### Common Causes:
1. **Missing `vercel.json`**: The rewrite rules are essential for SPA routing
2. **Build issues**: Ensure the build completes successfully
3. **Cache issues**: Clear Vercel cache if needed

### Solutions:
1. **Verify `vercel.json` exists** and contains proper rewrite rules
2. **Check build output** in Vercel dashboard
3. **Redeploy** if configuration changes were made
4. **Clear cache** in Vercel dashboard if needed

## Route Configuration

The application includes these main routes:
- `/` - Dashboard (protected)
- `/login` - Authentication
- `/employees` - Employee management
- `/attendance` - Attendance tracking
- `/departments` - Department management
- `/positions` - Position management
- `/shifts` - Shift scheduling (placeholder)
- `/payroll` - Payroll (placeholder)
- `/reports` - Reports (placeholder)

All routes are protected except `/login`, and the catch-all route (`*`) shows a 404 page.

## Performance Optimization

- **Chunk splitting**: Vendor, router, and UI components are split into separate chunks
- **Asset caching**: Static assets are cached for 1 year
- **HTML caching**: HTML files are not cached to ensure fresh content

## Monitoring

After deployment, monitor:
- Build success/failure in Vercel dashboard
- Route accessibility (test direct URL access)
- Performance metrics
- Error logs for any remaining issues
