import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredPermissions?: string[];
}

export default function ProtectedRoute({ children, requiredPermissions = [] }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, permissions } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check permissions if required
    if (requiredPermissions.length > 0 && permissions) {
        const hasPermission = requiredPermissions.every(permission =>
            permissions[permission as keyof typeof permissions]
        );

        if (!hasPermission) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-destructive mb-2">غير مصرح</h1>
                        <p className="text-muted-foreground">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
} 