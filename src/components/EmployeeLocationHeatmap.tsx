import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, MapPin, Users, Clock, Activity, Target, Eye, EyeOff } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '../lib/utils';
import { LOCATION_TRACKING_CONFIG, hasValidMapboxToken, shouldUseDemoMode } from '../config/location-tracking';
import { hrLocationAPI } from '../lib/api';

// Types
interface Employee {
    id: number;
    name: string;
    email: string;
    department: string;
    position: string;
    current_location?: {
        latitude: number;
        longitude: number;
        accuracy: number;
        recorded_at: string;
        time_ago: string;
    };
    check_in_time?: string;
}

interface LocationPoint {
    id: number;
    employee_id: number;
    latitude: number;
    longitude: number;
    accuracy: number;
    recorded_at: string;
    time_ago: string;
    employee: {
        name: string;
        department: string;
    };
}

interface LocationSettings {
    location_update_frequency: number;
    min_location_accuracy: number;
    location_tracking_enabled: boolean;
    work_hours_start: string;
    work_hours_end: string;
    location_retention_days: number;
}

interface HeatmapData {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
    properties: {
        intensity: number;
        timestamp: string;
        employee_name: string;
        accuracy: number;
    };
}

interface EmployeeLocationHeatmapProps {
    onDemoModeChange?: (isDemo: boolean) => void;
}

const EmployeeLocationHeatmap: React.FC<EmployeeLocationHeatmapProps> = ({ onDemoModeChange }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const heatmapLayer = useRef<mapboxgl.Layer | null>(null);
    const employeeMarkers = useRef<mapboxgl.Marker[]>([]);

    const [selectedEmployee, setSelectedEmployee] = useState<number | string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [locationHistory, setLocationHistory] = useState<LocationPoint[]>([]);
    const [settings, setSettings] = useState<LocationSettings | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [showMarkers, setShowMarkers] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    // Pagination state for location history
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLocations = locationHistory.slice(startIndex, endIndex);

    // Update total pages when location history changes
    useEffect(() => {
        const total = Math.ceil(locationHistory.length / itemsPerPage);
        setTotalPages(total);
        // Reset to first page if current page is out of bounds
        if (currentPage > total && total > 0) {
            setCurrentPage(1);
        }
    }, [locationHistory.length, itemsPerPage, currentPage]);

    // API Base URL - Update this to match your Laravel backend
    const API_BASE = LOCATION_TRACKING_CONFIG.API.BASE_URL;

    // Initialize Mapbox
    useEffect(() => {
        if (!mapContainer.current) return;

        // Set Mapbox access token from configuration
        mapboxgl.accessToken = LOCATION_TRACKING_CONFIG.MAPBOX.ACCESS_TOKEN;

        // Check if we have a valid Mapbox token
        const hasValidToken = hasValidMapboxToken();

        if (!hasValidToken) {
            // Create a simple div-based map for demo mode
            const demoMap = document.createElement('div');
            demoMap.className = 'w-full h-full bg-gray-100 flex items-center justify-center';
            demoMap.innerHTML = `
                <div class="text-center p-8">
                    <div class="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Demo Map View</h3>
                    <p class="text-gray-600 mb-4">Mapbox integration requires a valid access token</p>
                    <div class="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                        <p><strong>To enable real maps:</strong></p>
                        <p>1. Get a Mapbox access token from <a href="https://www.mapbox.com/" target="_blank" class="underline">mapbox.com</a></p>
                        <p>2. Update the token in EmployeeLocationHeatmap.tsx</p>
                    </div>
                </div>
            `;
            mapContainer.current.appendChild(demoMap);
            return;
        }

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [55.2708, 25.2048], // Dubai coordinates
            zoom: 12,
            attributionControl: false
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        // Add scale control
        map.current.addControl(new mapboxgl.ScaleControl({
            maxWidth: 80,
            unit: 'metric'
        }), 'bottom-left');

        // Cleanup on unmount
        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, []);

    // Load location tracking settings
    const loadSettings = async () => {
        try {
            console.log('Loading settings from:', `${LOCATION_TRACKING_CONFIG.API.BASE_URL}${LOCATION_TRACKING_CONFIG.API.ENDPOINTS.SETTINGS}`);
            const response = await hrLocationAPI.getSettings();
            console.log('Settings response:', response);
            if (response.status === 'success') {
                // Extract settings from the nested response
                const settingsData = response.settings || response.data?.settings || [];
                if (settingsData.length > 0) {
                    // Convert array of settings to object format
                    const settingsObj: LocationSettings = {
                        location_update_frequency: 300,
                        min_location_accuracy: 10,
                        location_tracking_enabled: true,
                        work_hours_start: '09:00',
                        work_hours_end: '17:00',
                        location_retention_days: 90
                    };

                    settingsData.forEach((setting: any) => {
                        if (setting.key && setting.value !== undefined) {
                            (settingsObj as any)[setting.key] = setting.value;
                        }
                    });

                    setSettings(settingsObj);
                    setIsDemoMode(false);
                } else {
                    // Use default settings if no settings found
                    setSettings({
                        location_update_frequency: LOCATION_TRACKING_CONFIG.DEFAULTS.UPDATE_FREQUENCY,
                        min_location_accuracy: LOCATION_TRACKING_CONFIG.DEFAULTS.MIN_ACCURACY,
                        location_tracking_enabled: true,
                        work_hours_start: LOCATION_TRACKING_CONFIG.DEFAULTS.WORK_HOURS_START,
                        work_hours_end: LOCATION_TRACKING_CONFIG.DEFAULTS.WORK_HOURS_END,
                        location_retention_days: LOCATION_TRACKING_CONFIG.DEFAULTS.RETENTION_DAYS
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            // Fallback to demo mode
            setIsDemoMode(false);
            setSettings({
                location_update_frequency: LOCATION_TRACKING_CONFIG.DEFAULTS.UPDATE_FREQUENCY,
                min_location_accuracy: LOCATION_TRACKING_CONFIG.DEFAULTS.MIN_ACCURACY,
                location_tracking_enabled: true,
                work_hours_start: LOCATION_TRACKING_CONFIG.DEFAULTS.WORK_HOURS_START,
                work_hours_end: LOCATION_TRACKING_CONFIG.DEFAULTS.WORK_HOURS_END,
                location_retention_days: LOCATION_TRACKING_CONFIG.DEFAULTS.RETENTION_DAYS
            });
        }
    };

    // Load active employees
    const loadActiveEmployees = async () => {
        try {
            console.log('Loading active employees from:', `${LOCATION_TRACKING_CONFIG.API.BASE_URL}${LOCATION_TRACKING_CONFIG.API.ENDPOINTS.ACTIVE_EMPLOYEES}`);
            const response = await hrLocationAPI.getActiveEmployees();
            console.log('Active employees response:', response);
            if (response.status === 'success') {
                // Extract active_employees from the nested response
                const employeesData = response.active_employees || response.data?.active_employees || [];
                console.log('Extracted employees data:', employeesData);
                console.log('Sample employee structure:', employeesData[0]);

                if (employeesData && Array.isArray(employeesData)) {
                    setEmployees(employeesData);
                    updateEmployeeMarkers(employeesData);
                    setIsDemoMode(false);
                } else {
                    console.warn('No valid employees data found, using demo data');
                    setIsDemoMode(true);
                    setEmployees(LOCATION_TRACKING_CONFIG.DEMO.SAMPLE_EMPLOYEES);
                    updateEmployeeMarkers(LOCATION_TRACKING_CONFIG.DEMO.SAMPLE_EMPLOYEES);
                }
            }
        } catch (error) {
            console.error('Failed to load active employees:', error);
            // Fallback to demo mode
            setIsDemoMode(true);
            setEmployees(LOCATION_TRACKING_CONFIG.DEMO.SAMPLE_EMPLOYEES);
            updateEmployeeMarkers(LOCATION_TRACKING_CONFIG.DEMO.SAMPLE_EMPLOYEES);
        } finally {
            setIsLoading(false);
        }
    };

    // Load location history for selected employee and date
    const loadLocationHistory = useCallback(async () => {
        if (!selectedEmployee) return;

        try {
            let response;
            if (selectedEmployee === 'all') {
                response = await hrLocationAPI.getAnalytics({ date: format(selectedDate, 'yyyy-MM-dd') });
            } else {
                response = await hrLocationAPI.getLocationHistory(selectedEmployee.toString(), { date: format(selectedDate, 'yyyy-MM-dd') });
            }

            if (response.status === 'success') {
                // Extract locations from the nested response
                const locationsData = response.locations || response.data?.locations || [];
                console.log('Extracted locations data:', locationsData);
                console.log('Sample location structure:', locationsData[0]);

                if (locationsData && Array.isArray(locationsData)) {
                    setLocationHistory(locationsData);
                    updateHeatmap(locationsData);
                    setIsDemoMode(false);
                } else {
                    console.warn('No valid locations data found, using demo data');
                    setIsDemoMode(true);
                    setLocationHistory(LOCATION_TRACKING_CONFIG.DEMO.SAMPLE_LOCATIONS);
                    updateHeatmap(LOCATION_TRACKING_CONFIG.DEMO.SAMPLE_LOCATIONS);
                }
            }
        } catch (error) {
            console.error('Failed to load location history:', error);
            // Fallback to demo mode
            setIsDemoMode(true);
            setLocationHistory(LOCATION_TRACKING_CONFIG.DEMO.SAMPLE_LOCATIONS);
            updateHeatmap(LOCATION_TRACKING_CONFIG.DEMO.SAMPLE_LOCATIONS);
        }
    }, [selectedEmployee, selectedDate]);

    // Update employee markers on the map
    const updateEmployeeMarkers = useCallback((employees: Employee[]) => {
        if (!map.current) return;

        // Clear existing markers
        employeeMarkers.current.forEach(marker => marker.remove());
        employeeMarkers.current = [];

        employees.forEach(employee => {
            if (!employee.current_location ||
                !employee.current_location.latitude ||
                !employee.current_location.longitude) {
                console.warn('Employee missing location data:', employee);
                return;
            }

            // Ensure coordinates are numbers
            const lat = Number(employee.current_location.latitude);
            const lng = Number(employee.current_location.longitude);
            const accuracy = Number(employee.current_location.accuracy);

            if (isNaN(lat) || isNaN(lng)) {
                console.warn('Invalid coordinates for employee:', employee);
                return;
            }

            const el = document.createElement('div');
            el.className = 'employee-marker';
            el.innerHTML = `
                <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <span class="text-white text-xs font-bold">${employee.name.charAt(0)}</span>
                </div>
            `;

            const marker = new mapboxgl.Marker(el)
                .setLngLat([lng, lat])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
                            <div class="p-2">
                                <h3 class="font-semibold">${employee.name}</h3>
                                <p class="text-sm text-gray-600">${employee.department || 'N/A'}</p>
                                <p class="text-sm text-gray-500">Accuracy: ${accuracy}m</p>
                                <p class="text-sm text-gray-500">Last Update: ${format(new Date(employee.current_location.recorded_at), 'HH:mm:ss')}</p>
                            </div>
                        `)
                )
                .addTo(map.current);

            employeeMarkers.current.push(marker);
        });
    }, []);

    // Update heatmap with location data
    const updateHeatmap = useCallback((locations: LocationPoint[]) => {
        if (!map.current) return;

        // Remove existing heatmap layer
        if (heatmapLayer.current) {
            map.current.removeLayer('heatmap');
            map.current.removeSource('heatmap');
        }

        if (!locations || locations.length === 0) return;

        // Filter out invalid locations
        const validLocations = locations.filter(location => {
            const lat = Number(location.latitude);
            const lng = Number(location.longitude);
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        });

        if (validLocations.length === 0) {
            console.warn('No valid locations found for heatmap');
            return;
        }

        console.log('Creating heatmap with', validLocations.length, 'valid locations');

        const features = validLocations.map(location => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Point' as const,
                coordinates: [Number(location.longitude), Number(location.latitude)]
            },
            properties: {
                intensity: 1,
                timestamp: location.recorded_at,
                employee_name: location.employee?.name || 'Unknown',
                accuracy: Number(location.accuracy)
            }
        }));

        map.current.addSource('heatmap', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features
            }
        });

        map.current.addLayer({
            id: 'heatmap',
            type: 'heatmap',
            source: 'heatmap',
            paint: {
                'heatmap-weight': [
                    'interpolate',
                    ['linear'],
                    ['get', 'intensity'],
                    0, 0,
                    6, 1
                ],
                'heatmap-intensity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 1,
                    9, 3
                ],
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(0, 0, 255, 0)',
                    0.2, 'rgb(0, 0, 255)',
                    0.4, 'rgb(0, 255, 0)',
                    0.6, 'rgb(255, 255, 0)',
                    0.8, 'rgb(255, 0, 0)',
                    1, 'rgb(255, 0, 0)'
                ],
                'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 2,
                    9, 20
                ],
                'heatmap-opacity': 0.8
            }
        });

        // Fit map to show all locations
        const bounds = new mapboxgl.LngLatBounds();
        validLocations.forEach(location => {
            bounds.extend([Number(location.longitude), Number(location.latitude)]);
        });

        if (!bounds.isEmpty()) {
            map.current.fitBounds(bounds, {
                padding: 50,
                maxZoom: 15
            });
        }
    }, []);

    // Toggle heatmap visibility
    const toggleHeatmap = useCallback(() => {
        setShowHeatmap(!showHeatmap);
        if (map.current && heatmapLayer.current) {
            map.current.setPaintProperty('heatmap-layer', 'heatmap-opacity', showHeatmap ? 0 : 0.8);
        }
    }, [showHeatmap]);

    // Toggle markers visibility
    const toggleMarkers = useCallback(() => {
        setShowMarkers(!showMarkers);
        employeeMarkers.current.forEach(marker => {
            if (showMarkers) {
                marker.remove();
            } else {
                marker.addTo(map.current!);
            }
        });
    }, [showMarkers]);

    // Auto-refresh functionality
    useEffect(() => {
        if (autoRefresh && settings) {
            const interval = setInterval(() => {
                loadActiveEmployees();
                if (selectedEmployee) {
                    loadLocationHistory();
                }
            }, settings.location_update_frequency * 1000);

            setRefreshInterval(interval);

            return () => {
                if (interval) clearInterval(interval);
            };
        } else if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
        }
    }, [autoRefresh, settings, selectedEmployee, selectedDate, loadActiveEmployees, loadLocationHistory]);

    // Load initial data
    useEffect(() => {
        loadSettings();
        loadActiveEmployees();
    }, []);

    // Load location history when employee or date changes
    useEffect(() => {
        if (selectedEmployee) {
            // Reset to first page when employee changes
            setCurrentPage(1);
            loadLocationHistory();
        }
    }, [selectedEmployee, selectedDate, loadLocationHistory]);

    // Fit map to show all data
    const fitMapToData = useCallback(() => {
        if (!map.current || locationHistory.length === 0) return;

        const bounds = new mapboxgl.LngLatBounds();
        locationHistory.forEach(location => {
            bounds.extend([Number(location.longitude), Number(location.latitude)]);
        });

        map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 16
        });
    }, [locationHistory]);

    // Export location data
    const exportData = useCallback(() => {
        if (!locationHistory.length) return;

        const csvData = [
            ['Employee', 'Department', 'Latitude', 'Longitude', 'Accuracy', 'Timestamp', 'Time Ago'],
            ...locationHistory.map(location => [
                location.employee?.name || 'Unknown',
                location.employee?.department || 'N/A',
                Number(location.latitude).toFixed(6),
                Number(location.longitude).toFixed(6),
                Number(location.accuracy),
                location.recorded_at,
                location.time_ago || 'N/A'
            ])
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `location_history_${format(selectedDate, 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [locationHistory, selectedDate]);

    // Notify parent component of demo mode changes
    useEffect(() => {
        if (onDemoModeChange) {
            onDemoModeChange(isDemoMode);
        }
    }, [isDemoMode, onDemoModeChange]);

    return (
        <div className="space-y-6">
            {/* Control Panel */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Employee Selection */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Employee:</label>
                            <Select value={selectedEmployee?.toString() || "all"} onValueChange={(value) => setSelectedEmployee(value === "all" ? null : Number(value))}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Employees</SelectItem>
                                    {employees.map(employee => (
                                        <SelectItem key={employee.id} value={employee.id.toString()}>
                                            {employee.name} - {employee.department}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Selection */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Date:</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-40 justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(selectedDate, 'PPP')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Quick Date Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDate(new Date())}
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDate(subDays(new Date(), 1))}
                            >
                                Yesterday
                            </Button>
                        </div>

                        {/* View Controls */}
                        <div className="flex gap-2">
                            <Button
                                variant={showHeatmap ? "default" : "outline"}
                                size="sm"
                                onClick={toggleHeatmap}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Heatmap
                            </Button>
                            <Button
                                variant={showMarkers ? "default" : "outline"}
                                size="sm"
                                onClick={toggleMarkers}
                            >
                                <Target className="w-4 h-4 mr-2" />
                                Markers
                            </Button>
                        </div>

                        {/* Auto-refresh Toggle */}
                        <Button
                            variant={autoRefresh ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            Auto-refresh
                        </Button>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={fitMapToData}>
                                Fit to Data
                            </Button>
                            <Button variant="outline" size="sm" onClick={exportData}>
                                Export CSV
                            </Button>
                        </div>

                        {/* Demo Mode Indicator */}
                        {isDemoMode && (
                            <Badge variant="secondary" className="ml-auto">
                                Demo Mode
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <div>
                                <p className="text-sm text-gray-600">Active Employees</p>
                                <p className="text-2xl font-bold">{employees.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-600">Location Points</p>
                                <p className="text-2xl font-bold">{locationHistory.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <div>
                                <p className="text-sm text-gray-600">Update Frequency</p>
                                <p className="text-2xl font-bold">
                                    {settings ? `${settings.location_update_frequency}s` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-500" />
                            <div>
                                <p className="text-sm text-gray-600">Min Accuracy</p>
                                <p className="text-2xl font-bold">
                                    {settings ? `${settings.min_location_accuracy}m` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Map Container */}
            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full" style={{ height: '600px' }}>
                        <div ref={mapContainer} className="w-full h-full rounded-lg" />

                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    <span className="text-sm text-gray-600">
                                        Loading locations...
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Map Legend */}
                        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
                            <h4 className="text-sm font-semibold mb-2">Heatmap Legend</h4>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                    <span className="text-xs">Low Activity</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                    <span className="text-xs">Medium Activity</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                    <span className="text-xs">High Activity</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                                    <span className="text-xs">Very High Activity</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Location History Table */}
            {selectedEmployee && locationHistory.length > 0 && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Location History</CardTitle>
                        <CardDescription>
                            Detailed location tracking for {employees.find(e => e.id === selectedEmployee)?.name} on {format(selectedDate, 'PPP')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Time</th>
                                        <th className="text-left p-2">Location</th>
                                        <th className="text-left p-2">Accuracy</th>
                                        <th className="text-left p-2">Time Ago</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLocations.map((location) => (
                                        <tr key={location.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">{format(new Date(location.recorded_at), 'HH:mm:ss')}</td>
                                            <td className="p-2">
                                                <span className="font-mono text-xs">
                                                    {Number(location.latitude).toFixed(6)}, {Number(location.longitude).toFixed(6)}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <Badge variant={Number(location.accuracy) <= 10 ? "default" : "secondary"}>
                                                    {Number(location.accuracy)}m
                                                </Badge>
                                            </td>
                                            <td className="p-2 text-gray-600">{location.time_ago}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">
                                            Showing {startIndex + 1} to {Math.min(endIndex, locationHistory.length)} of {locationHistory.length} locations
                                        </span>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1); // Reset to first page
                                            }}
                                            className="ml-2 px-2 py-1 text-sm border rounded-md bg-white"
                                        >
                                            <option value={5}>5 per page</option>
                                            <option value={10}>10 per page</option>
                                            <option value={20}>20 per page</option>
                                            <option value={50}>50 per page</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                        >
                                            First
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }

                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={currentPage === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Last
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EmployeeLocationHeatmap;
