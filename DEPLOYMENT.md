# Super Unipole System - Deployment Guide

This guide will help you deploy the Super Unipole System to Netlify's free tier with HTTPS compatibility.

## Prerequisites

1. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket
2. **Supabase Account**: Create a free Supabase project
3. **Netlify Account**: Sign up for a free Netlify account

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `super-unipole-system`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

### 1.2 Set Up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database/schema.sql`
3. Click "Run" to execute the SQL

### 1.3 Get Database Credentials

1. Go to Settings > API
2. Copy the following values:
   - Project URL
   - Project API Key (anon/public)

## Step 2: Netlify Deployment

### 2.1 Connect Repository

1. Go to [netlify.com](https://netlify.com) and login
2. Click "New site from Git"
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: `18`

### 2.2 Environment Variables

In Netlify dashboard, go to Site settings > Environment variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
NEXT_PUBLIC_APP_NAME=Super Unipole System
NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT=30.0444
NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG=31.2357
NEXT_PUBLIC_DEFAULT_MAP_ZOOM=10
NEXT_PUBLIC_EXPORT_BASE_URL=https://your-site-name.netlify.app/campaign
```

### 2.3 Deploy

1. Click "Deploy site"
2. Wait for the build to complete
3. Your site will be available at `https://your-site-name.netlify.app`

## Step 3: Custom Domain (Optional)

### 3.1 Add Custom Domain

1. In Netlify dashboard, go to Site settings > Domain management
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions

### 3.2 SSL Certificate

- Netlify automatically provides free SSL certificates
- HTTPS will be enabled automatically
- Certificate auto-renews

## Step 4: Testing

### 4.1 Basic Functionality Test

1. **Homepage**: Verify the homepage loads correctly
2. **Navigation**: Test all navigation links
3. **Location Management**:
   - Add a new unit manually
   - Import sample Excel file
   - Edit and delete units
   - Export units to Excel
4. **Campaign Builder**:
   - Select units
   - Create a campaign
   - View campaign map
   - Export campaign map
5. **Settings**:
   - Update map settings
   - Change user preferences
   - Export data

### 4.2 Cross-Device Testing

Test on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile devices (iOS Safari, Android Chrome)
- Tablets

### 4.3 HTTPS Verification

1. Check that all resources load over HTTPS
2. Verify no mixed content warnings
3. Test map functionality over HTTPS
4. Confirm SSL certificate is valid

## Step 5: Sample Data Import

### 5.1 Import Sample Units

1. Go to Location Management
2. Click "Import Excel"
3. Upload `sample-data/sample-units.csv`
4. Verify all 20 units are imported correctly

### 5.2 Create Sample Campaign

1. Go to Campaign Builder
2. Select 5-10 units from different governorates
3. Create a campaign named "Sample Campaign"
4. Export the campaign map
5. Test the exported map URL

## Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check Node.js version (should be 18+)
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

2. **Database Connection Issues**:
   - Verify Supabase URL and API key
   - Check if RLS policies are set correctly
   - Ensure database schema is created

3. **Map Not Loading**:
   - Check HTTPS compatibility
   - Verify Leaflet CSS is loading
   - Check browser console for errors

4. **Excel Import Fails**:
   - Verify file format (CSV or XLSX)
   - Check column headers match exactly
   - Ensure coordinates are in correct format

### Performance Optimization

1. **Image Optimization**:
   - Use WebP format for images
   - Implement lazy loading

2. **Caching**:
   - Netlify automatically handles static file caching
   - Database queries are cached by Supabase

3. **Bundle Size**:
   - Use dynamic imports for large components
   - Tree-shake unused dependencies

## Monitoring and Maintenance

### 1. Analytics

Set up Netlify Analytics (optional paid feature) or use:
- Google Analytics
- Plausible Analytics (privacy-focused)

### 2. Error Monitoring

Consider adding:
- Sentry for error tracking
- LogRocket for session replay

### 3. Backups

- Supabase automatically backs up your database
- Export data regularly using the Settings page
- Keep your Git repository updated

### 4. Updates

- Monitor dependencies for security updates
- Test updates in a staging environment
- Use Netlify's branch deploys for testing

## Security Considerations

1. **Database Security**:
   - RLS policies are enabled
   - API keys are properly scoped
   - No sensitive data in client-side code

2. **HTTPS**:
   - All traffic is encrypted
   - Secure headers are configured
   - CSP headers prevent XSS

3. **Data Privacy**:
   - No personal data is collected
   - Location data is business-related only
   - GDPR compliance considerations

## Cost Monitoring

### Free Tier Limits

**Netlify Free Tier**:
- 100GB bandwidth/month
- 300 build minutes/month
- 1 concurrent build

**Supabase Free Tier**:
- 500MB database storage
- 1GB file storage
- 2GB bandwidth/month

### Scaling Options

When you exceed free limits:
- Netlify Pro: $19/month
- Supabase Pro: $25/month

## Support

For issues:
1. Check this deployment guide
2. Review error logs in Netlify dashboard
3. Check Supabase logs
4. Create an issue in the GitHub repository

## Success Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Netlify site deployed successfully
- [ ] Environment variables configured
- [ ] HTTPS enabled and working
- [ ] Sample data imported
- [ ] All CRUD operations tested
- [ ] Maps loading correctly
- [ ] Excel import/export working
- [ ] Campaign creation and export working
- [ ] Cross-device compatibility verified
- [ ] Performance optimized
- [ ] Monitoring set up (optional)

Your Super Unipole System is now live and ready to use! 🎉
