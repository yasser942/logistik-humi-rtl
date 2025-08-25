// Location Tracking Configuration
// Update these values to match your setup

export const LOCATION_TRACKING_CONFIG = {
    // Mapbox Configuration
    MAPBOX: {
        ACCESS_TOKEN: 'pk.eyJ1IjoieWFzc2VyOTQyIiwiYSI6ImNtYjF1NHRhejBieWgydnEyZDgwamZlb3QifQ.kgtGWHmaXm70gRn_z8hXMw', // Get from https://www.mapbox.com/
        MAP_STYLE: 'mapbox://styles/mapbox/streets-v12',
        CENTER: {
            LAT: 25.2048, // Dubai coordinates
            LNG: 55.2708
        },
        ZOOM: 12
    },

    // API Configuration
    API: {
        BASE_URL: 'http://192.168.1.109:8000/api', // Update to match your Laravel backend
        ENDPOINTS: {
            SETTINGS: '/hr/location/settings',
            ACTIVE_EMPLOYEES: '/hr/location/active-employees',
            ANALYTICS: '/hr/location/analytics',
            HISTORY: '/hr/location/history',
            UPDATE: '/hr/location/update'
        }
    },

    // Demo Mode Configuration
    DEMO: {
        ENABLED: false, // Set to false when backend is connected and working
        SAMPLE_EMPLOYEES: [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                department: 'IT',
                position: 'Developer',
                current_location: {
                    latitude: 25.2048,
                    longitude: 55.2708,
                    accuracy: 5,
                    recorded_at: new Date().toISOString(),
                    time_ago: '2 minutes ago'
                }
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                department: 'HR',
                position: 'Manager',
                current_location: {
                    latitude: 25.2050,
                    longitude: 55.2710,
                    accuracy: 8,
                    recorded_at: new Date().toISOString(),
                    time_ago: '1 minute ago'
                }
            }
        ],
        SAMPLE_LOCATIONS: [
            {
                id: 1,
                employee_id: 1,
                latitude: 25.2048,
                longitude: 55.2708,
                accuracy: 5,
                recorded_at: new Date().toISOString(),
                time_ago: '2 minutes ago',
                employee: { name: 'John Doe', department: 'IT' }
            },
            {
                id: 2,
                employee_id: 1,
                latitude: 25.2049,
                longitude: 55.2709,
                accuracy: 6,
                recorded_at: new Date(Date.now() - 300000).toISOString(),
                time_ago: '5 minutes ago',
                employee: { name: 'John Doe', department: 'IT' }
            },
            {
                id: 3,
                employee_id: 2,
                latitude: 25.2050,
                longitude: 55.2710,
                accuracy: 8,
                recorded_at: new Date().toISOString(),
                time_ago: '1 minute ago',
                employee: { name: 'Jane Smith', department: 'HR' }
            }
        ]
    },

    // Default Settings
    DEFAULTS: {
        UPDATE_FREQUENCY: 300, // 5 minutes in seconds
        MIN_ACCURACY: 10, // meters
        WORK_HOURS_START: '09:00',
        WORK_HOURS_END: '17:00',
        RETENTION_DAYS: 90
    }
};

// Helper function to check if we have a valid Mapbox token
export const hasValidMapboxToken = (): boolean => {
    return LOCATION_TRACKING_CONFIG.MAPBOX.ACCESS_TOKEN !== 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';
};

// Helper function to check if we should use demo mode
export const shouldUseDemoMode = (): boolean => {
    return LOCATION_TRACKING_CONFIG.DEMO.ENABLED || !hasValidMapboxToken();
};
