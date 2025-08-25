# Employee Location Tracking System Setup Guide

## Overview
This guide will help you set up the Employee Location Tracking system in your React HR dashboard. The system provides real-time location monitoring with interactive heatmaps, configurable tracking parameters, and comprehensive analytics.

## 🚀 Quick Start

### 1. Backend Setup (Laravel)
The backend system has already been implemented with:
- Database migrations for location tracking
- API endpoints for location updates and management
- Models for employee locations and settings
- Automatic cleanup commands

### 2. Frontend Setup (React)

#### Install Dependencies
```bash
cd logistik-humi-rtl
npm install mapbox-gl @types/mapbox-gl
```

#### Get Mapbox Access Token
1. Go to [Mapbox](https://www.mapbox.com/) and create an account
2. Navigate to your account dashboard
3. Copy your access token
4. Update the token in `src/components/EmployeeLocationHeatmap.tsx`:
   ```typescript
   mapboxgl.accessToken = 'YOUR_ACTUAL_MAPBOX_ACCESS_TOKEN';
   ```

#### Update API Base URL
Update the API base URL in both components to match your Laravel backend:
```typescript
// In EmployeeLocationHeatmap.tsx and LocationTrackingSettings.tsx
const API_BASE = 'http://your-domain.com/api/hr';
```

## 📱 Features

### Real-time Location Tracking
- **Automatic Start/Stop**: Tracking begins with check-in and stops with check-out
- **Configurable Frequency**: Update intervals from 60 seconds to 1 hour
- **High Accuracy**: GPS-based positioning with configurable accuracy requirements
- **Work Hours Only**: Tracking only active during configured work hours

### Interactive Heatmap
- **Visual Patterns**: See employee movement patterns and hotspots
- **Real-time Updates**: Live updates as employees move
- **Zoom & Pan**: Interactive map controls for detailed analysis
- **Legend**: Color-coded activity levels (blue=low, red=high)

### HR Dashboard Management
- **Settings Configuration**: Dynamic update frequency, accuracy requirements
- **Work Hours**: Configurable start/end times for tracking
- **Data Retention**: Automatic cleanup policies (1-365 days)
- **Privacy Controls**: Role-based access and audit logging

### Analytics & Export
- **Location History**: Detailed tracking for individual employees
- **Statistics**: Active employees, location points, update frequency
- **CSV Export**: Download location data for external analysis
- **Performance Metrics**: Tracking accuracy and coverage statistics

## 🔧 Configuration

### Location Tracking Settings

#### Update Frequency
- **Minimum**: 60 seconds (1 minute)
- **Default**: 300 seconds (5 minutes)
- **Maximum**: 3600 seconds (1 hour)

#### Location Accuracy
- **Range**: 1-1000 meters
- **Default**: 10 meters
- **Best Practice**: Lower values provide better accuracy

#### Work Hours
- **Format**: 24-hour (HH:MM)
- **Default**: 09:00 - 17:00
- **Note**: Tracking only active during these hours

#### Data Retention
- **Range**: 1-365 days
- **Default**: 90 days
- **Auto-cleanup**: Old data automatically removed

## 📊 API Endpoints

### Mobile App (Public)
- `POST /api/hr/location/update` - Update employee location
- `GET /api/hr/location/current/{employee_id}` - Get current location
- `GET /api/hr/location/history/{employee_id}` - Get location history

### HR Dashboard (Protected)
- `GET /api/hr/location/settings` - Get tracking settings
- `PUT /api/hr/location/settings` - Update tracking settings
- `GET /api/hr/location/active-employees` - Get tracked employees
- `GET /api/hr/location/analytics` - Get tracking analytics
- `POST /api/hr/location/start-tracking` - Start tracking manually
- `POST /api/hr/location/stop-tracking` - Stop tracking manually

## 🗺️ Mapbox Integration

### Map Styles
The system uses Mapbox's street style by default. You can customize this by changing:
```typescript
style: 'mapbox://styles/mapbox/streets-v12'
```

### Available Styles
- `mapbox://styles/mapbox/streets-v12` - Street view (default)
- `mapbox://styles/mapbox/outdoors-v12` - Outdoor/terrain
- `mapbox://styles/mapbox/light-v11` - Light theme
- `mapbox://styles/mapbox/dark-v11` - Dark theme
- `mapbox://styles/mapbox/satellite-v9` - Satellite imagery

### Custom Styling
You can create custom Mapbox styles at [Mapbox Studio](https://studio.mapbox.com/) and use your custom style URL.

## 🔒 Security & Privacy

### Data Protection
- **Encryption**: Location data encrypted at rest
- **Access Control**: Role-based permissions required
- **Audit Logging**: All access logged for security
- **Work Hours Only**: No tracking outside business hours

### Privacy Controls
- **Employee Consent**: Configurable consent management
- **Data Retention**: Automatic cleanup of old data
- **Right to be Forgotten**: Support for data deletion requests
- **GDPR Compliance**: Built-in privacy controls

## 🧹 Maintenance

### Automated Cleanup
The system automatically removes old location data based on retention settings.

### Manual Cleanup
You can manually clean up old data using the Laravel command:
```bash
# Use configured retention days
php artisan hr:cleanup-locations

# Override retention days
php artisan hr:cleanup-locations --days=30
```

### Performance Optimization
- **Database Indexes**: Optimized for location queries
- **Caching**: Settings and analytics cached for performance
- **Pagination**: Large datasets handled efficiently
- **Background Processing**: Heavy operations run asynchronously

## 📱 Mobile App Integration

### Required Permissions
- **Location Access**: Always or While Using App
- **Background App Refresh**: For continuous tracking
- **Network Access**: For API communication

### Best Practices
- **GPS Priority**: Use GPS for highest accuracy
- **Battery Optimization**: Implement power-saving features
- **Error Handling**: Graceful fallback for location failures
- **User Feedback**: Clear indication of tracking status

## 🚨 Troubleshooting

### Common Issues

#### Map Not Loading
- Check Mapbox access token
- Verify internet connection
- Check browser console for errors

#### Location Updates Not Working
- Verify backend API is running
- Check API base URL configuration
- Ensure employee is checked in
- Verify work hours configuration

#### Heatmap Not Displaying
- Check if location data exists
- Verify heatmap layer is enabled
- Check browser console for errors

#### Settings Not Saving
- Verify API permissions
- Check network connectivity
- Validate input values
- Check browser console for errors

### Debug Mode
Enable debug logging in the browser console to troubleshoot issues:
```typescript
// Add to components for debugging
console.log('API Response:', response.data);
console.log('Location Data:', locations);
```

## 📈 Performance Monitoring

### Key Metrics
- **Update Frequency**: How often locations are updated
- **Accuracy**: Location precision in meters
- **Coverage**: Percentage of work hours tracked
- **Response Time**: API response latency

### Optimization Tips
- **Batch Updates**: Group multiple location updates
- **Compression**: Use gzip for API responses
- **Caching**: Cache frequently accessed data
- **CDN**: Use CDN for static assets

## 🔮 Future Enhancements

### Planned Features
- **Geofencing**: Alert when employees leave designated areas
- **Route Optimization**: Suggest optimal travel paths
- **Integration**: Connect with other HR systems
- **Advanced Analytics**: Machine learning insights
- **Mobile Dashboard**: Native mobile app for HR

### Customization Options
- **Custom Maps**: Company-specific map overlays
- **Branding**: Custom colors and styling
- **Workflows**: Automated actions based on location
- **Reports**: Custom reporting and dashboards

## 📞 Support

### Documentation
- [API Documentation](./EMPLOYEE_LOCATION_TRACKING_API.md)
- [Laravel Backend Guide](../cargo/docs/EMPLOYEE_LOCATION_TRACKING_API.md)

### Technical Support
For technical issues or questions:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify API endpoints are working
4. Check Laravel logs for backend errors

### Feature Requests
To request new features or improvements:
1. Document the use case
2. Provide examples of similar implementations
3. Consider impact on privacy and security
4. Submit through your development team

---

## 🎯 Quick Checklist

- [ ] Install Mapbox GL dependencies
- [ ] Get Mapbox access token
- [ ] Update API base URL
- [ ] Test location tracking endpoints
- [ ] Configure tracking settings
- [ ] Test heatmap visualization
- [ ] Verify mobile app integration
- [ ] Set up automated cleanup
- [ ] Train HR staff on usage
- [ ] Monitor system performance

---

**Note**: This system is designed with privacy and security in mind. Always ensure compliance with local data protection laws and company policies when implementing employee location tracking.
