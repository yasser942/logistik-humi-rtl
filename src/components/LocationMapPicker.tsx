import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
    latitude: number;
    longitude: number;
    name?: string;
}

interface LocationMapPickerProps {
    initialLocation?: Location;
    onLocationSelect: (location: Location) => void;
    onClose: () => void;
    branchLocation?: { latitude: number; longitude: number; name: string };
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (location: Location) => void }) {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            onLocationSelect({
                latitude: lat,
                longitude: lng,
                name: `موقع محدد (${lat.toFixed(6)}, ${lng.toFixed(6)})`
            });
        },
    });
    return null;
}

export default function LocationMapPicker({
    initialLocation,
    onLocationSelect,
    onClose,
    branchLocation
}: LocationMapPickerProps) {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const mapRef = useRef<L.Map | null>(null);

    const defaultCenter: [number, number] = initialLocation
        ? [initialLocation.latitude, initialLocation.longitude]
        : [24.7136, 46.6753]; // Riyadh coordinates

    useEffect(() => {
        if (initialLocation) {
            setSelectedLocation(initialLocation);
        }
    }, [initialLocation]);

    const getCurrentLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        name: 'موقعي الحالي'
                    };
                    setCurrentLocation(location);
                    setSelectedLocation(location);
                    setIsLoadingLocation(false);

                    // Center map on current location
                    if (mapRef.current) {
                        mapRef.current.setView([location.latitude, location.longitude], 15);
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setIsLoadingLocation(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        } else {
            setIsLoadingLocation(false);
        }
    };

    const centerOnBranch = () => {
        if (branchLocation && mapRef.current) {
            mapRef.current.setView([branchLocation.latitude, branchLocation.longitude], 15);
        }
    };

    const handleLocationSelect = (location: Location) => {
        setSelectedLocation(location);
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            onLocationSelect(selectedLocation);
        }
    };

    const handleReset = () => {
        setSelectedLocation(initialLocation || null);
        if (initialLocation && mapRef.current) {
            mapRef.current.setView([initialLocation.latitude, initialLocation.longitude], 15);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">اختر الموقع من الخريطة</h2>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        إغلاق
                    </Button>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative">
                    <MapContainer
                        center={defaultCenter}
                        zoom={13}
                        className="w-full h-full"
                        ref={mapRef}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {/* Branch Location Marker */}
                        {branchLocation && (
                            <Marker
                                position={[branchLocation.latitude, branchLocation.longitude]}
                                icon={L.divIcon({
                                    className: 'custom-div-icon',
                                    html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                                    iconSize: [20, 20],
                                    iconAnchor: [10, 10]
                                })}
                            />
                        )}

                        {/* Current Location Marker */}
                        {currentLocation && (
                            <Marker
                                position={[currentLocation.latitude, currentLocation.longitude]}
                                icon={L.divIcon({
                                    className: 'custom-div-icon',
                                    html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                                    iconSize: [20, 20],
                                    iconAnchor: [10, 10]
                                })}
                            />
                        )}

                        {/* Selected Location Marker */}
                        {selectedLocation && (
                            <Marker
                                position={[selectedLocation.latitude, selectedLocation.longitude]}
                                icon={L.divIcon({
                                    className: 'custom-div-icon',
                                    html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                                    iconSize: [24, 24],
                                    iconAnchor: [12, 12]
                                })}
                            />
                        )}

                        <MapClickHandler onLocationSelect={handleLocationSelect} />
                    </MapContainer>

                    {/* Map Controls */}
                    <div className="absolute top-4 left-4 space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={getCurrentLocation}
                            disabled={isLoadingLocation}
                            className="bg-white shadow-md"
                        >
                            {isLoadingLocation ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                                <Crosshair className="h-4 w-4" />
                            )}
                        </Button>

                        {branchLocation && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={centerOnBranch}
                                className="bg-white shadow-md"
                            >
                                <Navigation className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Location Info Panel */}
                    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md max-w-xs">
                        <h3 className="font-semibold text-gray-900 mb-2">معلومات الموقع</h3>

                        {branchLocation && (
                            <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm font-medium">موقع الفرع</span>
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                    {branchLocation.name}
                                </div>
                            </div>
                        )}

                        {currentLocation && (
                            <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
                                <div className="flex items-center gap-2 text-green-700">
                                    <Crosshair className="h-4 w-4" />
                                    <span className="text-sm font-medium">موقعي الحالي</span>
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                                </div>
                            </div>
                        )}

                        {selectedLocation && (
                            <div className="p-2 bg-red-50 rounded border border-red-200">
                                <div className="flex items-center gap-2 text-red-700">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm font-medium">الموقع المحدد</span>
                                </div>
                                <div className="text-xs text-red-600 mt-1">
                                    {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                                </div>
                                {selectedLocation.name && (
                                    <div className="text-xs text-red-600 mt-1">
                                        {selectedLocation.name}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleReset}>
                            إعادة تعيين
                        </Button>
                        {branchLocation && (
                            <Button variant="outline" onClick={centerOnBranch}>
                                مركز الفرع
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedLocation}
                        >
                            تأكيد الموقع
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
