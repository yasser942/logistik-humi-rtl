# Frontend Setup Guide - Employee Location Tracking

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd logistik-humi-rtl
npm install mapbox-gl @types/mapbox-gl
```

### 2. Get Mapbox Access Token
1. Go to [Mapbox](https://www.mapbox.com/) and create an account
2. Navigate to your account dashboard
3. Copy your access token
4. Update the token in `src/components/EmployeeLocationHeatmap.tsx`:
   ```typescript
   mapboxgl.accessToken = 'YOUR_ACTUAL_MAPBOX_ACCESS_TOKEN';
   ```

### 3. Update API Base URL
Update the API base URL in both components to match your Laravel backend:
```typescript
// In EmployeeLocationHeatmap.tsx and LocationTrackingSettings.tsx
const API_BASE = 'http://your-domain.com/api/hr';
```

### 4. Start Development Server
```bash
npm run dev
```

## 📱 Available Routes

- `/location-tracking` - Main heatmap view
- `/location-settings` - Configuration management

## 🔧 Configuration

### Mapbox Integration
The system uses Mapbox GL for interactive maps. You can customize:

- **Map Style**: Change from street view to satellite, dark theme, etc.
- **Center Coordinates**: Default is Dubai (25.2048, 55.2708)
- **Zoom Level**: Default is 12

### API Endpoints
The frontend expects these Laravel API endpoints:

- `GET /api/hr/location/settings` - Get tracking settings
- `PUT /api/hr/location/settings` - Update tracking settings
- `GET /api/hr/location/active-employees` - Get tracked employees
- `GET /api/hr/location/analytics` - Get tracking analytics
- `GET /api/hr/location/history/{employee_id}` - Get location history

## 🎯 Demo Mode

When the Laravel backend is not available, the system automatically switches to demo mode with:

- Sample employee data
- Sample location history
- Default tracking settings
- Clear indicators that you're in demo mode

## 🚨 Troubleshooting

### Map Not Loading
- Check Mapbox access token
- Verify internet connection
- Check browser console for errors

### API Connection Issues
- Verify Laravel backend is running
- Check API base URL configuration
- Ensure CORS is properly configured
- Check Laravel logs for errors

### Radix UI Select Errors
- Ensure all SelectItem components have non-empty values
- Use "all" instead of empty string for "All Employees" option

## 🔒 Security Notes

- Never commit your Mapbox access token to version control
- Use environment variables for sensitive configuration
- Ensure proper authentication for protected routes

## 📚 Next Steps

1. **Connect Backend**: Start your Laravel server and update API URLs
2. **Test Integration**: Verify location updates and settings management
3. **Customize**: Adjust map styles, colors, and layout as needed
4. **Deploy**: Build and deploy to your production environment

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure your Laravel backend is properly configured
4. Check the [Backend Setup Guide](../cargo/docs/EMPLOYEE_LOCATION_TRACKING_API.md)
