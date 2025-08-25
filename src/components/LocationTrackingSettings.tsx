import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Clock, MapPin, Target, Activity, Shield, Database, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { hrLocationAPI } from '@/lib/api';

interface LocationSetting {
    key: string;
    value: string | number | boolean;
    type: 'string' | 'integer' | 'boolean';
    description: string;
    updated_at: string;
    updated_by: string;
}

interface LocationSettings {
    location_update_frequency: number;
    min_location_accuracy: number;
    location_tracking_enabled: boolean;
    work_hours_start: string;
    work_hours_end: string;
    location_retention_days: number;
}

const LocationTrackingSettings: React.FC = () => {
    const [settings, setSettings] = useState<LocationSetting[]>([]);
    const [formData, setFormData] = useState<Partial<LocationSettings>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // API Base URL - Update this to match your Laravel backend
    const API_BASE = 'http://localhost:8000/api/hr';

    // Helper functions for setting metadata
    const getSettingType = (key: string): string => {
        const typeMap: { [key: string]: string } = {
            location_update_frequency: 'number',
            min_location_accuracy: 'number',
            location_tracking_enabled: 'boolean',
            work_hours_start: 'string',
            work_hours_end: 'string',
            location_retention_days: 'number'
        };
        return typeMap[key] || 'string';
    };

    const getSettingCategory = (key: string): string => {
        const categoryMap: { [key: string]: string } = {
            location_update_frequency: 'tracking',
            min_location_accuracy: 'tracking',
            location_tracking_enabled: 'tracking',
            work_hours_start: 'work_hours',
            work_hours_end: 'work_hours',
            location_retention_days: 'retention'
        };
        return categoryMap[key] || 'general';
    };

    const getSettingDescription = (key: string): string => {
        const descriptionMap: { [key: string]: string } = {
            location_update_frequency: 'Location update frequency in seconds',
            min_location_accuracy: 'Minimum location accuracy in meters',
            location_tracking_enabled: 'Enable location tracking',
            work_hours_start: 'Work hours start time',
            work_hours_end: 'Work hours end time',
            location_retention_days: 'Location data retention in days'
        };
        return descriptionMap[key] || 'Setting configuration';
    };

    // Load settings from API
    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const response = await hrLocationAPI.getSettings();
            if (response.status === 'success') {
                // Extract settings from the nested response
                const settingsData = response.settings || response.data?.settings || [];
                console.log('Settings data:', settingsData);

                if (settingsData.length > 0) {
                    setSettings(settingsData);

                    // Initialize form data
                    const initialFormData: Partial<LocationSettings> = {};
                    settingsData.forEach((setting: LocationSetting) => {
                        initialFormData[setting.key as keyof LocationSettings] = setting.value;
                    });
                    setFormData(initialFormData);
                } else {
                    console.warn('No settings data found');
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            // Set default values if API is not available
            setSettings([
                { key: 'location_update_frequency', value: 300, type: 'number', category: 'tracking', description: 'Location update frequency in seconds' },
                { key: 'min_location_accuracy', value: 10, type: 'number', category: 'tracking', description: 'Minimum location accuracy in meters' },
                { key: 'location_tracking_enabled', value: true, type: 'boolean', category: 'tracking', description: 'Enable location tracking' },
                { key: 'work_hours_start', value: '09:00', type: 'string', category: 'work_hours', description: 'Work hours start time' },
                { key: 'work_hours_end', value: '17:00', type: 'string', category: 'work_hours', description: 'Work hours end time' },
                { key: 'location_retention_days', value: 90, type: 'number', category: 'retention', description: 'Location data retention in days' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Save settings to API
    const saveSettings = async () => {
        try {
            setIsSaving(true);

            // Convert form data back to settings array format
            const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({
                key,
                value,
                type: getSettingType(key),
                category: getSettingCategory(key),
                description: getSettingDescription(key)
            }));

            console.log('Saving settings:', settingsToUpdate);
            const response = await hrLocationAPI.updateSettings({ settings: settingsToUpdate });

            if (response.status === 'success') {
                toast.success('Location tracking settings updated successfully');
                await loadSettings(); // Reload to get updated data
                setHasChanges(false);
            } else {
                toast.error('Failed to update settings');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle form field changes
    const handleFieldChange = (key: string, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
        setHasChanges(true);
    };

    // Validate settings before saving
    const validateSettings = (): string[] => {
        const errors: string[] = [];

        if (formData.location_update_frequency && formData.location_update_frequency < 60) {
            errors.push('Update frequency cannot be less than 60 seconds');
        }

        if (formData.min_location_accuracy && (formData.min_location_accuracy < 1 || formData.min_location_accuracy > 1000)) {
            errors.push('Location accuracy must be between 1 and 1000 meters');
        }

        if (formData.work_hours_start && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.work_hours_start)) {
            errors.push('Work hours start must be in HH:MM format (24-hour)');
        }

        if (formData.work_hours_end && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.work_hours_end)) {
            errors.push('Work hours end must be in HH:MM format (24-hour)');
        }

        if (formData.location_retention_days && (formData.location_retention_days < 1 || formData.location_retention_days > 365)) {
            errors.push('Retention days must be between 1 and 365 days');
        }

        return errors;
    };

    // Handle save with validation
    const handleSave = () => {
        const errors = validateSettings();
        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            return;
        }
        saveSettings();
    };

    // Load settings on component mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Check for changes
    useEffect(() => {
        const hasAnyChanges = Object.keys(formData).length > 0 &&
            settings.some(setting => formData[setting.key as keyof LocationSettings] !== setting.value);
        setHasChanges(hasAnyChanges);
    }, [formData, settings]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Location Tracking Settings</h2>
                    <p className="text-muted-foreground">
                        Configure employee location tracking parameters and policies
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadSettings} disabled={isLoading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tracking Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Tracking Configuration
                        </CardTitle>
                        <CardDescription>
                            Basic tracking settings and frequency
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Global Enable/Disable */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="tracking-enabled">Enable Location Tracking</Label>
                                <p className="text-sm text-muted-foreground">
                                    Master switch for the entire location tracking system
                                </p>
                            </div>
                            <Switch
                                id="tracking-enabled"
                                checked={formData.location_tracking_enabled || false}
                                onCheckedChange={(checked) => handleFieldChange('location_tracking_enabled', checked)}
                            />
                        </div>

                        <Separator />

                        {/* Update Frequency */}
                        <div className="space-y-2">
                            <Label htmlFor="update-frequency">Update Frequency (seconds)</Label>
                            <Input
                                id="update-frequency"
                                type="number"
                                min="60"
                                max="3600"
                                value={formData.location_update_frequency || ''}
                                onChange={(e) => handleFieldChange('location_update_frequency', parseInt(e.target.value) || 0)}
                                placeholder="300"
                            />
                            <p className="text-sm text-muted-foreground">
                                How often to update employee locations (minimum 60 seconds)
                            </p>
                        </div>

                        {/* Location Accuracy */}
                        <div className="space-y-2">
                            <Label htmlFor="min-accuracy">Minimum Location Accuracy (meters)</Label>
                            <Input
                                id="min-accuracy"
                                type="number"
                                min="1"
                                max="1000"
                                value={formData.min_location_accuracy || ''}
                                onChange={(e) => handleFieldChange('min_location_accuracy', parseInt(e.target.value) || 0)}
                                placeholder="10"
                            />
                            <p className="text-sm text-muted-foreground">
                                Minimum required accuracy for location updates (lower is better)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Work Hours Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Work Hours Configuration
                        </CardTitle>
                        <CardDescription>
                            Define when location tracking is active
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Work Hours Start */}
                        <div className="space-y-2">
                            <Label htmlFor="work-start">Work Hours Start</Label>
                            <Input
                                id="work-start"
                                type="time"
                                value={formData.work_hours_start || ''}
                                onChange={(e) => handleFieldChange('work_hours_start', e.target.value)}
                                placeholder="09:00"
                            />
                            <p className="text-sm text-muted-foreground">
                                Start time for location tracking (24-hour format)
                            </p>
                        </div>

                        {/* Work Hours End */}
                        <div className="space-y-2">
                            <Label htmlFor="work-end">Work Hours End</Label>
                            <Input
                                id="work-end"
                                type="time"
                                value={formData.work_hours_end || ''}
                                onChange={(e) => handleFieldChange('work_hours_end', e.target.value)}
                                placeholder="17:00"
                            />
                            <p className="text-sm text-muted-foreground">
                                End time for location tracking (24-hour format)
                            </p>
                        </div>

                        {/* Current Status */}
                        <div className="pt-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Current Status:</span>
                                <Badge variant={formData.location_tracking_enabled ? "default" : "secondary"}>
                                    {formData.location_tracking_enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Location tracking will only be active during configured work hours
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Data Management
                        </CardTitle>
                        <CardDescription>
                            Data retention and storage policies
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Retention Days */}
                        <div className="space-y-2">
                            <Label htmlFor="retention-days">Data Retention (days)</Label>
                            <Input
                                id="retention-days"
                                type="number"
                                min="1"
                                max="365"
                                value={formData.location_retention_days || ''}
                                onChange={(e) => handleFieldChange('location_retention_days', parseInt(e.target.value) || 0)}
                                placeholder="90"
                            />
                            <p className="text-sm text-muted-foreground">
                                How long to keep location data before automatic deletion
                            </p>
                        </div>

                        {/* Data Cleanup Info */}
                        <div className="pt-2">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Old location data is automatically cleaned up based on the retention policy.
                                    You can also manually run cleanup using the command: <code className="bg-blue-100 px-1 rounded">php artisan hr:cleanup-locations</code>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy & Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Privacy & Security
                        </CardTitle>
                        <CardDescription>
                            Privacy controls and security measures
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium">Work Hours Only</p>
                                    <p className="text-xs text-muted-foreground">
                                        Location tracking is automatically disabled outside work hours
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium">Automatic Cleanup</p>
                                    <p className="text-xs text-muted-foreground">
                                        Old location data is automatically removed based on retention policy
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium">Role-Based Access</p>
                                    <p className="text-xs text-muted-foreground">
                                        Only authorized HR personnel can access location data
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium">Audit Logging</p>
                                    <p className="text-xs text-muted-foreground">
                                        All access to location data is logged for security
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Current Settings Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Settings Summary</CardTitle>
                    <CardDescription>
                        Overview of all current location tracking configuration
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {settings.map((setting) => (
                            <div key={setting.key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium capitalize">
                                        {setting.key.replace(/_/g, ' ')}
                                    </span>
                                    <Badge variant="outline">
                                        {setting.type}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {setting.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Value: <strong>{String(setting.value)}</strong></span>
                                    <span>Updated: {new Date(setting.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LocationTrackingSettings;
