import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={
              <AuthenticatedRoute>
                <Login />
              </AuthenticatedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute requiredPermissions={['can_manage_employees']}>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute requiredPermissions={['can_manage_attendance']}>
                <Attendance />
              </ProtectedRoute>
            } />
            <Route path="/shifts" element={
              <ProtectedRoute requiredPermissions={['can_manage_attendance']}>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">جدولة المناوبات</h1>
                  <p className="text-muted-foreground">سيتم إضافة هذه الصفحة قريباً</p>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/payroll" element={
              <ProtectedRoute requiredPermissions={['can_view_salaries']}>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">المرتبات</h1>
                  <p className="text-muted-foreground">سيتم إضافة هذه الصفحة قريباً</p>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requiredPermissions={['can_generate_reports']}>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">التقارير</h1>
                  <p className="text-muted-foreground">سيتم إضافة هذه الصفحة قريباً</p>
                </div>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
