import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, Database, Wifi, Code } from 'lucide-react';

interface DemoModeNoticeProps {
    isVisible: boolean;
}

const DemoModeNotice: React.FC<DemoModeNoticeProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <Card className="mb-4 border-orange-200 bg-orange-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-5 w-5" />
                    Demo Mode Active
                </CardTitle>
                <CardDescription className="text-orange-700">
                    The system is currently running with sample data. To connect to your Laravel backend:
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium">Backend Setup</span>
                        </div>
                        <p className="text-xs text-orange-700">
                            Ensure your Laravel backend is running with the location tracking system installed
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium">API Connection</span>
                        </div>
                        <p className="text-xs text-orange-700">
                            Update the API_BASE URL in the component to match your backend URL
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Code className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium">Configuration</span>
                        </div>
                        <p className="text-xs text-orange-700">
                            Run the database migrations and seed the location settings table
                        </p>
                    </div>
                </div>

                <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="text-sm text-orange-800">
                        <strong>Quick Setup:</strong> In your Laravel project, run{' '}
                        <code className="bg-orange-200 px-2 py-1 rounded text-xs">
                            php artisan migrate
                        </code>{' '}
                        and{' '}
                        <code className="bg-orange-200 px-2 py-1 rounded text-xs">
                            php artisan serve
                        </code>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default DemoModeNotice;
