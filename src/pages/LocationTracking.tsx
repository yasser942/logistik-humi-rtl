import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import EmployeeLocationHeatmap from '@/components/EmployeeLocationHeatmap';

export default function LocationTracking() {
    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">تتبع المواقع</h1>
                    <p className="text-muted-foreground">
                        مراقبة مواقع الموظفين في الوقت الفعلي وعرض أنماط الحركة
                    </p>
                </div>

                <EmployeeLocationHeatmap />
            </div>
        </AppLayout>
    );
}
