import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthenticatedRouteProps {
    children: ReactNode;
}

export default function AuthenticatedRoute({ children }: AuthenticatedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

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

    // If user is authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // If not authenticated, show the auth page
    return <>{children}</>;
} 