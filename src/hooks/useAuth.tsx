import React, { useState, useEffect, createContext, useContext } from 'react';
import { hrAuthAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    full_name: string;
    level: string;
    level_label: string;
    status: string;
    status_label: string;
    job: string;
    job_label: string;
    avatar_url: string;
    created_at: string;
    updated_at: string;
}

interface HrEmployee {
    id: number;
    employee_id: string;
    department: string;
    position: string;
    hire_date: string;
    employment_type: string;
    supervisor?: string;
}

interface Permissions {
    can_manage_employees: boolean;
    can_manage_departments: boolean;
    can_manage_positions: boolean;
    can_approve_leave: boolean;
    can_view_salaries: boolean;
    can_manage_performance: boolean;
    can_generate_reports: boolean;
    can_manage_attendance: boolean;
    can_manage_system: boolean;
}

interface AuthContextType {
    user: User | null;
    hrEmployee: HrEmployee | null;
    permissions: Permissions | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [hrEmployee, setHrEmployee] = useState<HrEmployee | null>(null);
    const [permissions, setPermissions] = useState<Permissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('hr_token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await hrAuthAPI.me();
            // The backend returns data directly without status wrapper
            if (response.user) {
                setUser(response.user);
                setHrEmployee(response.hr_employee);
                setPermissions(response.permissions);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('hr_token');
            localStorage.removeItem('hr_user');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await hrAuthAPI.login({ email, password });

            if (response.status === 'success') {
                const { user, hr_employee, token, permissions } = response;

                // Store token and user data
                localStorage.setItem('hr_token', token);
                localStorage.setItem('hr_user', JSON.stringify(user));

                // Update state
                setUser(user);
                setHrEmployee(hr_employee);
                setPermissions(permissions);
                setIsAuthenticated(true);

                // Navigate to dashboard
                navigate('/');
            } else {
                throw new Error(response.msg || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.msg || error.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await hrAuthAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and state
            localStorage.removeItem('hr_token');
            localStorage.removeItem('hr_user');
            setUser(null);
            setHrEmployee(null);
            setPermissions(null);
            setIsAuthenticated(false);

            // Navigate to login
            navigate('/login');
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value: AuthContextType = {
        user,
        hrEmployee,
        permissions,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 