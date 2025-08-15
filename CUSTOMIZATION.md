# Super Unipole System - Customization Guide

This guide will help you customize the branding and add your own data to the Super Unipole System.

## 🎨 Branding Customization

### 1. Change Application Name
Update the environment variable in Netlify:
```
NEXT_PUBLIC_APP_NAME=Your Company Name
```

### 2. Update Colors (Primary Brand Color)
Edit `tailwind.config.js` to change the primary color:

```javascript
colors: {
  primary: {
    50: '#eff6ff',   // Very light blue
    100: '#dbeafe',  // Light blue
    200: '#bfdbfe',  // Lighter blue
    300: '#93c5fd',  // Light blue
    400: '#60a5fa',  // Medium light blue
    500: '#3b82f6',  // Main brand color (change this)
    600: '#2563eb',  // Darker blue
    700: '#1d4ed8',  // Dark blue
    800: '#1e40af',  // Very dark blue
    900: '#1e3a8a',  // Darkest blue
  }
}
```

**Popular color options:**
- **Green**: `#10b981` (Emerald)
- **Purple**: `#8b5cf6` (Violet)
- **Red**: `#ef4444` (Red)
- **Orange**: `#f97316` (Orange)
- **Teal**: `#14b8a6` (Teal)

### 3. Add Your Logo
1. Add your logo file to `public/logo.png`
2. Update the navigation component:

```typescript
// In src/components/Layout/Navigation.tsx
<div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
  <img src="/logo.png" alt="Logo" className="w-6 h-6" />
</div>
```

### 4. Update Favicon
Replace `public/favicon.ico` with your company favicon.

### 5. Customize Default Map Location
Update environment variables for your region:
```
NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT=your_latitude
NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG=your_longitude
NEXT_PUBLIC_DEFAULT_MAP_ZOOM=your_preferred_zoom
```

## 📊 Adding Your Own Units

### Method 1: Excel Import (Recommended)
1. Create an Excel file with these exact column headers:
   - `Unit ID` - Unique identifier (e.g., "UNI001")
   - `Location` - Location name (e.g., "Downtown Office")
   - `Governorate` - Region/State/Province
   - `Latitude,Longitude` - Coordinates in format "30.0444,31.2357"

2. Example Excel content:
```
Unit ID,Location,Governorate,Latitude,Longitude
UNI001,Times Square Billboard,New York,40.7580,-73.9855
UNI002,Hollywood Sign Area,California,34.1341,-118.3215
UNI003,Navy Pier Display,Illinois,41.8919,-87.6051
```

3. Import via Location > Import Excel

### Method 2: Manual Entry
1. Go to Location Management
2. Click "Add Unit"
3. Fill in the form:
   - **Unit ID**: Unique identifier
   - **Location**: Descriptive name
   - **Governorate**: Region/area
   - **Coordinates**: Get from Google Maps (right-click > coordinates)

### Method 3: Database Direct Import
For large datasets, you can import directly to Supabase:

1. Go to your Supabase dashboard
2. Navigate to Table Editor > units
3. Click "Insert" > "Insert row"
4. Or use the SQL editor for bulk inserts:

```sql
INSERT INTO units (unit_id, location, governorate, lat_lng) VALUES
('UNI001', 'Your Location 1', 'Your Region', '40.7580,-73.9855'),
('UNI002', 'Your Location 2', 'Your Region', '34.1341,-118.3215');
```

## 🗺️ Getting Coordinates

### Method 1: Google Maps
1. Go to [Google Maps](https://maps.google.com)
2. Right-click on your location
3. Click the coordinates that appear
4. Copy in format: "latitude,longitude"

### Method 2: GPS Coordinates Apps
- Use your phone's GPS apps
- Many apps show coordinates in decimal format

### Method 3: Online Tools
- [LatLong.net](https://www.latlong.net/)
- [GPS Coordinates](https://gps-coordinates.org/)

## 🏢 Industry-Specific Customizations

### For Outdoor Advertising
```javascript
// Update terminology in components
const terminology = {
  units: 'Billboards',
  campaigns: 'Ad Campaigns',
  locations: 'Billboard Sites'
}
```

### For Real Estate
```javascript
const terminology = {
  units: 'Properties',
  campaigns: 'Listings',
  locations: 'Property Sites'
}
```

### For Retail Chains
```javascript
const terminology = {
  units: 'Stores',
  campaigns: 'Promotions',
  locations: 'Store Locations'
}
```

## 🎯 Advanced Customizations

### 1. Add Custom Fields
To add custom fields to units, update the database schema:

```sql
-- Add custom columns to units table
ALTER TABLE units ADD COLUMN price DECIMAL;
ALTER TABLE units ADD COLUMN size TEXT;
ALTER TABLE units ADD COLUMN availability BOOLEAN DEFAULT true;
```

Then update the TypeScript types and forms accordingly.

### 2. Custom Map Markers
Create custom marker icons:

```typescript
// In MapComponent.tsx
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="custom-pin">
           <img src="/custom-marker.png" alt="marker" />
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});
```

### 3. Add Authentication
For production use, consider adding authentication:

1. Enable Supabase Auth
2. Update RLS policies
3. Add login/logout components

### 4. Custom Domains
1. In Netlify: Site settings > Domain management
2. Add your custom domain
3. Update environment variables with new domain

## 📱 Mobile App Considerations

The system is already mobile-responsive, but for native apps:

### Progressive Web App (PWA)
Add PWA capabilities:

1. Create `public/manifest.json`
2. Add service worker
3. Enable offline functionality

### React Native Version
The components can be adapted for React Native:
- Replace Leaflet with react-native-maps
- Adapt UI components for native

## 🔧 Development Workflow

### Local Development
```bash
# Clone your repository
git clone https://github.com/yourusername/super-unipole-system.git
cd super-unipole-system

# Install dependencies
npm install

# Create .env.local with your variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Making Changes
1. Make your customizations locally
2. Test thoroughly
3. Commit and push to GitHub
4. Netlify will automatically redeploy

### Staging Environment
Create a staging branch for testing:
```bash
git checkout -b staging
# Make changes
git push origin staging
```

Then create a separate Netlify site for staging.

## 📊 Analytics and Monitoring

### Add Google Analytics
1. Get GA tracking ID
2. Add to environment variables
3. Install analytics package

### Monitor Performance
- Use Netlify Analytics
- Monitor Supabase usage
- Set up error tracking with Sentry

## 🚀 Scaling Considerations

### When to Upgrade
- **Netlify Pro** ($19/month): More bandwidth, build minutes
- **Supabase Pro** ($25/month): More database storage, better performance

### Performance Optimization
- Implement image optimization
- Add caching strategies
- Use CDN for static assets

## 📞 Support and Maintenance

### Regular Maintenance
- Update dependencies monthly
- Monitor security advisories
- Backup data regularly
- Test functionality after updates

### Getting Help
- Check GitHub issues
- Supabase documentation
- Netlify support docs
- Community forums

This customization guide should help you make the Super Unipole System truly yours! 🎉
