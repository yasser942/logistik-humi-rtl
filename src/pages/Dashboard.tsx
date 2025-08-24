import { AppLayout } from "@/components/layout/AppLayout"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { UpcomingShifts } from "@/components/dashboard/UpcomingShifts"
import { EmployeeRegistrationChart } from "@/components/dashboard/EmployeeRegistrationChart"

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground">مرحباً بك في نظام إدارة الموارد البشرية</p>
          </div>
          <div className="text-sm text-muted-foreground">
            اليوم: {new Date().toLocaleDateString('ar-EG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <DashboardStats />

        {/* Employee Registration Chart */}
        <EmployeeRegistrationChart />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <UpcomingShifts />
        </div>
      </div>
    </AppLayout>
  )
}