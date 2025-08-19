# HR System Setup Guide

## Backend Setup (Laravel)

### 1. Run Migrations
```bash
cd cargo
php artisan migrate
```

### 2. Seed HR Data
```bash
php artisan db:seed --class=HrSeeder
```

This will create:
- Default HR departments (HR, IT, Finance, Operations, Sales)
- Default HR positions with salary ranges
- Default HR admin user: `hr@cargo.com` / `password123`

### 3. Test the API
```bash
# Test HR login endpoint
curl -X POST http://localhost:8000/api/hr/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@cargo.com","password":"password123"}'
```

## Frontend Setup (React)

### 1. Install Dependencies
```bash
cd logistik-humi-rtl
npm install
```

### 2. Environment Configuration
Create a `.env` file in the frontend root:
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/hr/login` - HR user login
- `POST /api/hr/logout` - HR user logout
- `GET /api/hr/me` - Get current HR user info
- `POST /api/hr/refresh` - Refresh authentication token

### Protected Routes
All HR endpoints (except login) require:
1. Valid authentication token
2. User with ADMIN or STAFF level
3. Active HR employee record

## Security Features

- **Token-based Authentication**: Uses Laravel Sanctum
- **Role-based Access Control**: Different permissions for ADMIN vs STAFF
- **HR-specific Middleware**: Ensures only HR employees can access the system
- **Automatic Token Refresh**: Handles expired tokens gracefully
- **Permission-based UI**: Frontend shows/hides features based on user permissions

## User Levels & Permissions

### ADMIN Level
- Full access to all HR features
- Can manage employees, departments, positions
- Can view salaries and system settings
- Can generate reports and manage performance

### STAFF Level
- Limited access to HR features
- Can approve leave requests
- Can manage attendance
- Can view performance data
- Cannot access sensitive information (salaries, system settings)

## Database Structure

The HR system extends the existing user system with:
- `hr_departments` - Company departments
- `hr_positions` - Job positions with salary ranges
- `hr_employees` - Links users to HR records
- `hr_attendances` - Employee attendance tracking
- `hr_leave_requests` - Leave request management
- `hr_performance_reviews` - Employee performance evaluations

## Testing

Run the HR authentication tests:
```bash
cd cargo
php artisan test --filter=HrAuthenticationTest
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Laravel backend allows requests from the frontend domain
2. **Authentication Failures**: Check that the user has the correct level (ADMIN or STAFF)
3. **Database Errors**: Ensure all migrations have been run and the database is properly seeded

### Debug Mode

Enable debug mode in Laravel to see detailed error messages:
```env
APP_DEBUG=true
```

## Next Steps

After setting up the basic authentication:

1. **Employee Management**: Create CRUD operations for employees
2. **Attendance System**: Implement check-in/check-out functionality
3. **Leave Management**: Build leave request approval workflow
4. **Performance Reviews**: Create performance evaluation system
5. **Reporting**: Build HR analytics and reporting dashboard 