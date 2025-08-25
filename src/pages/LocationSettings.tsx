import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import LocationTrackingSettings from '@/components/LocationTrackingSettings';

export default function LocationSettings() {
    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">إعدادات التتبع</h1>
                    <p className="text-muted-foreground">
                        تكوين إعدادات تتبع المواقع والتحكم في التحديثات والاحتفاظ بالبيانات
                    </p>
                </div>

                <LocationTrackingSettings />
            </div>
        </AppLayout>
    );
}
