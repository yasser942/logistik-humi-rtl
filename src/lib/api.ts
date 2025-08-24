import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({

    baseURL: import.meta.env.VITE_API_URL || 'https://guba-sy.com/api',
    //baseURL: import.meta.env.VITE_API_URL || 'http://192.168.1.109:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('hr_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, redirect to login
            localStorage.removeItem('hr_token');
            localStorage.removeItem('hr_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// HR Authentication API
export const hrAuthAPI = {
    login: async (credentials: { email: string; password: string }) => {
        const response = await api.post('/hr/login', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/hr/logout');
        return response.data;
    },

    me: async () => {
        const response = await api.get('/hr/me');
        return response.data;
    },

    refresh: async () => {
        const response = await api.post('/hr/refresh');
        return response.data;
    },
};

// HR Employees API
export const hrEmployeesAPI = {
    getAll: async (params?: any) => {
        const response = await api.get('/hr/employees', { params });
        return response.data;
    },

    // Get employees for mobile app (public access)
    getMobileEmployees: async () => {
        const response = await api.get('/hr/employees/mobile');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/hr/employees/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/hr/employees', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/hr/employees/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/hr/employees/${id}`);
        return response.data;
    },

    // Get employee registration statistics
    getRegistrationStats: async (params?: any) => {
        const response = await api.get('/hr/employees/registration-stats', { params });
        return response.data;
    },
};

// HR Departments API
export const hrDepartmentsAPI = {
    getAll: async () => {
        const response = await api.get('/hr/departments');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/hr/departments/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/hr/departments', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/hr/departments/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/hr/departments/${id}`);
        return response.data;
    },

    // Get departments with pagination and search
    getPaginated: async (params?: any) => {
        const response = await api.get('/hr/departments', { params });
        return response.data;
    },
};

// HR Cities API
export const hrCitiesAPI = {
    getAll: async () => {
        const response = await api.get('/hr/cities');
        return response.data;
    },
};

// HR Branches API
export const hrBranchesAPI = {
    getAll: async () => {
        const response = await api.get('/hr/branches');
        return response.data;
    },
};

// HR Attendance API
export const hrAttendanceAPI = {
    // Admin/Web Dashboard
    getAll: async (params?: any) => {
        const response = await api.get('/hr/attendances', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/hr/attendances/${id}`);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/hr/attendances/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/hr/attendances/${id}`);
        return response.data;
    },

    getStatistics: async (params?: any) => {
        const response = await api.get('/hr/attendances/statistics', { params });
        return response.data;
    },

    // Mobile App Integration
    checkIn: async (data: any) => {
        const response = await api.post('/hr/attendance/checkin', data);
        return response.data;
    },

    checkOut: async (data: any) => {
        const response = await api.post('/hr/attendance/checkout', data);
        return response.data;
    },

    getCurrentStatus: async (employeeId: string) => {
        const response = await api.get('/hr/attendance/status', { params: { employee_id: employeeId } });
        return response.data;
    },

    getEmployeeHistory: async (employeeId: string, params?: any) => {
        const response = await api.get('/hr/attendance/history', {
            params: { employee_id: employeeId, ...params }
        });
        return response.data;
    },

    getBranchInfo: async (employeeId: string) => {
        const response = await api.get('/hr/attendance/branch-info', {
            params: { employee_id: employeeId }
        });
        return response.data;
    },
};

// HR Positions API
export const hrPositionsAPI = {
    getAll: async () => {
        const response = await api.get('/hr/positions');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/hr/positions/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/hr/positions', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/hr/positions/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/hr/positions/${id}`);
        return response.data;
    },

    // Get positions with pagination and search
    getPaginated: async (params?: any) => {
        const response = await api.get('/hr/positions', { params });
        return response.data;
    },
};

// HR Leave Requests API
export const hrLeaveRequestsAPI = {
    getAll: async () => {
        const response = await api.get('/hr/leave-requests');
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/hr/leave-requests', data);
        return response.data;
    },

    approve: async (id: string, data: any) => {
        const response = await api.post(`/hr/leave-requests/${id}/approve`, data);
        return response.data;
    },

    reject: async (id: string, data: any) => {
        const response = await api.post(`/hr/leave-requests/${id}/reject`, data);
        return response.data;
    },
};

export default api; 